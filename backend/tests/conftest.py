"""Pytest configuration and shared fixtures."""

import asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.core.database import get_db
from app.main import app


# Use SQLite in-memory for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def async_db():
    """Create test database session."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        future=True,
    )

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
def client(async_db):
    """Create test client."""
    async def override_get_db():
        yield async_db

    app.dependency_overrides[get_db] = override_get_db

    from fastapi.testclient import TestClient
    return TestClient(app)


@pytest.fixture
def test_user_data():
    """Standard test user data."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123",
        "name": "Test User",
        "zip_code": "12345-678",
    }


@pytest.fixture
def test_user_weak_password():
    """Test user with weak password."""
    return {
        "email": "test@example.com",
        "password": "weak",  # Too short, no uppercase, no digit
        "name": "Test User",
    }
