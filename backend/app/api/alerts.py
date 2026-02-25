"""Alert endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.alert_service import AlertService
from app.schemas.alert import PriceAlertCreate, PriceAlertOut
from app.api.deps import get_current_user_id

router = APIRouter()


@router.get("/", response_model=list[PriceAlertOut])
async def list_alerts(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all active price alerts for the current user."""
    service = AlertService(db)
    return await service.get_user_alerts(user_id)


@router.post("/", response_model=PriceAlertOut, status_code=status.HTTP_201_CREATED)
async def create_alert(
    data: PriceAlertCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a price alert for a product."""
    service = AlertService(db)
    return await service.create_alert(user_id, data)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a price alert."""
    service = AlertService(db)
    await service.delete_alert(alert_id, user_id)
