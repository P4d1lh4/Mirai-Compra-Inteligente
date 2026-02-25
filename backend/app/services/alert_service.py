"""Alert service."""

from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.alert import PriceAlert
from app.models.product import Product
from app.models.price import PriceEntry
from app.schemas.alert import PriceAlertCreate


class AlertService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_alerts(self, user_id: UUID) -> list:
        result = await self.db.execute(
            select(PriceAlert)
            .options(selectinload(PriceAlert.product))
            .where(and_(PriceAlert.user_id == user_id, PriceAlert.is_active == True))
            .order_by(PriceAlert.created_at.desc())
        )
        alerts = result.scalars().all()

        output = []
        for alert in alerts:
            output.append({
                "id": alert.id,
                "product_id": alert.product_id,
                "product_name": alert.product.name if alert.product else None,
                "product_image_url": alert.product.image_url if alert.product else None,
                "target_price": alert.target_price,
                "alert_on_any_drop": alert.alert_on_any_drop,
                "is_active": alert.is_active,
                "last_known_price": alert.last_known_price,
                "last_triggered_at": alert.last_triggered_at,
                "created_at": alert.created_at,
            })
        return output

    async def create_alert(self, user_id: UUID, data: PriceAlertCreate):
        # Check product exists
        prod_result = await self.db.execute(
            select(Product).where(Product.id == data.product_id)
        )
        product = prod_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Get current cheapest price
        price_result = await self.db.execute(
            select(PriceEntry.price)
            .where(and_(
                PriceEntry.product_id == data.product_id,
                PriceEntry.is_current == True,
            ))
            .order_by(PriceEntry.price.asc())
            .limit(1)
        )
        current_price = price_result.scalar_one_or_none()

        alert = PriceAlert(
            user_id=user_id,
            product_id=data.product_id,
            target_price=data.target_price,
            alert_on_any_drop=data.alert_on_any_drop,
            notification_method=data.notification_method,
            last_known_price=current_price,
        )
        self.db.add(alert)
        await self.db.flush()
        await self.db.refresh(alert)

        return {
            "id": alert.id,
            "product_id": alert.product_id,
            "product_name": product.name,
            "product_image_url": product.image_url,
            "target_price": alert.target_price,
            "alert_on_any_drop": alert.alert_on_any_drop,
            "is_active": alert.is_active,
            "last_known_price": alert.last_known_price,
            "last_triggered_at": alert.last_triggered_at,
            "created_at": alert.created_at,
        }

    async def delete_alert(self, alert_id: UUID, user_id: UUID):
        result = await self.db.execute(
            select(PriceAlert).where(
                and_(PriceAlert.id == alert_id, PriceAlert.user_id == user_id)
            )
        )
        alert = result.scalar_one_or_none()
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        alert.is_active = False
        await self.db.flush()
