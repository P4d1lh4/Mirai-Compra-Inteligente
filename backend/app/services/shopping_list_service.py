"""Shopping list service."""

import math
from uuid import UUID
from collections import defaultdict

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.shopping_list import ShoppingList, ShoppingListItem
from app.models.product import Product
from app.models.price import PriceEntry
from app.models.store import Store, StoreChain
from app.schemas.shopping_list import (
    ShoppingListCreate, ShoppingListItemCreate, StoreCostBreakdown,
)


class ShoppingListService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_lists(self, user_id: UUID) -> list:
        result = await self.db.execute(
            select(ShoppingList)
            .options(selectinload(ShoppingList.items).selectinload(ShoppingListItem.product))
            .where(ShoppingList.user_id == user_id)
            .order_by(ShoppingList.updated_at.desc())
        )
        lists = result.scalars().all()

        output = []
        for sl in lists:
            items = []
            for item in sl.items:
                items.append({
                    "id": item.id,
                    "product_id": item.product_id,
                    "custom_name": item.custom_name,
                    "product_name": item.product.name if item.product else None,
                    "product_image_url": item.product.image_url if item.product else None,
                    "quantity": item.quantity,
                    "is_checked": item.is_checked,
                    "estimated_price": item.estimated_price,
                    "cheapest_store": None,
                })
            output.append({
                "id": sl.id,
                "name": sl.name,
                "notes": sl.notes,
                "items": items,
                "created_at": sl.created_at,
                "updated_at": sl.updated_at,
            })
        return output

    async def create_list(self, user_id: UUID, data: ShoppingListCreate):
        sl = ShoppingList(
            user_id=user_id,
            name=data.name,
            notes=data.notes,
        )
        self.db.add(sl)
        await self.db.flush()

        for item_data in data.items:
            item = ShoppingListItem(
                shopping_list_id=sl.id,
                product_id=item_data.product_id,
                custom_name=item_data.custom_name,
                quantity=item_data.quantity,
            )
            self.db.add(item)

        await self.db.flush()
        await self.db.refresh(sl)

        return await self.get_list(sl.id, user_id)

    async def get_list(self, list_id: UUID, user_id: UUID):
        result = await self.db.execute(
            select(ShoppingList)
            .options(selectinload(ShoppingList.items).selectinload(ShoppingListItem.product))
            .where(and_(ShoppingList.id == list_id, ShoppingList.user_id == user_id))
        )
        sl = result.scalar_one_or_none()
        if not sl:
            raise HTTPException(status_code=404, detail="Shopping list not found")

        items = []
        for item in sl.items:
            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "custom_name": item.custom_name,
                "product_name": item.product.name if item.product else None,
                "product_image_url": item.product.image_url if item.product else None,
                "quantity": item.quantity,
                "is_checked": item.is_checked,
                "estimated_price": item.estimated_price,
                "cheapest_store": None,
            })

        return {
            "id": sl.id,
            "name": sl.name,
            "notes": sl.notes,
            "items": items,
            "created_at": sl.created_at,
            "updated_at": sl.updated_at,
        }

    async def add_item(self, list_id: UUID, user_id: UUID, data: ShoppingListItemCreate):
        # Verify list ownership
        sl = await self._get_owned_list(list_id, user_id)

        # Get cheapest price if product_id given
        estimated_price = None
        if data.product_id:
            price_result = await self.db.execute(
                select(PriceEntry.price)
                .where(and_(
                    PriceEntry.product_id == data.product_id,
                    PriceEntry.is_current == True,
                ))
                .order_by(PriceEntry.price.asc())
                .limit(1)
            )
            cheapest = price_result.scalar_one_or_none()
            if cheapest:
                estimated_price = cheapest

        item = ShoppingListItem(
            shopping_list_id=list_id,
            product_id=data.product_id,
            custom_name=data.custom_name,
            quantity=data.quantity,
            estimated_price=estimated_price,
        )
        self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)

        # Reload with product
        if item.product_id:
            prod_result = await self.db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = prod_result.scalar_one_or_none()
        else:
            product = None

        return {
            "id": item.id,
            "product_id": item.product_id,
            "custom_name": item.custom_name,
            "product_name": product.name if product else None,
            "product_image_url": product.image_url if product else None,
            "quantity": item.quantity,
            "is_checked": item.is_checked,
            "estimated_price": item.estimated_price,
            "cheapest_store": None,
        }

    async def remove_item(self, list_id: UUID, item_id: UUID, user_id: UUID):
        await self._get_owned_list(list_id, user_id)
        result = await self.db.execute(
            select(ShoppingListItem).where(
                and_(ShoppingListItem.id == item_id, ShoppingListItem.shopping_list_id == list_id)
            )
        )
        item = result.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        await self.db.delete(item)

    async def toggle_item(self, list_id: UUID, item_id: UUID, user_id: UUID):
        await self._get_owned_list(list_id, user_id)
        result = await self.db.execute(
            select(ShoppingListItem).where(
                and_(ShoppingListItem.id == item_id, ShoppingListItem.shopping_list_id == list_id)
            )
        )
        item = result.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        item.is_checked = not item.is_checked
        await self.db.flush()
        return {"id": item.id, "is_checked": item.is_checked}

    async def optimize_list(
        self, list_id: UUID, user_id: UUID,
        latitude: float | None = None, longitude: float | None = None,
    ):
        """Calculate total cost per store for a shopping list."""
        # Get list with items
        list_data = await self.get_list(list_id, user_id)
        product_ids = [
            item["product_id"] for item in list_data["items"]
            if item["product_id"] is not None
        ]

        if not product_ids:
            return {
                "list": list_data,
                "store_costs": [],
                "cheapest_single_store": None,
                "estimated_savings": None,
            }

        # Get all current prices for these products
        prices_q = (
            select(PriceEntry, Store, StoreChain)
            .join(PriceEntry.store)
            .join(Store.chain)
            .where(
                and_(
                    PriceEntry.product_id.in_(product_ids),
                    PriceEntry.is_current == True,
                )
            )
        )
        result = await self.db.execute(prices_q)
        rows = result.all()

        # Build: store_id -> { product_id -> cheapest price }
        store_products: dict = defaultdict(lambda: {"prices": {}, "store": None, "chain": None})
        for entry, store, chain in rows:
            key = store.id
            if store_products[key]["store"] is None:
                store_products[key]["store"] = store
                store_products[key]["chain"] = chain

            current = store_products[key]["prices"].get(entry.product_id)
            if current is None or entry.price < current:
                store_products[key]["prices"][entry.product_id] = entry.price

        # Calculate costs per store
        item_quantities = {
            item["product_id"]: item["quantity"]
            for item in list_data["items"]
            if item["product_id"]
        }

        store_costs = []
        for store_id, data in store_products.items():
            store = data["store"]
            chain = data["chain"]
            total = 0.0
            available = 0
            for pid in product_ids:
                price = data["prices"].get(pid)
                if price is not None:
                    total += price * item_quantities.get(pid, 1)
                    available += 1

            distance = None
            if latitude and longitude:
                distance = self._haversine(latitude, longitude, store.latitude, store.longitude)

            store_costs.append(StoreCostBreakdown(
                chain_name=chain.name,
                chain_slug=chain.slug,
                chain_logo_url=chain.logo_url,
                store_name=store.name,
                store_address=store.address,
                store_city=store.city,
                distance_km=round(distance, 1) if distance else None,
                total_cost=round(total, 2),
                items_available=available,
                items_missing=len(product_ids) - available,
            ))

        store_costs.sort(key=lambda x: x.total_cost)
        cheapest = store_costs[0] if store_costs else None
        most_expensive = store_costs[-1].total_cost if store_costs else 0
        savings = round(most_expensive - cheapest.total_cost, 2) if cheapest else None

        return {
            "list": list_data,
            "store_costs": store_costs,
            "cheapest_single_store": cheapest,
            "estimated_savings": savings,
        }

    async def _get_owned_list(self, list_id: UUID, user_id: UUID) -> ShoppingList:
        result = await self.db.execute(
            select(ShoppingList).where(
                and_(ShoppingList.id == list_id, ShoppingList.user_id == user_id)
            )
        )
        sl = result.scalar_one_or_none()
        if not sl:
            raise HTTPException(status_code=404, detail="Shopping list not found")
        return sl

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
