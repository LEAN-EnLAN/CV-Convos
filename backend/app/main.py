from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
from app.api.endpoints import router as api_router
import uvicorn

from contextlib import asynccontextmanager
from app.core.logging import setup_logging
from app.core.limiter import limiter
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    yield


app = FastAPI(title="CV Builder IA API", lifespan=lifespan)

# Configure CORS for production
ALLOWED_ORIGINS = [
    "https://cv-convos.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if settings.ENVIRONMENT == "development" else ["https://cv-convos.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Rate limit error handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


# Include Routers
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CV Builder IA Backend is running"}


@app.get("/ping")
@limiter.limit("5/minute")
async def ping(request: Request):
    return {"status": "ok", "message": "pong"}


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
