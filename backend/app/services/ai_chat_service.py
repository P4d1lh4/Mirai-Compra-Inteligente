"""AI conversational shopping assistant service using Groq."""

import json
import logging

import httpx

from app.core.config import settings
from app.schemas.ai_chat import (
    ChatMessage,
    ChatResponse,
    ChatSuggestion,
    ChatSuggestResponse,
)

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

CHAT_SYSTEM_PROMPT = """\
Você é o assistente de compras inteligente do SmartCart Brasil.
Seu objetivo é ajudar o usuário a encontrar o produto ideal através de uma conversa natural.

REGRAS DE CONVERSA:
- Seja simpático, objetivo e use um tom amigável.
- Faça UMA ou DUAS perguntas de cada vez para não sobrecarregar o usuário.
- Pergunte sobre: finalidade, orçamento, marcas preferidas, tamanho, frequência de uso, características importantes.
- Adapte as perguntas ao tipo de produto (ex: para tênis de basquete pergunte altura, peso, posição; para celular pergunte uso principal, armazenamento).
- Se o usuário for vago, peça mais detalhes de forma natural.
- NÃO sugira produtos ainda — apenas converse para entender as necessidades.
- Responda sempre em português brasileiro.
- Use emojis ocasionalmente para tornar a conversa mais leve.
- Mantenha respostas curtas (máximo 3-4 frases)."""

SUGGEST_SYSTEM_PROMPT = """\
Você é um especialista em recomendações de produtos do SmartCart Brasil.
Analise a conversa abaixo entre o usuário e o assistente de compras.
Com base nas informações coletadas, gere NO MÁXIMO 3 sugestões de produtos ESPECÍFICOS.

REGRAS IMPORTANTES:
- Retorne APENAS JSON válido, sem markdown, sem texto extra.
- Sugira produtos REAIS e ESPECÍFICOS com marca e modelo exatos (ex: "Nike Air Jordan 1 Mid", "Samsung Galaxy S24 Ultra 256GB", "JBL Tune 520BT").
- NÃO use nomes genéricos como "Tênis de Basquete Alto" ou "Fone Bluetooth Bom". Use nomes reais de produtos que existem no mercado brasileiro.
- O search_query deve conter o nome exato do produto para uma busca precisa no Google Shopping.
- A razão deve explicar em 1 frase por que esse modelo específico combina com o que o usuário pediu.
- Máximo de 3 produtos, ordenados do mais recomendado para o menos.

FORMATO DE RESPOSTA (JSON puro):
{"suggestions": [{"name": "Marca Modelo Específico", "search_query": "Marca Modelo Específico comprar", "reason": "Razão curta e específica"}]}"""


async def _call_groq(messages: list[dict], json_mode: bool = False) -> str:
    """Call Groq API with model fallback."""
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY não configurada. Obtenha gratuitamente em https://console.groq.com"
        )

    models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    last_error = None

    for model_name in models_to_try:
        try:
            body: dict = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024,
            }
            if json_mode:
                body["response_format"] = {"type": "json_object"}

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json=body,
                )

            if response.status_code == 429:
                last_error = ValueError("Rate limit atingido")
                logger.warning("Model %s rate limited", model_name)
                continue

            if response.status_code != 200:
                error_body = response.text[:300]
                last_error = ValueError(
                    f"Groq API error ({response.status_code}): {error_body}"
                )
                logger.warning("Model %s failed: %s", model_name, error_body)
                continue

            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

        except httpx.TimeoutException:
            last_error = ValueError("Timeout ao conectar com a IA")
            logger.warning("Model %s timed out", model_name)
            continue
        except Exception as e:
            last_error = e
            logger.warning("Model %s error: %s", model_name, str(e)[:200])
            continue

    raise last_error or ValueError("Não foi possível conectar com a IA.")


async def chat_message(messages: list[ChatMessage]) -> ChatResponse:
    """Process a chat message and return the AI response."""
    groq_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    for msg in messages:
        groq_messages.append({"role": msg.role, "content": msg.content})

    raw = await _call_groq(groq_messages)
    return ChatResponse(message=raw, finished=False)


async def chat_suggest(messages: list[ChatMessage]) -> ChatSuggestResponse:
    """Generate product suggestions based on conversation history."""
    # Build conversation as context
    conversation_text = "\n".join(
        f"{'Usuário' if m.role == 'user' else 'Assistente'}: {m.content}"
        for m in messages
    )

    groq_messages = [
        {"role": "system", "content": SUGGEST_SYSTEM_PROMPT},
        {"role": "user", "content": f"Conversa:\n{conversation_text}\n\nGere as sugestões de produtos:"},
    ]

    raw = await _call_groq(groq_messages, json_mode=True)

    # Strip markdown wrappers if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        logger.error("AI returned invalid JSON for suggestions: %s", raw[:500])
        raise ValueError("A IA retornou um formato inválido. Tente novamente.")

    suggestions = [
        ChatSuggestion(
            name=s["name"],
            search_query=s["search_query"],
            reason=s["reason"],
        )
        for s in parsed.get("suggestions", [])
    ]

    return ChatSuggestResponse(suggestions=suggestions)
