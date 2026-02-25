"""
================================================================================
 SmartCart — Prova de Conceito (PoC) com SerpApi (Google Shopping)
================================================================================

 MINITUTORIAL  —  Passo a passo para obter sua API Key gratuita
 ───────────────────────────────────────────────────────────────
 1. Acesse https://serpapi.com/ e clique em "Register" (canto superior direito).
 2. Crie a conta com e-mail ou GitHub/Google.
 3. Após confirmar o e-mail, faça login.
 4. Vá em https://serpapi.com/manage-api-key — sua chave aparecerá em destaque.
 5. O plano gratuito dá direito a 100 buscas/mês (suficiente para PoC).
 6. Copie a chave e cole na variável SERPAPI_KEY abaixo (ou defina como
    variável de ambiente SERPAPI_KEY).

 ESTRUTURA DO JSON DE RESPOSTA
 ─────────────────────────────
 A SerpApi retorna um JSON amplo. As chaves principais que nos interessam:

 {
   "search_metadata": { ... },          ← metadados da busca
   "search_parameters": { ... },        ← parâmetros enviados
   "search_information": { ... },       ← contagem de resultados
   "shopping_results": [                ← ★ ARRAY PRINCIPAL DE RESULTADOS ★
     {
       "position": 1,
       "title": "Tênis Nike Air Max ...",        ← nome do produto
       "link": "https://loja.com/...",           ← link direto de compra
       "source": "Magazine Luiza",               ← nome da loja / merchant
       "price": "R$ 499,90",                     ← preço formatado (string)
       "extracted_price": 499.90,                ← preço numérico (float)
       "thumbnail": "https://...",               ← imagem miniatura
       "delivery": "Frete grátis",               ← info de entrega
       "rating": 4.7,                            ← avaliação
       "reviews": 123,                           ← quantidade de reviews
       ...
     },
     ...
   ]
 }

 Portanto, para extrair os resultados das lojas, basta acessar:
   dados["shopping_results"]

 ORDENAR POR MENOR PREÇO  —  Dicas de Otimização
 ────────────────────────────────────────────────
 A SerpApi aceita o parâmetro `tbs` para filtros avançados do Google Shopping:
   • tbs="p_ord:p"   → ordena por MENOR preço (price ascending)
   • tbs="p_ord:pd"  → ordena por MAIOR preço (price descending)
   • tbs="p_ord:rv"  → ordena por avaliação (review)
   • tbs="mr:1,price:1,ppr_min:100,ppr_max:500" → faixa de preço R$100-R$500

 Você também pode combinar com `num=40` para trazer mais resultados por página.

================================================================================
"""

import os
import json
import sys
from datetime import datetime

# ──────────────────────────────────────────────────────
# CONFIGURAÇÃO
# ──────────────────────────────────────────────────────
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "SUA_CHAVE_AQUI")

# Parâmetros de busca
SEARCH_PARAMS = {
    "engine": "google_shopping",          # Motor: Google Shopping
    "q": "Tênis Nike Basquete",           # Termo de busca
    "gl": "br",                           # País: Brasil
    "hl": "pt",                           # Idioma: Português
    "location": "Brazil",                 # Localização geográfica
    "tbs": "p_ord:p",                     # ★ Ordenar por menor preço
    "num": 30,                            # Quantidade de resultados
    "api_key": SERPAPI_KEY,
}


def buscar_com_requests() -> dict:
    """
    Método 1: Usando a biblioteca `requests` (sem dependência extra).
    Faz uma chamada GET direta à API REST da SerpApi.
    """
    import requests

    url = "https://serpapi.com/search.json"
    response = requests.get(url, params=SEARCH_PARAMS, timeout=30)
    response.raise_for_status()
    return response.json()


def buscar_com_serpapi_lib() -> dict:
    """
    Método 2: Usando a biblioteca oficial `google-search-results`.
    Instale com: pip install google-search-results
    """
    from serpapi import GoogleSearch

    search = GoogleSearch(SEARCH_PARAMS)
    return search.get_dict()


