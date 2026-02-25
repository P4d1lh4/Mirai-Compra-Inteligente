# 🛒 SmartCart Brasil

**Plataforma Inteligente de Economia para o Consumidor Brasileiro**

Agregador omnicanal de ofertas de supermercados com comparação de preços, listas inteligentes e alertas — assistido por IA.

## Arquitetura

```
smartcart/
├── backend/          # FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── api/      # Rotas da API
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Lógica de negócio
│   │   └── core/     # Config, DB, auth
│   └── requirements.txt
├── frontend/         # Next.js 14+ (App Router, PWA)
│   ├── src/
│   │   ├── app/      # Pages & layouts
│   │   ├── components/
│   │   ├── lib/      # Utils, API client
│   │   └── hooks/    # Custom React hooks
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, PWA |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Banco de Dados | PostgreSQL 16 + Redis |
| Busca | PostgreSQL Full-Text Search (MVP) → Typesense (v2) |
| Infra | Docker Compose (dev) |

## Quickstart

```bash
# 1. Subir toda a infra
docker-compose up -d

# 2. Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
python -m app.seed  # dados de exemplo
uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd frontend
npm install
npm run dev
```

**API docs:** http://localhost:8000/docs  
**Frontend:** http://localhost:3000

## SerpApi (Google Shopping)

Para ativar busca real de ofertas (sem mock), defina a variável no backend:

```bash
# backend/.env
SERPAPI_KEY=sua_chave_serpapi
```

Endpoint principal:

```http
GET /api/v1/serpapi/shopping?q=arroz%205kg&ordenar_preco=true&num=20&preco_min=10&preco_max=60
```

Sem `SERPAPI_KEY`, a API responde em modo mock para desenvolvimento local.

## Funcionalidades MVP

- [x] Busca de produtos com comparação de preços
- [x] Encartes digitais interativos
- [x] Lista de compras com total por mercado
- [x] Alertas de queda de preço
- [x] Link-out rastreado para e-commerce parceiro
- [x] Geolocalização (distância das lojas)
- [x] PWA (instalar na home screen)

## Licença

Proprietário — Todos os direitos reservados.
