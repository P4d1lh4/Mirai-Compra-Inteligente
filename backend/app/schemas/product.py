"""Product schemas."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: UUID
    name: str
    slug: str
    icon: str | None = None
    parent_id: UUID | None = None

    model_config = {"from_attributes": True}


class ProductSearch(BaseModel):
    query: str
    category_slug: str | None = None
    brand: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius_km: float = 10.0
    page: int = 1
    page_size: int = 20


class ProductOut(BaseModel):
    id: UUID
    name: str
    brand: str | None = None
    ean: str | None = None
    description: str | None = None
    image_url: str | None = None
    unit: str | None = None
    category: CategoryOut | None = None
    min_price: float | None = None
    max_price: float | None = None
    store_count: int = 0

    model_config = {"from_attributes": True}


class ProductWithPrices(BaseModel):
    id: UUID
    name: str
    brand: str | None = None
    ean: str | None = None
    description: str | None = None
    image_url: str | None = None
    unit: str | None = None
    category: CategoryOut | None = None
    prices: list["PriceComparisonItemInline"] = []

    model_config = {"from_attributes": True}


class PriceComparisonItemInline(BaseModel):
    """Price entry with store info inlined — used inside ProductWithPrices."""
    price: float
    original_price: float | None = None
    is_promotion: bool = False
    promotion_label: str | None = None
    is_online: bool = False
    ecommerce_url: str | None = None
    store_name: str
    chain_name: str
    chain_slug: str
    chain_logo_url: str | None = None
    chain_color_hex: str | None = None
    store_address: str
    store_city: str
    distance_km: float | None = None
    seen_at: datetime

    model_config = {"from_attributes": True}
