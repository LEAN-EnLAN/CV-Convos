from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
import uvicorn

from contextlib import asynccontextmanager
from app.core.logging import setup_logging

from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    yield

app = FastAPI(title="CV Builder IA API", lifespan=lifespan)

# Configure CORS
origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Force wildcard for now to debug
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# Include Routers
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "CV Builder IA Backend is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
