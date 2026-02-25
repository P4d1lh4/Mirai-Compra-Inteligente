"""API Router — aggregates all endpoints."""

from fastapi import APIRouter

from app.api.products import router as products_router
from app.api.stores import router as stores_router
from app.api.prices import router as prices_router
from app.api.auth import router as auth_router
from app.api.shopping_lists import router as shopping_lists_router
from app.api.alerts import router as alerts_router
from app.api.flyers import router as flyers_router
from app.api.serpapi import router as serpapi_router
from app.api.ai_lists import router as ai_lists_router
from app.api.ai_chat import router as ai_chat_router
from app.api.profile import router as profile_router

router = APIRouter()

router.include_router(products_router, prefix="/products", tags=["Products"])
router.include_router(stores_router, prefix="/stores", tags=["Stores"])
router.include_router(prices_router, prefix="/prices", tags=["Prices"])
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(profile_router, prefix="/profile", tags=["Profile"])
router.include_router(shopping_lists_router, prefix="/shopping-lists", tags=["Shopping Lists"])
router.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
router.include_router(flyers_router, prefix="/flyers", tags=["Flyers"])
router.include_router(serpapi_router, prefix="/serpapi", tags=["SerpApi"])
router.include_router(ai_lists_router, prefix="/ai", tags=["AI"])
router.include_router(ai_chat_router, prefix="/ai", tags=["AI Chat"])