def extrair_resultados(dados_json: dict) -> list[dict]:
    """
    Parsing & Filtro — Extrai apenas as informações relevantes
    do array `shopping_results` retornado pela SerpApi.

    Retorna uma lista de dicionários com:
      - produto  (str)  : nome do produto
      - loja     (str)  : nome do merchant / loja
      - preco    (float): preço numérico
      - preco_fmt(str)  : preço formatado (ex: "R$ 499,90")
      - link     (str)  : URL de compra
      - imagem   (str)  : URL da thumbnail
      - entrega  (str)  : informação de frete/entrega
      - avaliacao(float): nota de avaliação
    """
    shopping = dados_json.get("shopping_results", [])

    if not shopping:
        print("⚠️  Nenhum resultado encontrado em 'shopping_results'.")
        print("    Chaves disponíveis no JSON:", list(dados_json.keys()))
        return []

    resultados = []
    for item in shopping:
        resultados.append({
            "produto":   item.get("title", "N/A"),
            "loja":      item.get("source", "N/A"),
            "preco":     item.get("extracted_price", 0.0),
            "preco_fmt": item.get("price", "N/A"),
            "link":      item.get("link", "#"),
            "imagem":    item.get("thumbnail", ""),
            "entrega":   item.get("delivery", ""),
            "avaliacao": item.get("rating", None),
        })

    # Ordena localmente por preço (caso a API não tenha respeitado tbs)
    resultados.sort(key=lambda x: x["preco"] if x["preco"] else float("inf"))

    return resultados


