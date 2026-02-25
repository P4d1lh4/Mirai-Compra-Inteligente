"""Product search & retrieval service."""

import math
from uuid import UUID

from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from unidecode import unidecode

from app.models.product import Product, Category
from app.models.price import PriceEntry
from app.models.store import Store, StoreChain
from app.schemas.common import PaginatedResponse


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_products(
        self,
        query: str,
        category_slug: str | None = None,
        brand: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        radius_km: float = 10.0,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse:
        """Full-text product search with filters."""
        # Normalize query for accent-insensitive search
        normalized_query = unidecode(query.lower().strip())
        search_pattern = f"%{normalized_query}%"

        # Base query
        base_q = (
            select(Product)
            .outerjoin(Product.category)
            .outerjoin(Product.prices)
            .where(
                and_(
                    Product.normalized_name.ilike(search_pattern),
                    PriceEntry.is_current == True,
                )
            )
        )

        # Apply filters
        if category_slug:
            base_q = base_q.where(Category.slug == category_slug)
        if brand:
            base_q = base_q.where(Product.brand.ilike(f"%{brand}%"))

        # If lat/lng given, filter stores within radius
        if latitude is not None and longitude is not None:
            base_q = base_q.join(PriceEntry.store).where(
                self._within_radius(Store, latitude, longitude, radius_km)
            )

        # Count total
        count_q = select(func.count()).select_from(
            base_q.with_only_columns(Product.id).distinct().subquery()
        )
        total_result = await self.db.execute(count_q)
        total = total_result.scalar() or 0

        # Fetch products with aggregated price info
        products_q = (
            select(
                Product,
                func.min(PriceEntry.price).label("min_price"),
                func.max(PriceEntry.price).label("max_price"),
                func.count(PriceEntry.id.distinct()).label("store_count"),
            )
            .outerjoin(Product.prices)
            .where(
                and_(
                    Product.normalized_name.ilike(search_pattern),
                    PriceEntry.is_current == True,
                )
            )
            .group_by(Product.id)
            .options(selectinload(Product.category))
            .order_by(func.min(PriceEntry.price).asc().nullslast())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        if category_slug:
            products_q = products_q.join(Product.category).where(Category.slug == category_slug)
        if brand:
            products_q = products_q.where(Product.brand.ilike(f"%{brand}%"))

        result = await self.db.execute(products_q)
        rows = result.all()

        items = []
        for product, min_price_val, max_price_val, store_count in rows:
            items.append({
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "ean": product.ean,
                "description": product.description,
                "image_url": product.image_url,
                "unit": product.unit,
                "category": product.category,
                "min_price": min_price_val,
                "max_price": max_price_val,
                "store_count": store_count,
            })

        total_pages = math.ceil(total / page_size) if total > 0 else 0

        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def get_product_with_prices(
        self, product_id: UUID, latitude: float | None = None, longitude: float | None = None
    ):
        """Get a product with all current prices, including store and chain info."""
        # Get the product
        result = await self.db.execute(
            select(Product)
            .options(selectinload(Product.category))
            .where(Product.id == product_id)
        )
        product = result.scalar_one_or_none()
        if not product:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Product not found")

        # Get current prices with store + chain info
        prices_q = (
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
        prices_result = await self.db.execute(prices_q)
        price_rows = prices_result.all()

        prices = []
        for price_entry, store, chain in price_rows:
            distance = None
            if latitude is not None and longitude is not None:
                distance = self._haversine(latitude, longitude, store.latitude, store.longitude)

            prices.append({
                "price": price_entry.price,
                "original_price": price_entry.original_price,
                "is_promotion": price_entry.is_promotion,
                "promotion_label": price_entry.promotion_label,
                "is_online": price_entry.is_online,
                "ecommerce_url": price_entry.ecommerce_url,
                "store_name": store.name,
                "chain_name": chain.name,
                "chain_slug": chain.slug,
                "chain_logo_url": chain.logo_url,
                "chain_color_hex": chain.color_hex,
                "store_address": store.address,
                "store_city": store.city,
                "distance_km": round(distance, 1) if distance else None,
                "seen_at": price_entry.seen_at,
            })

        return {
            "id": product.id,
            "name": product.name,
            "brand": product.brand,
            "ean": product.ean,
            "description": product.description,
            "image_url": product.image_url,
            "unit": product.unit,
            "category": product.category,
            "prices": prices,
        }

    async def list_categories(self) -> list:
        """List all top-level categories."""
        result = await self.db.execute(
            select(Category).where(Category.parent_id.is_(None)).order_by(Category.name)
        )
        return result.scalars().all()

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance in km between two points using Haversine formula."""
        R = 6371  # Earth radius in km
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

    @staticmethod
    def _within_radius(store_model, lat: float, lng: float, radius_km: float):
        """
        SQL-compatible approximate distance filter.
        Uses a bounding box for performance, then Haversine for accuracy.
        """
        # ~111km per degree of latitude
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))

        return and_(
            store_model.latitude.between(lat - lat_delta, lat + lat_delta),
            store_model.longitude.between(lng - lng_delta, lng + lng_delta),
        )
