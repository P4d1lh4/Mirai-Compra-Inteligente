"""Price comparison endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.price_service import PriceService
from app.schemas.price import PriceComparisonResult

router = APIRouter()


@router.get("/compare/{product_id}", response_model=PriceComparisonResult)
async def compare_prices(
    product_id: UUID,
    lat: float | None = Query(None),
    lng: float | None = Query(None),
    radius_km: float = Query(10.0, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a horizontal price comparison for a product across all stores.
    Sorted by price (cheapest first). Includes distance if coordinates provided.
    """
    service = PriceService(db)
    return await service.compare_prices(
        product_id=product_id,
        latitude=lat,
        longitude=lng,
        radius_km=radius_km,
    )


@router.get("/history/{product_id}")
async def price_history(
    product_id: UUID,
    store_id: UUID | None = Query(None),
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
):
    """Get price history for a product (optionally filtered by store)."""
    service = PriceService(db)
    return await service.get_price_history(product_id, store_id=store_id, days=days)
