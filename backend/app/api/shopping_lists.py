"""Shopping list endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.shopping_list_service import ShoppingListService
from app.schemas.shopping_list import (
    ShoppingListCreate, ShoppingListOut, ShoppingListItemCreate,
    ShoppingListItemOut, ShoppingListWithCosts,
)
from app.api.deps import get_current_user_id

router = APIRouter()


@router.get("/", response_model=list[ShoppingListOut])
async def list_shopping_lists(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all shopping lists for the current user."""
    service = ShoppingListService(db)
    return await service.get_user_lists(user_id)


@router.post("/", response_model=ShoppingListOut, status_code=status.HTTP_201_CREATED)
async def create_shopping_list(
    data: ShoppingListCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new shopping list."""
    service = ShoppingListService(db)
    return await service.create_list(user_id, data)


@router.get("/{list_id}", response_model=ShoppingListOut)
async def get_shopping_list(
    list_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific shopping list."""
    service = ShoppingListService(db)
    return await service.get_list(list_id, user_id)


@router.post("/{list_id}/items", response_model=ShoppingListItemOut, status_code=status.HTTP_201_CREATED)
async def add_item_to_list(
    list_id: UUID,
    data: ShoppingListItemCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Add an item to a shopping list."""
    service = ShoppingListService(db)
    return await service.add_item(list_id, user_id, data)


@router.delete("/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item(
    list_id: UUID,
    item_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Remove an item from a shopping list."""
    service = ShoppingListService(db)
    await service.remove_item(list_id, item_id, user_id)


@router.patch("/{list_id}/items/{item_id}/toggle")
async def toggle_item_checked(
    list_id: UUID,
    item_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Toggle the checked state of a list item."""
    service = ShoppingListService(db)
    return await service.toggle_item(list_id, item_id, user_id)


@router.get("/{list_id}/optimize", response_model=ShoppingListWithCosts)
async def optimize_list(
    list_id: UUID,
    lat: float | None = None,
    lng: float | None = None,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Calculate cheapest stores for a shopping list."""
    service = ShoppingListService(db)
    return await service.optimize_list(list_id, user_id, latitude=lat, longitude=lng)
