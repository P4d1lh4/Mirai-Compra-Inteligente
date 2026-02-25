"""Store endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.store_service import StoreService
from app.schemas.store import StoreChainOut, StoreWithDistance

router = APIRouter()


@router.get("/chains", response_model=list[StoreChainOut])
async def list_chains(db: AsyncSession = Depends(get_db)):
    """List all store chains."""
    service = StoreService(db)
    return await service.list_chains()


@router.get("/nearby", response_model=list[StoreWithDistance])
async def list_nearby_stores(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(10.0, ge=1, le=100),
    chain_slug: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Find stores near a location, sorted by distance."""
    service = StoreService(db)
    return await service.find_nearby(
        latitude=lat, longitude=lng, radius_km=radius_km, chain_slug=chain_slug
    )
