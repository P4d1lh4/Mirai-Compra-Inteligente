"""Store and StoreChain models."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, Boolean, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class StoreChain(Base):
    """A retail chain (e.g., Carrefour, Atacadão, Assaí)."""
    __tablename__ = "store_chains"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    logo_url: Mapped[str | None] = mapped_column(String(1000))
    website_url: Mapped[str | None] = mapped_column(String(1000))
    has_ecommerce: Mapped[bool] = mapped_column(Boolean, default=False)
    affiliate_base_url: Mapped[str | None] = mapped_column(String(1000))
    color_hex: Mapped[str | None] = mapped_column(String(7))  # Brand color for UI
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    stores = relationship("Store", back_populates="chain")
    flyers = relationship("Flyer", back_populates="chain")


class Store(Base):
    """A physical store location."""
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    chain_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("store_chains.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(2), nullable=False, index=True)
    zip_code: Mapped[str] = mapped_column(String(9), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    chain = relationship("StoreChain", back_populates="stores")
    prices = relationship("PriceEntry", back_populates="store")
