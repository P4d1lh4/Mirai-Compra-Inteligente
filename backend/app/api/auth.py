"""Auth endpoints (register, login)."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, Token, UserOut

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(request: Request, data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Rate limit: 5 registrations per hour per IP
    await request.app.state.limiter.acheck(request, "5/hour")
    service = AuthService(db)
    return await service.register(data)


@router.post("/login", response_model=Token)
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and get an access token."""
    # Rate limit: 10 login attempts per hour per IP
    await request.app.state.limiter.acheck(request, "10/hour")
    service = AuthService(db)
    return await service.login(data)
