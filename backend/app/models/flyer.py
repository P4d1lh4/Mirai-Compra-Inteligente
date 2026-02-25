"""Flyer (encarte) models."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, ForeignKey, DateTime, Boolean, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Flyer(Base):
    """A digital flyer/encarte from a store chain."""
    __tablename__ = "flyers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    chain_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("store_chains.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(1000))
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    chain = relationship("StoreChain", back_populates="flyers")
    items = relationship("FlyerItem", back_populates="flyer", cascade="all, delete-orphan")


class FlyerItem(Base):
    """An individual offer within a flyer."""
    __tablename__ = "flyer_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    flyer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("flyers.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("products.id"), nullable=True
    )
    raw_name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    original_price: Mapped[float | None] = mapped_column(Float)
    image_url: Mapped[str | None] = mapped_column(String(1000))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    flyer = relationship("Flyer", back_populates="items")
    product = relationship("Product")
