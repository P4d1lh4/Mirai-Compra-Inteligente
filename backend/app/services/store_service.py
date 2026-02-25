"""Store service."""

import math

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.store import Store, StoreChain


class StoreService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_chains(self) -> list:
        result = await self.db.execute(
            select(StoreChain).order_by(StoreChain.name)
        )
        return result.scalars().all()

    async def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        chain_slug: str | None = None,
    ) -> list:
        """Find stores within a radius, sorted by distance."""
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * max(math.cos(math.radians(latitude)), 0.01))

        q = (
            select(Store)
            .options(selectinload(Store.chain))
            .where(
                and_(
                    Store.latitude.between(latitude - lat_delta, latitude + lat_delta),
                    Store.longitude.between(longitude - lng_delta, longitude + lng_delta),
                    Store.is_active == True,
                )
            )
        )

        if chain_slug:
            q = q.join(Store.chain).where(StoreChain.slug == chain_slug)

        result = await self.db.execute(q)
        stores = result.scalars().all()

        # Calculate distances and filter by actual radius
        stores_with_distance = []
        for store in stores:
            dist = self._haversine(latitude, longitude, store.latitude, store.longitude)
            if dist <= radius_km:
                stores_with_distance.append({
                    "id": store.id,
                    "name": store.name,
                    "address": store.address,
                    "city": store.city,
                    "state": store.state,
                    "zip_code": store.zip_code,
                    "latitude": store.latitude,
                    "longitude": store.longitude,
                    "phone": store.phone,
                    "chain": store.chain,
                    "distance_km": round(dist, 1),
                })

        stores_with_distance.sort(key=lambda s: s["distance_km"])
        return stores_with_distance

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
