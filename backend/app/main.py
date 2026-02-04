from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.api.endpoints import router as api_router
from app.core.logging import setup_logging
from app.core.limiter import limiter
from app.core.exceptions import build_error_detail, normalize_error_detail
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    yield


app = FastAPI(title="CV Builder IA API", lifespan=lifespan)

# Configure CORS
ALLOWED_ORIGINS = [
    "https://cv-convos.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add CORS_ORIGINS from settings if not already in the list
if settings.CORS_ORIGINS:
    for origin in settings.CORS_ORIGINS.split(","):
        origin = origin.strip()
        if origin and origin not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if settings.ENVIRONMENT == "development" else ["https://cv-convos.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rate limit error handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content=build_error_detail(
            "rate_limit_exceeded",
            "Demasiadas solicitudes. Por favor, intentá nuevamente más tarde.",
        ),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = normalize_error_detail(exc.detail, exc.status_code)
    return JSONResponse(status_code=exc.status_code, content=detail)


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
