"""Price entry model — the core of the comparison engine."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Float, ForeignKey, DateTime, Boolean, String, Index, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PriceEntry(Base):
    """A price observation for a product at a specific store."""
    __tablename__ = "price_entries"
    __table_args__ = (
        Index("ix_price_product_store", "product_id", "store_id"),
        Index("ix_price_product_current", "product_id", "is_current"),
        Index("ix_price_seen_at", "seen_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("products.id"), nullable=False
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("stores.id"), nullable=False
    )

    price: Mapped[float] = mapped_column(Float, nullable=False)
    original_price: Mapped[float | None] = mapped_column(Float)  # if on sale, the original
    is_promotion: Mapped[bool] = mapped_column(Boolean, default=False)
    promotion_label: Mapped[str | None] = mapped_column(String(200))  # "Oferta da Semana"

    # Channel
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    ecommerce_url: Mapped[str | None] = mapped_column(String(2000))

    # Validity
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Source tracking
    source: Mapped[str] = mapped_column(String(50), default="manual")  # manual, flyer, scrape, api, crowdsource
    seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    product = relationship("Product", back_populates="prices")
    store = relationship("Store", back_populates="prices")
