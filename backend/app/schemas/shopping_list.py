"""Shopping list schemas."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class ShoppingListItemCreate(BaseModel):
    product_id: UUID | None = None
    custom_name: str | None = None
    quantity: int = 1


class ShoppingListItemOut(BaseModel):
    id: UUID
    product_id: UUID | None = None
    custom_name: str | None = None
    product_name: str | None = None
    product_image_url: str | None = None
    quantity: int
    is_checked: bool = False
    estimated_price: float | None = None
    cheapest_store: str | None = None

    model_config = {"from_attributes": True}


class ShoppingListCreate(BaseModel):
    name: str = "Minha Lista"
    notes: str | None = None
    items: list[ShoppingListItemCreate] = []


class ShoppingListOut(BaseModel):
    id: UUID
    name: str
    notes: str | None = None
    items: list[ShoppingListItemOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StoreCostBreakdown(BaseModel):
    chain_name: str
    chain_slug: str
    chain_logo_url: str | None = None
    store_name: str
    store_address: str
    store_city: str
    distance_km: float | None = None
    total_cost: float
    items_available: int
    items_missing: int


class ShoppingListWithCosts(BaseModel):
    """Shopping list with cost optimization per store."""
    list: ShoppingListOut
    store_costs: list[StoreCostBreakdown]
    cheapest_single_store: StoreCostBreakdown | None = None
    estimated_savings: float | None = None
