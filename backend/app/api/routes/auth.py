import jwt
from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models import User
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserRead

router = APIRouter(prefix="/api/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, user_id: int) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=create_refresh_token(user_id),
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.refresh_token_days * 24 * 60 * 60,
        path="/api/auth",
    )


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: DbSession):
    email = data.email.lower()
    if await db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(email=email, hashed_password=hash_password(data.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, response: Response, db: DbSession):
    user = await db.scalar(select(User).where(User.email == data.email.lower()))
    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    _set_refresh_cookie(response, user.id)
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request, response: Response, db: DbSession):
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise unauthorized
    try:
        user_id = decode_token(token, "refresh")
    except jwt.InvalidTokenError:
        raise unauthorized from None
    if await db.get(User, user_id) is None:
        raise unauthorized

    _set_refresh_cookie(response, user_id)  # rotate: issue a fresh refresh token too
    return TokenResponse(access_token=create_access_token(user_id))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    response.delete_cookie(REFRESH_COOKIE, path="/api/auth")


@router.get("/me", response_model=UserRead)
async def me(user: CurrentUser):
    return user