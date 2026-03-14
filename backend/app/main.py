from contextlib import asynccontextmanager
import logging

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

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info(
        "[BOOT] environment=%s groq_key=%s google_key=%s cors_origins=%s session_store=%s",
        settings.ENVIRONMENT,
        "set" if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "placeholder_key" else "missing",
        "set" if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "placeholder_key" else "missing",
        settings.cors_origins_list() or ["<empty>"],
        settings.SESSION_STORE_TYPE,
    )
    if settings.ENVIRONMENT == "production" and (not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key"):
        logger.warning("[BOOT] GROQ_API_KEY missing in production")
    if settings.ENVIRONMENT == "production" and not settings.cors_origins_list():
        logger.warning("[BOOT] CORS_ORIGINS missing in production")
    from app.services.session_store import store
    await store.initialize()
    yield


app = FastAPI(title="CV Builder IA API", lifespan=lifespan)

def _build_allowed_origins() -> list[str]:
    configured = settings.cors_origins_list()

    if settings.ENVIRONMENT == "production":
        return configured or ["https://cv-convos.vercel.app"]

    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    allowed = defaults[:]
    for origin in configured:
        if origin not in allowed:
            allowed.append(origin)
    return allowed


ALLOWED_ORIGINS = _build_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
