"""Store schemas."""

from uuid import UUID
from pydantic import BaseModel


class StoreChainOut(BaseModel):
    id: UUID
    name: str
    slug: str
    logo_url: str | None = None
    website_url: str | None = None
    has_ecommerce: bool = False
    color_hex: str | None = None

    model_config = {"from_attributes": True}


class StoreOut(BaseModel):
    id: UUID
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    latitude: float
    longitude: float
    phone: str | None = None
    chain: StoreChainOut

    model_config = {"from_attributes": True}


class StoreWithDistance(StoreOut):
    distance_km: float | None = None
