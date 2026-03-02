"""AI Chat assistant endpoints."""

from fastapi import APIRouter, HTTPException, Depends, Request
from uuid import UUID

from app.api.deps import get_current_user_id
from app.schemas.ai_chat import (
    ChatRequest,
    ChatResponse,
    ChatSuggestRequest,
    ChatSuggestResponse,
)
from app.services.ai_chat_service import chat_message, chat_suggest

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    request: Request,
    data: ChatRequest,
    user_id: UUID = Depends(get_current_user_id),
):
    """Send a message in the AI shopping assistant conversation."""
    # Rate limit: 30 messages per hour per user
    await request.app.state.limiter.acheck(request, "30/hour")
    try:
        return await chat_message(data.messages)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro no chat com IA: {str(e)}",
        )


@router.post("/chat/suggest", response_model=ChatSuggestResponse)
async def ai_chat_suggest(
    request: Request,
    data: ChatSuggestRequest,
    user_id: UUID = Depends(get_current_user_id),
):
    """Generate product suggestions based on the conversation history."""
    # Rate limit: 10 suggestions per hour per user
    await request.app.state.limiter.acheck(request, "10/hour")
    try:
        return await chat_suggest(data.messages)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar sugestões: {str(e)}",
        )
