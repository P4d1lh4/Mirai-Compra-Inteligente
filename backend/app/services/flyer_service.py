"""Flyer service."""

from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.flyer import Flyer, FlyerItem
from app.models.store import StoreChain


class FlyerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_active_flyers(self, chain_slug: str | None = None) -> list:
        now = datetime.now(timezone.utc)
        q = (
            select(Flyer)
            .options(
                selectinload(Flyer.chain),
                selectinload(Flyer.items),
            )
            .where(
                and_(
                    Flyer.is_active == True,
                    Flyer.valid_from <= now,
                    Flyer.valid_until >= now,
                )
            )
            .order_by(Flyer.valid_from.desc())
        )

        if chain_slug:
            q = q.join(Flyer.chain).where(StoreChain.slug == chain_slug)

        result = await self.db.execute(q)
        return result.scalars().all()

    async def get_flyer(self, flyer_id: UUID):
        result = await self.db.execute(
            select(Flyer)
            .options(
                selectinload(Flyer.chain),
                selectinload(Flyer.items),
            )
            .where(Flyer.id == flyer_id)
        )
        flyer = result.scalar_one_or_none()
        if not flyer:
            raise HTTPException(status_code=404, detail="Flyer not found")
        return flyer
