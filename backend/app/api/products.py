"""Product search and detail endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.product_service import ProductService
from app.schemas.product import ProductOut, ProductWithPrices, CategoryOut
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("/search", response_model=PaginatedResponse[ProductOut])
async def search_products(
    q: str = Query(..., min_length=2, description="Search query"),
    category: str | None = Query(None, description="Category slug filter"),
    brand: str | None = Query(None),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    lat: float | None = Query(None, description="User latitude"),
    lng: float | None = Query(None, description="User longitude"),
    radius_km: float = Query(10.0, ge=1, le=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Search products across all stores. Returns products with min/max prices
    and the number of stores offering each product.
    """
    service = ProductService(db)
    return await service.search_products(
        query=q,
        category_slug=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        latitude=lat,
        longitude=lng,
        radius_km=radius_km,
        page=page,
        page_size=page_size,
    )


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    """List all product categories."""
    service = ProductService(db)
    return await service.list_categories()


@router.get("/{product_id}", response_model=ProductWithPrices)
async def get_product_with_prices(
    product_id: UUID,
    lat: float | None = Query(None),
    lng: float | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a product with all current prices across stores,
    sorted by price (cheapest first). Includes distance if lat/lng provided.
    """
    service = ProductService(db)
    return await service.get_product_with_prices(product_id, latitude=lat, longitude=lng)
