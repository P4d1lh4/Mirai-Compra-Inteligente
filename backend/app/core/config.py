"""Application configuration from environment variables."""

from pydantic_settings import BaseSettings
from pydantic import field_validator
import sys


class Settings(BaseSettings):
    # App
    SMARTCART_ENV: str = "development"
    DEBUG: bool = True

    # Database – defaults to SQLite for zero-config local dev
    DATABASE_URL: str = "sqlite+aiosqlite:///./smartcart.db"
    DATABASE_URL_SYNC: str = "sqlite:///./smartcart.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Auth
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # SerpApi (Google Shopping)
    SERPAPI_KEY: str = ""

    # Google AI (Gemini)
    GOOGLE_AI_API_KEY: str = ""

    # Groq (LLM gratuito)
    GROQ_API_KEY: str = ""

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """In production, SECRET_KEY must not be the default value."""
        debug = info.data.get("DEBUG", True)
        if not debug and v == "dev-secret-key-change-in-production":
            raise ValueError(
                "SECRET_KEY must be changed in production. "
                "Set a strong SECRET_KEY in your .env file."
            )
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
