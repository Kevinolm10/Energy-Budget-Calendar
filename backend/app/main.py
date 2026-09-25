from fastapi import Depends, FastAPI
from app.api.routes import auth

app = FastAPI(title="Energy Calendar")

app.include_router(auth.router)

@app.get("/api/health")
async def health():
    return {"status": "ok"}