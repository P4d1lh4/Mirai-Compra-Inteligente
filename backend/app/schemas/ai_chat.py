"""AI Chat assistant schemas."""

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Conversation history including the latest user message.",
    )


class ChatResponse(BaseModel):
    message: str
    finished: bool = False


class ChatSuggestRequest(BaseModel):
    messages: list[ChatMessage] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Full conversation history to generate suggestions from.",
    )


class ChatSuggestion(BaseModel):
    name: str
    search_query: str
    reason: str


class ChatSuggestResponse(BaseModel):
    suggestions: list[ChatSuggestion]
