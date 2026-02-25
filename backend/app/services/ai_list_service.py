"""AI shopping list generation service using Groq (free, fast LLM API)."""

import json
import logging

import httpx

from app.core.config import settings
from app.schemas.ai_list import AIListResponse, AIListItemOut

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Você é um assistente de compras inteligente do app SmartCart Brasil.
O usuário vai descrever o que precisa comprar e você deve gerar uma lista de compras completa.

REGRAS:
- Retorne APENAS JSON válido, sem markdown, sem texto extra, sem explicações.
- Use preços realistas do mercado brasileiro em Reais (R$).
- Inclua quantidades adequadas ao pedido.
- Nomeie os produtos de forma clara (ex: "Arroz Tipo 1 5kg", "Carne Picanha 1kg").
- Se o usuário mencionar número de pessoas, ajuste as quantidades.
- O nome da lista deve ser descritivo e curto.

FORMATO DE RESPOSTA (JSON puro, sem markdown):
{"name": "Nome descritivo da lista", "items": [{"name": "Nome do produto", "quantity": 1, "estimated_price": 10.90}]}"""

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


async def generate_shopping_list(prompt: str) -> AIListResponse:
    """Generate a shopping list from a natural-language prompt using Groq."""
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY não configurada. Obtenha gratuitamente em https://console.groq.com"
        )

    models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    last_error = None

    for model_name in models_to_try:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2048,
                        "response_format": {"type": "json_object"},
                    },
                )

            if response.status_code == 429:
                last_error = ValueError("Rate limit atingido")
                logger.warning("Model %s rate limited", model_name)
                continue

            if response.status_code != 200:
                error_body = response.text[:300]
                last_error = ValueError(f"Groq API error ({response.status_code}): {error_body}")
                logger.warning("Model %s failed: %s", model_name, error_body)
                continue

            data = response.json()
            raw = data["choices"][0]["message"]["content"].strip()
            break

        except httpx.TimeoutException:
            last_error = ValueError("Timeout ao conectar com a IA")
            logger.warning("Model %s timed out", model_name)
            continue
        except Exception as e:
            last_error = e
            logger.warning("Model %s error: %s", model_name, str(e)[:200])
            continue
    else:
        raise last_error or ValueError("Não foi possível gerar a lista.")

    # Parse JSON
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        logger.error("AI returned invalid JSON: %s", raw[:500])
        raise ValueError("A IA retornou um formato inválido. Tente novamente.")

    items = [
        AIListItemOut(
            name=item["name"],
            quantity=item.get("quantity", 1),
            estimated_price=item.get("estimated_price"),
        )
        for item in parsed.get("items", [])
    ]

    return AIListResponse(
        name=parsed.get("name", "Lista IA"),
        items=items,
    )
