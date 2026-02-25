"""Auth service — registration and login."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, UserOut
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserCreate) -> Token:
        # Check if email exists
        existing = await self.db.execute(
            select(User).where(User.email == data.email.lower())
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = User(
            email=data.email.lower(),
            hashed_password=hash_password(data.password),
            name=data.name,
            zip_code=data.zip_code,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        token = create_access_token(data={"sub": str(user.id)})
        return Token(
            access_token=token,
            user=UserOut.model_validate(user),
        )

    async def login(self, data: UserLogin) -> Token:
        result = await self.db.execute(
            select(User).where(User.email == data.email.lower())
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token(data={"sub": str(user.id)})
        return Token(
            access_token=token,
            user=UserOut.model_validate(user),
        )
