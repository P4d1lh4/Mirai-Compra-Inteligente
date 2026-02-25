"""AI-powered shopping list generation endpoint."""

from fastapi import APIRouter, HTTPException

from app.schemas.ai_list import AIListRequest, AIListResponse
from app.services.ai_list_service import generate_shopping_list

router = APIRouter()


@router.post("/generate-list", response_model=AIListResponse)
async def ai_generate_list(data: AIListRequest):
    """Generate a shopping list from a natural-language prompt using AI."""
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
