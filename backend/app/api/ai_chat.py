"""AI Chat assistant endpoints."""

from fastapi import APIRouter, HTTPException

from app.schemas.ai_chat import (
    ChatRequest,
    ChatResponse,
    ChatSuggestRequest,
    ChatSuggestResponse,
)
from app.services.ai_chat_service import chat_message, chat_suggest

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(data: ChatRequest):
    """Send a message in the AI shopping assistant conversation."""
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
async def ai_chat_suggest(data: ChatSuggestRequest):
    """Generate product suggestions based on the conversation history."""
    try:
        return await chat_suggest(data.messages)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar sugestões: {str(e)}",
        )
