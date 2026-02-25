"""
SmartCart — Serviço de integração com SerpApi (Google Shopping).

Encapsula a lógica de busca, parsing e cache dos resultados da API.
"""

import os
import hashlib
import json
import re
import time
from decimal import Decimal, InvalidOperation
from typing import Optional

import httpx

from app.core.config import settings


# ──────────────────────────────────────────────────────
# Configuração
# ──────────────────────────────────────────────────────
SERPAPI_BASE_URL = "https://serpapi.com/search.json"
SERPAPI_KEY = getattr(settings, "SERPAPI_KEY", None) or os.environ.get("SERPAPI_KEY", "")

# Cache em memória simples (TTL de 30 min para economizar créditos)
_cache: dict[str, tuple[float, list]] = {}
CACHE_TTL_SECONDS = 1800  # 30 minutos


class SerpApiValidationError(ValueError):
    """Erro de validação de parâmetros da busca."""


class SerpApiUpstreamError(RuntimeError):
    """Erro ao consultar o serviço externo SerpApi."""


class SerpApiService:
    """Serviço para busca de preços via Google Shopping (SerpApi)."""

    @staticmethod
    def _cache_key(query: str, **kwargs) -> str:
        """Gera chave de cache baseada nos parâmetros de busca."""
        raw = f"{query}:{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.md5(raw.encode()).hexdigest()

    @staticmethod
    async def buscar_precos(
        query: str,
        *,
        ordenar_por_preco: bool = True,
        num_resultados: int = 20,
        preco_min: Optional[float] = None,
        preco_max: Optional[float] = None,
        location: Optional[str] = None,
    ) -> dict:
        """
        Busca preços no Google Shopping via SerpApi.

        Args:
            query: Termo de busca (ex: "Tênis Nike Basquete")
            ordenar_por_preco: Se True, ordena por menor preço
            num_resultados: Quantidade máxima de resultados
            preco_min: Filtro de preço mínimo (opcional)
            preco_max: Filtro de preço máximo (opcional)

        Returns:
            dict com:
              - resultados: lista de produtos
              - total: quantidade de resultados
              - busca: termo de busca
              - fonte: "serpapi" ou "mock"
              - cached: bool
        """
        query_limpa = query.strip()
        if len(query_limpa) < 2:
            raise SerpApiValidationError("O termo de busca deve ter ao menos 2 caracteres.")
        if num_resultados < 1 or num_resultados > 100:
            raise SerpApiValidationError("num_resultados deve estar entre 1 e 100.")
        if (
            preco_min is not None
            and preco_max is not None
            and preco_min > preco_max
        ):
            raise SerpApiValidationError("preco_min não pode ser maior que preco_max.")

        # Verificar cache
        ck = SerpApiService._cache_key(
            query_limpa,
            sort=ordenar_por_preco,
            num=num_resultados,
            pmin=preco_min,
            pmax=preco_max,
            location=location,
        )
        if ck in _cache:
            ts, cached_data = _cache[ck]
            if time.time() - ts < CACHE_TTL_SECONDS:
                return {
                    "resultados": cached_data,
                    "total": len(cached_data),
                    "busca": query_limpa,
                    "fonte": "serpapi",
                    "cached": True,
                }

        # Montar filtro de preço (tbs)
        tbs_parts = []
        if ordenar_por_preco:
            tbs_parts.append("p_ord:p")
        if preco_min is not None or preco_max is not None:
            tbs_parts.append("mr:1,price:1")
            if preco_min is not None:
                tbs_parts.append(f"ppr_min:{int(preco_min)}")
            if preco_max is not None:
                tbs_parts.append(f"ppr_max:{int(preco_max)}")

        # Se location fornecido (ex: "Recife, Pernambuco, Brazil"), usa para regionalizar
        serpapi_location = location if location else "Brazil"

        params = {
            "engine": "google_shopping",
            "q": query_limpa,
            "gl": "br",
            "hl": "pt",
            "location": serpapi_location,
            "num": num_resultados,
            "api_key": SERPAPI_KEY,
        }
        if tbs_parts:
            params["tbs"] = ",".join(tbs_parts)

        # Se não há API key, retornar dados mock
        if not SERPAPI_KEY or SERPAPI_KEY == "SUA_CHAVE_AQUI":
            resultados = SerpApiService._gerar_mock(query_limpa)
            resultados = SerpApiService._filtrar_resultados(
                resultados,
                preco_min=preco_min,
                preco_max=preco_max,
                ordenar_por_preco=ordenar_por_preco,
            )[:num_resultados]
            return {
                "resultados": resultados,
                "total": len(resultados),
                "busca": query_limpa,
                "fonte": "mock",
                "cached": False,
            }

        # Chamada real à SerpApi
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(SERPAPI_BASE_URL, params=params)
                response.raise_for_status()
                dados = response.json()
        except httpx.HTTPStatusError as exc:
            raise SerpApiUpstreamError(
                f"SerpApi retornou status {exc.response.status_code}."
            ) from exc
        except httpx.HTTPError as exc:
            raise SerpApiUpstreamError("Falha de comunicação com SerpApi.") from exc

        # Parsing dos resultados
        resultados = SerpApiService._parse_shopping_results(dados)
        resultados = SerpApiService._filtrar_resultados(
            resultados,
            preco_min=preco_min,
            preco_max=preco_max,
            ordenar_por_preco=ordenar_por_preco,
        )[:num_resultados]

        # Salvar no cache
        _cache[ck] = (time.time(), resultados)

        return {
            "resultados": resultados,
            "total": len(resultados),
            "busca": query_limpa,
            "fonte": "serpapi",
            "cached": False,
        }

    @staticmethod
    def _parse_shopping_results(dados: dict) -> list[dict]:
        """
        Extrai e normaliza os dados do array `shopping_results`.

        Chave principal: dados["shopping_results"]
        Cada item contém: title, link, source, price, extracted_price,
                          thumbnail, delivery, rating, reviews, etc.
        """
        shopping = dados.get("shopping_results", [])
        resultados = []

        for item in shopping:
            preco = item.get("extracted_price")
            if preco is None:
                # Tenta extrair do campo "price" (string)
                price_str = item.get("price", "")
                preco = SerpApiService._parse_preco(price_str)

            resultados.append({
                "produto": item.get("title", "N/A"),
                "loja": item.get("source", "N/A"),
                "preco": float(preco or 0.0),
                "preco_formatado": item.get("price", f"R$ {preco:,.2f}"),
                "link": item.get("link", "#"),
                "imagem": item.get("thumbnail", ""),
                "entrega": item.get("delivery", ""),
                "avaliacao": item.get("rating"),
                "reviews": item.get("reviews", 0),
                "posicao": item.get("position"),
            })

        # Ordenar por preço (menor primeiro)
        resultados.sort(key=lambda x: x["preco"] if x["preco"] > 0 else float("inf"))

        return resultados

    @staticmethod
    def _parse_preco(price_str: str) -> float:
        """Converte preço textual em float quando possível."""
        if not isinstance(price_str, str) or not price_str.strip():
            return 0.0

        texto = re.sub(r"[^\d,\.]", "", price_str)
        if not texto:
            return 0.0

        if "," in texto:
            texto = texto.replace(".", "").replace(",", ".")

        try:
            return float(Decimal(texto))
        except (InvalidOperation, ValueError):
            return 0.0

    @staticmethod
    def _filtrar_resultados(
        resultados: list[dict],
        *,
        preco_min: Optional[float],
        preco_max: Optional[float],
        ordenar_por_preco: bool,
    ) -> list[dict]:
        """Aplica filtros e ordenação local de forma previsível."""
        filtrados = resultados

        if preco_min is not None:
            filtrados = [item for item in filtrados if item["preco"] >= preco_min]
        if preco_max is not None:
            filtrados = [item for item in filtrados if item["preco"] <= preco_max]

        if ordenar_por_preco:
            filtrados.sort(key=lambda x: x["preco"] if x["preco"] > 0 else float("inf"))

        return filtrados

    @staticmethod
    def _gerar_mock(query: str) -> list[dict]:
        """Dados simulados para development sem gastar créditos da API."""
        mock_data = [
            {
                "produto": f"Tênis Nike Air Max Impact 4 Masculino - Basquete",
                "loja": "Magazine Luiza",
                "preco": 349.90,
                "preco_formatado": "R$ 349,90",
                "link": "https://www.magazineluiza.com.br/tenis-nike-air-max-impact-4/",
                "imagem": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
                "entrega": "Frete grátis",
                "avaliacao": 4.7,
                "reviews": 234,
                "posicao": 1,
            },
            {
                "produto": f"Tênis Nike Precision 6 Masculino - Basquete",
                "loja": "Amazon.com.br",
                "preco": 299.99,
                "preco_formatado": "R$ 299,99",
                "link": "https://www.amazon.com.br/dp/B0EXAMPLE01/",
                "imagem": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200",
                "entrega": "Frete grátis com Prime",
                "avaliacao": 4.5,
                "reviews": 187,
                "posicao": 2,
            },
            {
                "produto": f"Tênis Nike LeBron Witness 7 - Basquete Masculino",
                "loja": "Netshoes",
                "preco": 529.99,
                "preco_formatado": "R$ 529,99",
                "link": "https://www.netshoes.com.br/tenis-nike-lebron-witness-7/",
                "imagem": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200",
                "entrega": "Entrega em 3 dias",
                "avaliacao": 4.8,
                "reviews": 312,
                "posicao": 3,
            },
            {
                "produto": f"Tênis Nike KD 16 Masculino Basquete",
                "loja": "Centauro",
                "preco": 899.90,
                "preco_formatado": "R$ 899,90",
                "link": "https://www.centauro.com.br/tenis-nike-kd-16/",
                "imagem": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=200",
                "entrega": "Retire na loja",
                "avaliacao": 4.9,
                "reviews": 89,
                "posicao": 4,
            },
            {
                "produto": f"Tênis Nike Zoom Freak 5 Basquete",
                "loja": "Mercado Livre",
                "preco": 419.00,
                "preco_formatado": "R$ 419,00",
                "link": "https://www.mercadolivre.com.br/tenis-nike-zoom-freak-5/",
                "imagem": "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=200",
                "entrega": "Frete grátis Full",
                "avaliacao": 4.6,
                "reviews": 156,
                "posicao": 5,
            },
            {
                "produto": f"Tênis Nike Air Max Impact 4 - Preto e Branco",
                "loja": "Casas Bahia",
                "preco": 379.90,
                "preco_formatado": "R$ 379,90",
                "link": "https://www.casasbahia.com.br/tenis-nike-impact-4/",
                "imagem": "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200",
                "entrega": "Frete grátis",
                "avaliacao": 4.4,
                "reviews": 67,
                "posicao": 6,
            },
            {
                "produto": f"Tênis Nike Giannis Immortality 3 Basquete",
                "loja": "Nike.com.br",
                "preco": 599.99,
                "preco_formatado": "R$ 599,99",
                "link": "https://www.nike.com.br/tenis-giannis-immortality-3/",
                "imagem": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=200",
                "entrega": "Frete grátis acima de R$299",
                "avaliacao": 4.7,
                "reviews": 201,
                "posicao": 7,
            },
            {
                "produto": f"Tênis Nike Precision 6 Flyease - Basquete",
                "loja": "Dafiti",
                "preco": 319.90,
                "preco_formatado": "R$ 319,90",
                "link": "https://www.dafiti.com.br/tenis-nike-precision-flyease/",
                "imagem": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=200",
                "entrega": "Entrega em 5 dias úteis",
                "avaliacao": 4.3,
                "reviews": 45,
                "posicao": 8,
            },
        ]

        # Filtrar pelo termo de busca se não for o default
        # (em produção, a API já faz isso)
        mock_data.sort(key=lambda x: x["preco"])
        return mock_data
