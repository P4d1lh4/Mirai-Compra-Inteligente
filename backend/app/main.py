"""SmartCart Backend — FastAPI Application."""

import sys
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

# Fix for Windows loop policy with asyncpg if needed
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.core.config import settings
from app.api import router as api_router

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    from app.core.database import engine
    from app.models import Base

    if settings.DEBUG:
        try:
            async with engine.begin() as conn:
                # In dev, create tables automatically
                await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            import logging
            logging.warning(f"DB auto-create tables failed (non-fatal): {e}")
    yield
    # Shutdown
    try:
        await engine.dispose()
    except Exception:
        pass


app = FastAPI(
    title="SmartCart API",
    description="API de comparação de preços e economia inteligente para o consumidor brasileiro.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3010"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
