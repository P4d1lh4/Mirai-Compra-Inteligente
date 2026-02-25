"""Profile & address management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user_id
from app.services.profile_service import ProfileService
from app.schemas.user import (
    UserUpdate, UserProfileOut,
    UserAddressCreate, UserAddressUpdate, UserAddressOut,
)

router = APIRouter()


@router.get("", response_model=UserProfileOut)
async def get_profile(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's profile with all addresses."""
    service = ProfileService(db)
    return await service.get_profile(user_id)


@router.put("", response_model=UserProfileOut)
async def update_profile(
    data: UserUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's personal info."""
    service = ProfileService(db)
    return await service.update_profile(user_id, data)


@router.get("/addresses", response_model=list[UserAddressOut])
async def list_addresses(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all addresses for the current user."""
    service = ProfileService(db)
    return await service.get_addresses(user_id)


@router.post("/addresses", response_model=UserAddressOut, status_code=201)
async def add_address(
    data: UserAddressCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Add a new address."""
    service = ProfileService(db)
    return await service.add_address(user_id, data)


@router.put("/addresses/{address_id}", response_model=UserAddressOut)
async def update_address(
    address_id: UUID,
    data: UserAddressUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Edit an existing address."""
    service = ProfileService(db)
    return await service.update_address(user_id, address_id, data)


@router.delete("/addresses/{address_id}", status_code=204)
async def delete_address(
    address_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Remove an address."""
    service = ProfileService(db)
    await service.delete_address(user_id, address_id)


@router.patch("/addresses/{address_id}/default", response_model=UserAddressOut)
async def set_default_address(
    address_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Mark an address as the default."""
    service = ProfileService(db)
    return await service.set_default_address(user_id, address_id)
