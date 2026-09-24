from fastapi import Depends, FastAPI

app = FastAPI(title="Energy Calendar")

@app.get("/api/health")
async def health():
    return {"status": "ok"}