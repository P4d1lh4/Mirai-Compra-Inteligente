# Guia de Deployment — SmartCart

## Pré-requisitos

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 16 (ou usar Docker)
- Redis (ou usar Docker)

---

## Local Development

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Criar .env
cp ../.env.example .env
# Editar .env com valores locais

# Rodas migrations
alembic upgrade head

# Iniciar server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev  # http://localhost:3010
```

### 3. Docker Compose (Database + Redis)

```bash
docker-compose up -d
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

---

## Produção

### 1. Preparar servidor

**Sistema Operacional**: Ubuntu 22.04 LTS

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install -y docker.io docker-compose

# Instalar Node + Python (se não usar Docker)
sudo apt install -y nodejs python3.11 python3-pip
```

### 2. Configurar variáveis de ambiente

```bash
# Criar .env em produção
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "SECRET_KEY=$SECRET_KEY" >> .env

# Editar .env com valores de produção:
cat .env.example >> .env

# Valores críticos:
# DEBUG=false
# SMARTCART_ENV=production
# DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/smartcart
# REDIS_URL=redis://redis:6379/0
# SECRET_KEY=<seu-secret-key-aleatorio>
# SERPAPI_KEY=<sua-chave>
# GROQ_API_KEY=<sua-chave>
```

### 3. Docker Compose para produção

```bash
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: smartcart
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: smartcart
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: always

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql+asyncpg://smartcart:${DB_PASSWORD}@postgres:5432/smartcart
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=false
      - SMARTCART_ENV=production
      - SERPAPI_KEY=${SERPAPI_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    restart: always
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost/api/v1
    ports:
      - "3000:3000"
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: always

volumes:
  postgres_data:
```

### 4. Nginx Config (nginx.conf)

```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # CORS & Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API Proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 5. Deploy com Docker Compose

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## CI/CD com GitHub Actions

O arquivo `.github/workflows/ci.yml` já está configurado. Ao fazer push:

1. ✅ Lint (ESLint, Flake8)
2. ✅ Tests (Jest, Pytest)
3. ✅ Type checking
4. ✅ Build
5. ✅ Security scan

Para ativar auto-deploy:

```yaml
# Adicionar ao final de ci.yml:
deploy:
  runs-on: ubuntu-latest
  needs: [lint-and-test-frontend, lint-and-test-backend]
  if: github.ref == 'refs/heads/main'

  steps:
    - uses: actions/checkout@v4
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_KEY }}
        script: |
          cd /opt/smartcart
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Configurar Secrets no GitHub

1. Ir a **Settings > Secrets and variables > Actions**
2. Adicionar:
   - `SERVER_HOST`: IP ou domain do servidor
   - `SERVER_USER`: SSH user
   - `SERVER_KEY`: Conteúdo da chave privada SSH

---

## Monitoramento

### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Salvar logs
docker-compose logs backend > backend.log
```

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

### Backups

```bash
# Backup do banco
docker-compose exec postgres pg_dump -U smartcart smartcart > backup.sql

# Restaurar
cat backup.sql | docker-compose exec -T postgres psql -U smartcart smartcart
```

---

## Troubleshooting

### Backend não conecta no banco

```bash
# Verificar variáveis de ambiente
docker-compose config | grep DATABASE_URL

# Testar conexão
docker-compose exec backend python
>>> from sqlalchemy import create_engine
>>> engine = create_engine("postgresql://...")
>>> list(engine.execute("SELECT 1"))
```

### Frontend não carrega API

Verificar `.env` no frontend:
```
NEXT_PUBLIC_API_URL=http://localhost/api/v1
# Ou em produção:
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
```

### CORS errors

Editar `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Rollback

Se algo der errado após deploy:

```bash
git revert HEAD
git push origin main

# Na CI/CD, auto-deploy fará rollback
```

Ou manual:

```bash
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml restart
```

