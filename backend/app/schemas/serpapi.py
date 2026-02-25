"""Schemas da integração SerpApi (Google Shopping)."""

from pydantic import BaseModel


class SerpApiShoppingItem(BaseModel):
    produto: str
    loja: str
    preco: float
    preco_formatado: str
    link: str
    imagem: str = ""
    entrega: str = ""
    avaliacao: float | None = None
    reviews: int = 0
    posicao: int | None = None


class SerpApiShoppingResponse(BaseModel):
    resultados: list[SerpApiShoppingItem]
    total: int
    busca: str
    fonte: str
    cached: bool
