from fastapi import Depends, FastAPI
from app.api.routes import auth, events

app = FastAPI(title="Energy Calendar")

app.include_router(auth.router)
app.include_router(events.router)

@app.get("/api/health")
async def health():
    return {"status": "ok"}