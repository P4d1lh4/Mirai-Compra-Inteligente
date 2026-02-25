"""Flyer schemas."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.schemas.store import StoreChainOut


class FlyerItemOut(BaseModel):
    id: UUID
    raw_name: str
    description: str | None = None
    price: float
    original_price: float | None = None
    image_url: str | None = None
    product_id: UUID | None = None

    model_config = {"from_attributes": True}


class FlyerOut(BaseModel):
    id: UUID
    title: str
    image_url: str | None = None
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    chain: StoreChainOut
    items: list[FlyerItemOut] = []

    model_config = {"from_attributes": True}
