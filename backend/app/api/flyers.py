"""Flyer endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.flyer_service import FlyerService
from app.schemas.flyer import FlyerOut

router = APIRouter()


@router.get("/", response_model=list[FlyerOut])
async def list_active_flyers(
    chain_slug: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all currently active flyers (encartes)."""
    service = FlyerService(db)
    return await service.list_active_flyers(chain_slug=chain_slug)


@router.get("/{flyer_id}", response_model=FlyerOut)
async def get_flyer(
    flyer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific flyer with all its items."""
    service = FlyerService(db)
    return await service.get_flyer(flyer_id)
