from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.cache import init_cache
from app.api.v1.races import router as races_router

app=FastAPI(title="ApexData")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_cache()
app.include_router(races_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}