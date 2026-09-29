from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from pydantic import AwareDatetime
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models import Event
from app.schemas.event import EventCreate, EventRead, EventUpdate

router = APIRouter(prefix="/api/events", tags=["events"])

MAX_RANGE = timedelta(days=92)


async def get_owned_event(db: DbSession, event_id: int, user: CurrentUser) -> Event:
    """Load an event that belongs to the user, or raise 404."""
    event = await db.scalar(
        select(Event).where(Event.id == event_id, Event.owner_id == user.id)
    )
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    return event


@router.get("", response_model=list[EventRead])
async def list_events(start: AwareDatetime, end: AwareDatetime, user: CurrentUser, db: DbSession):
    """List the current user's events that overlap the given time range."""
    if start >= end:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "start must be before end")
    if end - start > MAX_RANGE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Range cannot exceed 92 days")

    events = await db.scalars(
        select(Event)
        .where(
            Event.owner_id == user.id,
            Event.starts_at < end,
            Event.ends_at > start,
        )
        .order_by(Event.starts_at)
    )
    return list(events)


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
async def create_event(data: EventCreate, user: CurrentUser, db: DbSession):
    """Create a new event for the current user."""
    event = Event(**data.model_dump(), owner_id=user.id)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: int, user: CurrentUser, db: DbSession):
    """Get one of the current user's events."""
    return await get_owned_event(db, event_id, user)


@router.patch("/{event_id}", response_model=EventRead)
async def update_event(event_id: int, data: EventUpdate, user: CurrentUser, db: DbSession):
    """Update only the fields that were sent."""
    event = await get_owned_event(db, event_id, user)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    if event.ends_at <= event.starts_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "ends_at must be after starts_at")

    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: int, user: CurrentUser, db: DbSession):
    """Delete one of the current user's events."""
    event = await get_owned_event(db, event_id, user)
    await db.delete(event)
    await db.commit()