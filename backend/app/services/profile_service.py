"""Profile & address management service."""

from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.user import User, UserAddress
from app.schemas.user import UserUpdate, UserAddressCreate, UserAddressUpdate


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: UUID):
        """Return user with all addresses."""
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.addresses))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def update_profile(self, user_id: UUID, data: UserUpdate):
        """Update user's personal info (name, zip_code)."""
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.addresses))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        await self.db.flush()
        return user

    # ── Addresses ──

    async def add_address(self, user_id: UUID, data: UserAddressCreate):
        """Create a new address for the user."""
        # If this address is default, unset any existing defaults
        if data.is_default:
            await self._clear_defaults(user_id)

        address = UserAddress(
            user_id=user_id,
            **data.model_dump(),
        )
        self.db.add(address)
        await self.db.flush()
        await self.db.refresh(address)
        return address

    async def update_address(self, user_id: UUID, address_id: UUID, data: UserAddressUpdate):
        """Edit an existing address."""
        address = await self._get_user_address(user_id, address_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(address, field, value)

        await self.db.flush()
        await self.db.refresh(address)
        return address

    async def delete_address(self, user_id: UUID, address_id: UUID):
        """Remove an address."""
        address = await self._get_user_address(user_id, address_id)
        await self.db.delete(address)
        await self.db.flush()

    async def set_default_address(self, user_id: UUID, address_id: UUID):
        """Mark an address as the default and unset others."""
        address = await self._get_user_address(user_id, address_id)
        await self._clear_defaults(user_id)
        address.is_default = True
        await self.db.flush()
        await self.db.refresh(address)
        return address

    async def get_addresses(self, user_id: UUID) -> list[UserAddress]:
        """List all addresses for a user."""
        result = await self.db.execute(
            select(UserAddress)
            .where(UserAddress.user_id == user_id)
            .order_by(UserAddress.is_default.desc(), UserAddress.created_at)
        )
        return list(result.scalars().all())

    # ── Internal helpers ──

    async def _get_user_address(self, user_id: UUID, address_id: UUID) -> UserAddress:
        result = await self.db.execute(
            select(UserAddress).where(
                UserAddress.id == address_id,
                UserAddress.user_id == user_id,
            )
        )
        address = result.scalar_one_or_none()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        return address

    async def _clear_defaults(self, user_id: UUID):
        await self.db.execute(
            update(UserAddress)
            .where(UserAddress.user_id == user_id, UserAddress.is_default == True)
            .values(is_default=False)
        )
