"""Alert schemas."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class PriceAlertCreate(BaseModel):
    product_id: UUID
    target_price: float | None = None
    alert_on_any_drop: bool = True
    notification_method: str = "push"


class PriceAlertOut(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str | None = None
    product_image_url: str | None = None
    target_price: float | None = None
    alert_on_any_drop: bool
    is_active: bool
    last_known_price: float | None = None
    last_triggered_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
