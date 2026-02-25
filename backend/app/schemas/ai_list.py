"""AI-generated shopping list schemas."""

from pydantic import BaseModel, Field


class AIListRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=3,
        max_length=500,
        examples=["Lista de churrasco para 10 pessoas"],
    )


class AIListItemOut(BaseModel):
    name: str
    quantity: int = 1
    estimated_price: float | None = None


class AIListResponse(BaseModel):
    name: str
    items: list[AIListItemOut]
