"""API routes para busca de preços via SerpApi (Google Shopping)."""

from typing import Optional

from fastapi import APIRouter, Query, HTTPException

from app.schemas.serpapi import SerpApiShoppingResponse
from app.services.serpapi_service import (
    SerpApiService,
    SerpApiUpstreamError,
    SerpApiValidationError,
)

router = APIRouter()


@router.get("/shopping", response_model=SerpApiShoppingResponse)
async def buscar_shopping(
    q: str = Query(..., min_length=2, max_length=200, description="Termo de busca"),
    ordenar_preco: bool = Query(True, description="Ordenar por menor preço"),
    num: int = Query(20, ge=1, le=100, description="Quantidade de resultados"),
    preco_min: Optional[float] = Query(None, ge=0, description="Preço mínimo"),
    preco_max: Optional[float] = Query(None, ge=0, description="Preço máximo"),
    location: Optional[str] = Query(None, max_length=200, description="Localização regional (ex: 'Recife, Pernambuco, Brazil')"),
):
    """
    Busca preços de produtos em lojas brasileiras via Google Shopping (SerpApi).

    Retorna uma lista de resultados com produto, loja, preço e link de compra.
    Os resultados podem ser ordenados por preço e filtrados por faixa de valor.
    Quando `location` é fornecido, filtra resultados pela região do usuário.
    """
    try:
        resultado = await SerpApiService.buscar_precos(
            query=q,
            ordenar_por_preco=ordenar_preco,
            num_resultados=num,
            preco_min=preco_min,
            preco_max=preco_max,
            location=location,
        )
        return resultado
    except SerpApiValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SerpApiUpstreamError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
