"""AI-powered shopping list generation endpoint."""

from fastapi import APIRouter, HTTPException, Depends, Request
from uuid import UUID

from app.api.deps import get_current_user_id
from app.schemas.ai_list import AIListRequest, AIListResponse
from app.services.ai_list_service import generate_shopping_list

router = APIRouter()


@router.post("/generate-list", response_model=AIListResponse)
async def ai_generate_list(
    request: Request,
    data: AIListRequest,
    user_id: UUID = Depends(get_current_user_id),
):
    """Generate a shopping list from a natural-language prompt using AI."""
    # Rate limit: 5 list generations per hour per user
    await request.app.state.limiter.acheck(request, "5/hour")
    try:
        result = await generate_shopping_list(data.prompt)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar lista com IA: {str(e)}",
        )