def imprimir_resultados(resultados: list[dict]) -> None:
    """Exibe os resultados de forma limpa no terminal."""
    print("\n" + "=" * 72)
    print(f"  🛒 SmartCart — Comparação de Preços ({len(resultados)} resultados)")
    print(f"  🔍 Busca: \"{SEARCH_PARAMS['q']}\"")
    print(f"  📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 72)

    for i, r in enumerate(resultados, 1):
        preco_display = r["preco_fmt"] if r["preco_fmt"] != "N/A" else f"R$ {r['preco']:.2f}"
        entrega_display = f" | 🚚 {r['entrega']}" if r["entrega"] else ""
        avaliacao_display = f" | ⭐ {r['avaliacao']}" if r["avaliacao"] else ""

        print(f"\n  [{i:02d}] 📦 Produto: {r['produto']}")
        print(f"       🏪 Loja:    {r['loja']}")
        print(f"       💰 Preço:   {preco_display}{entrega_display}{avaliacao_display}")
        print(f"       🔗 Link:    {r['link'][:80]}...")

    print("\n" + "=" * 72)

    # Estatísticas
    precos = [r["preco"] for r in resultados if r["preco"] and r["preco"] > 0]
    if precos:
        print(f"\n  📊 Estatísticas:")
        print(f"     Menor preço: R$ {min(precos):>10,.2f}  ({resultados[0]['loja']})")
        print(f"     Maior preço: R$ {max(precos):>10,.2f}")
        print(f"     Média:       R$ {sum(precos)/len(precos):>10,.2f}")
        economia = max(precos) - min(precos)
        print(f"     Economia:    R$ {economia:>10,.2f} ({economia/max(precos)*100:.0f}% de desconto)")
    print()


def salvar_json_bruto(dados: dict, arquivo: str = "serpapi_response.json") -> None:
    """Salva o JSON bruto completo para análise posterior."""
    caminho = os.path.join(os.path.dirname(__file__), arquivo)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    print(f"  💾 JSON bruto salvo em: {caminho}")


def gerar_dados_mock() -> dict:
    """
    Dados simulados para testar o parsing sem gastar créditos da API.
    Estrutura idêntica ao JSON real da SerpApi.
    """
    return {
        "search_metadata": {
            "id": "mock_001",
            "status": "Success",
            "created_at": datetime.now().isoformat(),
        },
        "search_parameters": SEARCH_PARAMS,
        "shopping_results": [
            {
                "position": 1,
                "title": "Tênis Nike Air Max Impact 4 Masculino - Basquete",
                "link": "https://www.magazineluiza.com.br/tenis-nike-air-max-impact-4/p/abc123/",
                "source": "Magazine Luiza",
                "price": "R$ 349,90",
                "extracted_price": 349.90,
                "thumbnail": "https://images.example.com/nike-impact-4.jpg",
                "delivery": "Frete grátis",
                "rating": 4.7,
                "reviews": 234,
            },
            {
                "position": 2,
                "title": "Tênis Nike Precision 6 Masculino - Basquete",
                "link": "https://www.amazon.com.br/dp/B0EXAMPLE1/",
                "source": "Amazon.com.br",
                "price": "R$ 299,99",
                "extracted_price": 299.99,
                "thumbnail": "https://images.example.com/nike-precision-6.jpg",
                "delivery": "Frete grátis com Prime",
                "rating": 4.5,
                "reviews": 187,
            },
            {
                "position": 3,
                "title": "Tênis Nike LeBron Witness 7 - Basquete Masculino",
                "link": "https://www.netshoes.com.br/tenis-nike-lebron-witness-7/XYZ456",
                "source": "Netshoes",
                "price": "R$ 529,99",
                "extracted_price": 529.99,
                "thumbnail": "https://images.example.com/lebron-witness-7.jpg",
                "delivery": "Entrega em 3 dias",
                "rating": 4.8,
                "reviews": 312,
            },
            {
                "position": 4,
                "title": "Tênis Nike KD 16 Masculino - Basquete",
                "link": "https://www.centauro.com.br/tenis-nike-kd-16/DEF789",
                "source": "Centauro",
                "price": "R$ 899,90",
                "extracted_price": 899.90,
                "thumbnail": "https://images.example.com/nike-kd-16.jpg",
                "delivery": "Retire na loja",
                "rating": 4.9,
                "reviews": 89,
            },
            {
                "position": 5,
                "title": "Tênis Nike Zoom Freak 5 Basquete",
                "link": "https://www.mercadolivre.com.br/tenis-nike-zoom-freak-5/MLB12345",
                "source": "Mercado Livre",
                "price": "R$ 419,00",
                "extracted_price": 419.00,
                "thumbnail": "https://images.example.com/nike-freak-5.jpg",
                "delivery": "Frete grátis Full",
                "rating": 4.6,
                "reviews": 156,
            },
            {
                "position": 6,
                "title": "Tênis Nike Air Max Impact 4 - Preto e Branco",
                "link": "https://www.casasbahia.com.br/tenis-nike-impact-4/GHI012",
                "source": "Casas Bahia",
                "price": "R$ 379,90",
                "extracted_price": 379.90,
                "thumbnail": "https://images.example.com/nike-impact-4-pb.jpg",
                "delivery": "Frete grátis",
                "rating": 4.4,
                "reviews": 67,
            },
            {
                "position": 7,
                "title": "Tênis Nike Giannis Immortality 3 Basquete",
                "link": "https://www.nike.com.br/tenis-giannis-immortality-3/JKL345",
                "source": "Nike.com.br",
                "price": "R$ 599,99",
                "extracted_price": 599.99,
                "thumbnail": "https://images.example.com/giannis-3.jpg",
                "delivery": "Frete grátis acima de R$299",
                "rating": 4.7,
                "reviews": 201,
            },
            {
                "position": 8,
                "title": "Tênis Nike Precision 6 Flyease - Basquete",
                "link": "https://www.dafiti.com.br/tenis-nike-precision-flyease/MNO678",
                "source": "Dafiti",
                "price": "R$ 319,90",
                "extracted_price": 319.90,
                "thumbnail": "https://images.example.com/precision-flyease.jpg",
                "delivery": "Entrega em 5 dias úteis",
                "rating": 4.3,
                "reviews": 45,
            },
        ],
    }


# ──────────────────────────────────────────────────────
# EXECUÇÃO PRINCIPAL
# ──────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n  🚀 SmartCart — PoC SerpApi (Google Shopping)\n")

    usar_mock = "--mock" in sys.argv or SERPAPI_KEY == "SUA_CHAVE_AQUI"

    if usar_mock:
        print("  ℹ️  Usando dados MOCK (simulados).")
        print("     Para usar a API real, defina SERPAPI_KEY ou passe a chave.\n")
        dados = gerar_dados_mock()
    else:
        print(f"  🌐 Buscando na SerpApi: \"{SEARCH_PARAMS['q']}\"...")
        try:
            dados = buscar_com_requests()
        except ImportError:
            print("  ⚠️  'requests' não encontrado. Tentando com serpapi lib...")
            dados = buscar_com_serpapi_lib()

    # Salvar JSON bruto para análise
    salvar_json_bruto(dados)

    # Parsing: extrair dados limpos
    resultados = extrair_resultados(dados)

    # Exibir no terminal
    imprimir_resultados(resultados)

    # Exportar para uso no app (JSON limpo)
    caminho_limpo = os.path.join(os.path.dirname(__file__), "resultados_limpos.json")
    with open(caminho_limpo, "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    print(f"  💾 Resultados limpos salvos em: {caminho_limpo}\n")
