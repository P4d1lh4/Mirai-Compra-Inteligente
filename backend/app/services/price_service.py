"""Price comparison and history service."""

import math
from uuid import UUID
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.price import PriceEntry
from app.models.product import Product
from app.models.store import Store, StoreChain


class PriceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def compare_prices(
        self,
        product_id: UUID,
        latitude: float | None = None,
        longitude: float | None = None,
        radius_km: float = 10.0,
    ):
        """Get horizontal price comparison across all stores for a product."""
        # Get product
        prod_result = await self.db.execute(
            select(Product).where(Product.id == product_id)
        )
        product = prod_result.scalar_one_or_none()
        if not product:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Product not found")

        # Get current prices with store info
        q = (
            select(PriceEntry, Store, StoreChain)
            .join(PriceEntry.store)
            .join(Store.chain)
            .where(
                and_(
                    PriceEntry.product_id == product_id,
                    PriceEntry.is_current == True,
                )
            )
            .order_by(PriceEntry.price.asc())
        )

        result = await self.db.execute(q)
        rows = result.all()

        prices = []
        for entry, store, chain in rows:
            distance = None
            if latitude and longitude:
                distance = self._haversine(latitude, longitude, store.latitude, store.longitude)
                if distance > radius_km:
                    continue

            prices.append({
                "price": entry.price,
                "original_price": entry.original_price,
                "is_promotion": entry.is_promotion,
                "promotion_label": entry.promotion_label,
                "is_online": entry.is_online,
                "ecommerce_url": entry.ecommerce_url,
                "store_id": store.id,
                "store_name": store.name,
                "store_address": store.address,
                "store_city": store.city,
                "store_latitude": store.latitude,
                "store_longitude": store.longitude,
                "chain": chain,
                "distance_km": round(distance, 1) if distance else None,
                "seen_at": entry.seen_at,
            })

        cheapest = min((p["price"] for p in prices), default=None)
        most_expensive = max((p["price"] for p in prices), default=None)

        return {
            "product_id": product.id,
            "product_name": product.name,
            "product_brand": product.brand,
            "product_image_url": product.image_url,
            "product_unit": product.unit,
            "prices": prices,
            "cheapest_price": cheapest,
            "most_expensive_price": most_expensive,
            "savings_potential": round(most_expensive - cheapest, 2) if cheapest and most_expensive else None,
        }

    async def get_price_history(
        self,
        product_id: UUID,
        store_id: UUID | None = None,
        days: int = 30,
    ):
        """Get price history for a product."""
        since = datetime.now(timezone.utc) - timedelta(days=days)

        q = (
            select(PriceEntry, Store, StoreChain)
            .join(PriceEntry.store)
            .join(Store.chain)
            .where(
                and_(
                    PriceEntry.product_id == product_id,
                    PriceEntry.seen_at >= since,
                )
            )
            .order_by(PriceEntry.seen_at.asc())
        )

        if store_id:
            q = q.where(PriceEntry.store_id == store_id)

        result = await self.db.execute(q)
        rows = result.all()

        history = []
        for entry, store, chain in rows:
            history.append({
                "price": entry.price,
                "date": entry.seen_at.isoformat(),
                "store_name": store.name,
                "chain_name": chain.name,
                "chain_slug": chain.slug,
                "is_promotion": entry.is_promotion,
            })

        return {"product_id": str(product_id), "days": days, "entries": history}

    @staticmethod
    def _haversine(lat1, lon1, lat2, lon2) -> float:
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
