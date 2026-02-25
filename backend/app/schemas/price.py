"""Price schemas."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.schemas.store import StoreChainOut


class PriceEntryOut(BaseModel):
    id: UUID
    price: float
    original_price: float | None = None
    is_promotion: bool = False
    promotion_label: str | None = None
    is_online: bool = False
    ecommerce_url: str | None = None
    source: str
    seen_at: datetime

    model_config = {"from_attributes": True}


class PriceComparisonItem(BaseModel):
    """A price for a product at a specific store, used for horizontal comparison."""
    price: float
    original_price: float | None = None
    is_promotion: bool = False
    promotion_label: str | None = None
    is_online: bool = False
    ecommerce_url: str | None = None
    store_id: UUID
    store_name: str
    store_address: str
    store_city: str
    store_latitude: float
    store_longitude: float
    chain: StoreChainOut
    distance_km: float | None = None
    seen_at: datetime

    model_config = {"from_attributes": True}


class PriceComparisonResult(BaseModel):
    """Full comparison result for a product."""
    product_id: UUID
    product_name: str
    product_brand: str | None = None
    product_image_url: str | None = None
    product_unit: str | None = None
    prices: list[PriceComparisonItem]
    cheapest_price: float | None = None
    most_expensive_price: float | None = None
    savings_potential: float | None = None  # max - min
