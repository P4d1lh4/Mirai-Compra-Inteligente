<p align="center">
  <img src="frontend/public/logo.png" alt="Mirai Logo" width="120" />
</p>

<h1 align="center">🛒 Mirai — Compra Inteligente</h1>

<p align="center">
  <strong>Plataforma de comparação de preços de supermercado assistida por IA</strong><br/>
  Compare ofertas reais, crie listas inteligentes e economize em cada compra.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776ab?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06b6d4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-dc382d?logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285f4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white" />
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Stack Técnico](#-stack-técnico)
- [Arquitetura](#-arquitetura)
- [Quickstart](#-quickstart)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Páginas do Frontend](#-páginas-do-frontend)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

**Mirai — Compra Inteligente** é uma plataforma web que ajuda o consumidor brasileiro a encontrar os melhores preços de supermercado. Por meio da integração com a SerpAPI (Google Shopping) e modelos de IA (Google Gemini), o sistema oferece:

- **Busca real de produtos** com comparação de preços entre múltiplos mercados
- **Assistente de IA** que conversa e sugere produtos com base nas suas necessidades
- **Listas de compras inteligentes** geradas automaticamente por IA
- **Alertas de preço** para acompanhar ofertas dos seus produtos favoritos
- **Geolocalização** para encontrar lojas próximas e selecionar endereços salvos

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔍 **Busca de Produtos** | Pesquisa com filtros de preço, ordenação e categorias via SerpAPI |
| 📊 **Comparação de Preços** | Cards comparativos com preço, loja, avaliação e link direto |
| 🤖 **Assistente IA (Chat)** | Conversa multi-turno com Gemini para encontrar produtos ideais |
| 📝 **Listas de Compras** | CRUD completo de listas com total por mercado |
| 🧠 **Listas por IA** | Geração automática de lista de compras via prompt de linguagem natural |
| 🔔 **Alertas de Preço** | Notificações quando produtos atingem o preço desejado |
| 📍 **Geolocalização** | Detecção automática + seletor de endereço salvo no header |
| 👤 **Autenticação** | Login e cadastro com JWT (access + refresh tokens) |
| 👤 **Perfil do Usuário** | Gerenciamento de dados pessoais, endereços e preferências |
| 📱 **PWA** | Instalável na home screen do celular |

---

## 🛠 Stack Técnico

### Frontend

| Tecnologia | Uso |
|---|---|
| [Next.js 14](https://nextjs.org/) | Framework React com App Router e SSR |
| [React 18](https://react.dev/) | Biblioteca de UI com hooks e composição |
| [TypeScript 5.5](https://www.typescriptlang.org/) | Tipagem estática em todo o frontend |
| [Tailwind CSS 3.4](https://tailwindcss.com/) | Estilização utilitária com tema customizado |
| [Zustand 4.5](https://zustand-demo.pmnd.rs/) | Gerenciamento de estado global leve |
| [Lucide React](https://lucide.dev/) | Biblioteca de ícones SVG |
| [clsx](https://github.com/lukeed/clsx) | Utilitário para classes CSS condicionais |

### Backend

| Tecnologia | Uso |
|---|---|
| [FastAPI 0.115](https://fastapi.tiangolo.com/) | Framework API assíncrono de alta performance |
| [Python 3.11+](https://www.python.org/) | Linguagem do backend |
| [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | ORM async com suporte a PostgreSQL |
| [Alembic 1.14](https://alembic.sqlalchemy.org/) | Migrations de banco de dados |
| [Pydantic 2.10](https://docs.pydantic.dev/) | Validação de dados e schemas |
| [python-jose](https://github.com/mpdavis/python-jose) | Geração e validação de tokens JWT |
| [passlib + bcrypt](https://passlib.readthedocs.io/) | Hash seguro de senhas |
| [httpx 0.28](https://www.python-httpx.org/) | Cliente HTTP assíncrono (SerpAPI) |
| [Google GenAI SDK](https://ai.google.dev/) | Integração com Google Gemini (chat e listas IA) |
| [geopy 2.4](https://geopy.readthedocs.io/) | Geocodificação e cálculo de distâncias |
| [Unidecode](https://github.com/avian2/unidecode) | Normalização de texto (acentos) |

### Infraestrutura

| Tecnologia | Uso |
|---|---|
| [PostgreSQL 16](https://www.postgresql.org/) | Banco de dados relacional principal |
| [Redis 7](https://redis.io/) | Cache e sessões |
| [Docker Compose](https://docs.docker.com/compose/) | Orquestração dos serviços (DB + Redis) |
| [Uvicorn](https://www.uvicorn.org/) | Servidor ASGI para o FastAPI |

---

## 📁 Arquitetura

```
mirai-compra-inteligente/
│
├── backend/                    # API FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── api/                # Rotas REST
│   │   │   ├── auth.py         # Login, cadastro, refresh token
│   │   │   ├── products.py     # Busca e detalhe de produtos
│   │   │   ├── serpapi.py      # Proxy para Google Shopping
│   │   │   ├── shopping_lists.py # CRUD de listas de compras
│   │   │   ├── alerts.py       # Alertas de preço
│   │   │   ├── ai_chat.py      # Chat com assistente IA
│   │   │   ├── ai_lists.py     # Geração de listas por IA
│   │   │   ├── profile.py      # Perfil e endereços do usuário
│   │   │   ├── stores.py       # Lojas e geolocalização
│   │   │   ├── flyers.py       # Encartes digitais
│   │   │   └── prices.py       # Histórico de preços
│   │   ├── models/             # SQLAlchemy models (User, Product, List, Alert...)
│   │   ├── schemas/            # Pydantic schemas (request/response)
│   │   ├── services/           # Lógica de negócios
│   │   │   ├── serpapi_service.py    # Integração SerpAPI
│   │   │   ├── ai_chat_service.py    # Gemini multi-turno
│   │   │   ├── ai_list_service.py    # Gemini para listas
│   │   │   ├── auth_service.py       # JWT + bcrypt
│   │   │   ├── product_service.py    # Busca e filtros
│   │   │   └── ...
│   │   ├── core/               # Config, database, auth helpers
│   │   ├── main.py             # Entrypoint FastAPI
│   │   └── seed.py             # Dados de exemplo
│   └── requirements.txt
│
├── frontend/                   # Next.js 14 (App Router, TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Home — busca principal
│   │   │   ├── layout.tsx      # Layout global com Header
│   │   │   ├── entrar/         # Página de login
│   │   │   ├── cadastro/       # Página de cadastro
│   │   │   ├── listas/         # Minhas listas de compras
│   │   │   ├── alertas/        # Alertas de preço
│   │   │   ├── assistente/     # Chat com assistente IA
│   │   │   ├── perfil/         # Perfil do usuário
│   │   │   ├── produto/        # Detalhe do produto
│   │   │   └── encartes/       # Encartes digitais
│   │   ├── components/
│   │   │   ├── Header.tsx      # Navbar com LocationSwitcher
│   │   │   ├── SearchBar.tsx   # Barra de busca
│   │   │   ├── ProductCard.tsx # Card de produto
│   │   │   ├── PriceComparisonList.tsx
│   │   │   ├── AIListModal.tsx # Modal de geração IA
│   │   │   ├── FlyerCard.tsx   # Card de encarte
│   │   │   └── CategoryPills.tsx
│   │   ├── contexts/           # AuthContext (React Context)
│   │   ├── hooks/              # useGeolocation (geoloc + endereço manual)
│   │   └── lib/                # API client, utils
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml          # PostgreSQL 16 + Redis 7
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart

### Pré-requisitos

- **Python 3.11+** com `pip`
- **Node.js 18+** com `npm`
- **Docker** e **Docker Compose** (para PostgreSQL e Redis)

### 1. Clone o repositório

```bash
git clone https://github.com/P4d1lh4/Mirai---Compra-Inteligente.git
cd Mirai---Compra-Inteligente
```

### 2. Suba a infraestrutura

```bash
docker-compose up -d
```

> Isso inicia o **PostgreSQL 16** na porta `5432` e o **Redis 7** na porta `6379`.

### 3. Configure o backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
```

Crie o arquivo `.env` (veja [Variáveis de Ambiente](#-variáveis-de-ambiente)):

```bash
cp .env.example .env
# edite com suas chaves
```

Inicie o servidor:

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Configure o frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Acesse

| Serviço | URL |
|---|---|
| 🖥 Frontend | http://localhost:3010 |
| 📡 API Docs (Swagger) | http://localhost:8000/docs |
| 📡 API Docs (ReDoc) | http://localhost:8000/redoc |
| ❤️ Health Check | http://localhost:8000/health |

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `backend/.env` com as seguintes variáveis:

```env
# Database
DATABASE_URL=postgresql+asyncpg://smartcart:smartcart123@localhost:5432/smartcart

# Auth (JWT)
SECRET_KEY=sua-chave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3010

# SerpAPI — Busca real no Google Shopping
SERPAPI_KEY=sua_chave_serpapi

# Google Gemini — Chat IA e Listas Inteligentes
GOOGLE_API_KEY=sua_chave_google_gemini

# Debug mode
DEBUG=true
```

> **Sem `SERPAPI_KEY`**, a API funciona em modo mock para desenvolvimento local.  
> **Sem `GOOGLE_API_KEY`**, as funcionalidades de IA ficam desativadas.

---

## 📡 Endpoints da API

Todos os endpoints são prefixados com `/api/v1`.

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Criar conta |
| `POST` | `/auth/login` | Login (retorna JWT) |
| `POST` | `/auth/refresh` | Renovar access token |

### Produtos & Preços
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/products/search` | Buscar produtos |
| `GET` | `/products/{id}` | Detalhe do produto |
| `GET` | `/serpapi/shopping` | Busca real via Google Shopping |
| `GET` | `/prices/history/{id}` | Histórico de preços |

### Listas de Compras
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/shopping-lists` | Listar listas do usuário |
| `POST` | `/shopping-lists` | Criar nova lista |
| `PUT` | `/shopping-lists/{id}` | Atualizar lista |
| `DELETE` | `/shopping-lists/{id}` | Remover lista |
| `POST` | `/shopping-lists/{id}/items` | Adicionar item à lista |

### Alertas de Preço
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/alerts` | Listar alertas |
| `POST` | `/alerts` | Criar alerta |
| `DELETE` | `/alerts/{id}` | Remover alerta |

### Inteligência Artificial
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/ai/chat` | Conversar com assistente IA |
| `POST` | `/ai/generate-list` | Gerar lista de compras via IA |

### Perfil & Endereços
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/profile` | Dados do perfil |
| `PUT` | `/profile` | Atualizar perfil |
| `GET` | `/profile/addresses` | Listar endereços |
| `POST` | `/profile/addresses` | Adicionar endereço |

### Outros
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/stores` | Listar lojas próximas |
| `GET` | `/flyers` | Encartes digitais |

---

## 🖥 Páginas do Frontend

| Rota | Página | Descrição |
|---|---|---|
| `/` | Home | Busca principal com grid de resultados |
| `/entrar` | Login | Autenticação de usuário |
| `/cadastro` | Cadastro | Criar nova conta |
| `/listas` | Minhas Listas | CRUD de listas + geração por IA |
| `/alertas` | Alertas | Gerenciar alertas de preço |
| `/assistente` | Assistente IA | Chat multi-turno com Gemini |
| `/perfil` | Perfil | Dados pessoais e endereços |
| `/produto/[id]` | Detalhe | Histórico de preços e comparação |
| `/encartes` | Encartes | Encartes digitais dos supermercados |

---

## 📄 Licença

Proprietário — Todos os direitos reservados.

---

<p align="center">
  Feito com 💜 por <strong>Mirai Team</strong>
</p>
