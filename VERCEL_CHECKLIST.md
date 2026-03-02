# Checklist — Deploy na Vercel ✅

## Antes de Fazer Push para Vercel

### 1. Verificar Imports (Case Sensitivity)

```bash
cd frontend
npm run lint
```

**Procurar por:**
- ❌ `import { Component } from './component'` (deve ser `./Component`)
- ❌ `import logo from './logo.png'` em `public/`

### 2. Build Local

```bash
cd frontend
npm run build
npm run start  # Testar build em produção

# Deve rodear sem erros em http://localhost:3000
```

### 3. Verificar Estrutura

```
smartcart/
├── vercel.json              ✅ Criado
├── frontend/
│   ├── next.config.js       ✅ Atualizado
│   ├── package.json
│   ├── public/              ✅ Existe
│   ├── src/
│   │   ├── app/page.tsx     ✅ Existe
│   │   ├── app/layout.tsx   ✅ Existe
│   │   └── ...
│   └── .next/               (gerado pelo build)
└── backend/                 (opcional para Vercel, apenas frontend)
```

### 4. Variáveis de Ambiente

```bash
# Verificar .env.local (local)
cat frontend/.env.local
# Deve ter:
# NEXT_PUBLIC_API_URL=/api/v1

# Verificar que NÃO está commitado
git status | grep .env
# Resultado: nada (deve estar no .gitignore)
```

### 5. Git Status

```bash
git status
# Deve mostrar:
# ✅ vercel.json (novo)
# ✅ frontend/next.config.js (modificado)
# ✅ docs/VERCEL_DEPLOYMENT.md (novo)
# Nada de .env ou arquivo sensível

# Commit
git add .
git commit -m "fix: configure Vercel deployment and Next.js"
```

---

## Na Dashboard Vercel

### 1. Conectar Repositório

- [ ] Acesse vercel.com
- [ ] Clique "New Project"
- [ ] Selecione repositório GitHub
- [ ] Clique "Import"

### 2. Configurar Ambiente

**Root Directory (se perguntado):**
- [ ] Deixe vazio ou `./`

**Framework:**
- [ ] Deve estar com "Next.js"

**Build Settings:**
- [ ] Build Command: `cd frontend && npm run build` (se não auto-detectar)
- [ ] Output Directory: `frontend/.next`
- [ ] Install Command: `cd frontend && npm install`

### 3. Variáveis de Ambiente

- [ ] Clique "Environment Variables"
- [ ] Adicione:
  ```
  BACKEND_URL = https://seu-backend.com
  ```
- [ ] Selecione: Production + Preview + Development
- [ ] Clique "Save"

### 4. Deploy

- [ ] Clique "Deploy"
- [ ] Aguarde 2-5 minutos
- [ ] Status deve ficar verde ✅

---

## Após Deploy

### 1. Testar Rotas

```bash
# Abrir em browser
https://seu-projeto.vercel.app/           # Home
https://seu-projeto.vercel.app/listas      # Listas
https://seu-projeto.vercel.app/alertas     # Alertas
https://seu-projeto.vercel.app/assistente  # Assistente
https://seu-projeto.vercel.app/encartes    # Encartes
```

**Esperado:**
- ✅ Página carrega (não 404)
- ✅ HTML válido
- ✅ CSS aplicado
- ✅ Sem erros no console (F12 > Console)

### 2. Testar API Proxy

```bash
# Terminal
curl https://seu-projeto.vercel.app/api/v1/health

# Esperado: {"status":"healthy"}
# Se 502 Bad Gateway: backend não está rodando
# Se 404: BACKEND_URL não configurada
```

### 3. Testar HTTPS

```bash
curl -I http://seu-projeto.vercel.app
# Esperado: 307 Temporary Redirect → https://
```

---

## Troubleshooting Rápido

| Erro | Causa | Solução |
|------|-------|---------|
| **404 em todas rotas** | `.next` não gerado ou `outputDirectory` errado | Verificar `vercel.json` e `next.config.js` |
| **Cannot find module** | Case sensitivity (ProductCard vs productcard) | Corrigir imports |
| **502 Bad Gateway na API** | BACKEND_URL errado ou backend offline | Verificar Environment Variables |
| **Build falha** | npm install não rodou | Limpar cache: Settings > Advanced > Clear Build Cache |
| **Página em branco** | JS error não capturado | F12 > Console, ver erro |
| **CSS não aplica** | Tailwind não compilou | Rodar build local, verificar import |

---

## Checklist Final

- [ ] `vercel.json` criado na raiz
- [ ] `frontend/next.config.js` atualizado
- [ ] Build local funciona: `npm run build && npm run start`
- [ ] Não há erros de import (case sensitivity)
- [ ] `.env` não está commitado (`.gitignore`)
- [ ] `BACKEND_URL` configurada em Environment Variables
- [ ] Push feito para main
- [ ] Deploy completou com sucesso (verde ✅)
- [ ] Rotas funcionam (sem 404)
- [ ] API proxy funciona (sem 502)
- [ ] HTTPS redireciona (sem avisos)

---

## Próximos Passos

Se tudo passar no checklist:

1. ✅ Frontend está em produção
2. ⏳ Configurar backend em produção (Railway, Render, etc)
3. ⏳ Atualizar `BACKEND_URL` com URL de produção
4. ⏳ Testar integração completa

---

## Ajuda Rápida

**Redeploy sem push:**
1. Dashboard > Deployments
2. Clique "..." no último deploy
3. Clique "Redeploy"

**Ver logs:**
1. Dashboard > Deployments
2. Clique no deploy verde
3. Clique "Logs"

**Limpar cache:**
1. Settings > Advanced
2. "Clear Build Cache"
3. Redeploy

