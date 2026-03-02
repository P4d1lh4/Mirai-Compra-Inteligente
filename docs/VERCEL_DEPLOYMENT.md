# Guia de Deployment na Vercel — SmartCart

## Problema: Erro 404 NOT_FOUND

Se você está enfrentando erro 404 na Vercel ao acessar rotas que funcionam localmente, este guia resolve o problema.

---

## Solução Implementada

### 1. Arquivo `vercel.json` Criado ✅

Arquivo na **raiz do projeto** (`/vercel.json`):

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "devCommand": "cd frontend && npm run dev",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "${BACKEND_URL}/api/:path*"
    }
  ]
}
```

**O que faz:**
- Define Next.js como framework
- Aponta pasta `.next` como output (build)
- Configura rewrite para API proxy
- Usa variável `BACKEND_URL` do ambiente

### 2. Configuração Next.js Atualizada ✅

Arquivo `frontend/next.config.js` melhorado:

```javascript
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',  // Output directory
  compress: true,
  poweredByHeader: false,
  
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  
  // Redirect HTTP → HTTPS em produção
  async redirects() {
    if (process.env.VERCEL_ENV === 'production') {
      return [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          permanent: true,
          destination: 'https://:host/:path*',
        },
      ];
    }
    return [];
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};
```

---

## Deploy na Vercel

### Passo 1: Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Clique em "Import"

### Passo 2: Configurar Variáveis de Ambiente

Na página de configuração do projeto, em **Environment Variables**:

```
Nome: BACKEND_URL
Valor: https://seu-backend.com  (sua API em produção)
Ambientes: Production, Preview, Development
```

Exemplo:
```
BACKEND_URL = https://api.smartcart.com
```

ou se usando Railway/Render:
```
BACKEND_URL = https://smartcart-backend-abc.railway.app
```

### Passo 3: Configurar Framework

Vercel deve detectar automaticamente, mas para garantir:

1. **Root Directory**: `./` (raiz)
2. **Framework Preset**: `Next.js`
3. **Build Command**: `cd frontend && npm run build`
4. **Output Directory**: `frontend/.next`
5. **Install Command**: `cd frontend && npm install`

### Passo 4: Deploy

```bash
# Ou simplesmente fazer push para main/develop
git push origin main

# Vercel fará auto-deploy
```

---

## Testando o Deploy

Após deploy bem-sucedido:

```bash
# Test 1: Verificar que rotas funcionam
curl https://seu-projeto.vercel.app/
curl https://seu-projeto.vercel.app/listas
curl https://seu-projeto.vercel.app/alertas

# Test 2: Verificar API proxy
curl https://seu-projeto.vercel.app/api/v1/health

# Test 3: Verificar HTTPS redirect
curl -I http://seu-projeto.vercel.app
# Esperado: 307 Temporary Redirect → HTTPS
```

---

## Troubleshooting

### Erro: "Build failed: Command failed"

**Solução:**
```bash
# Verificar que build funciona localmente
cd frontend
npm run build

# Se falhar, verificar erro
npm install  # reinstalar dependências
npm run build
```

### Erro: "Cannot find module"

**Causa:** Case sensitivity no Linux (servidor Vercel) vs Windows

**Solução:**
- Verificar imports com case correto
- Windows ignora maiúsculas, Linux não
- Exemplo:
  ```javascript
  // ❌ Errado (se arquivo é ProductCard.tsx)
  import { ProductCard } from './productcard'
  
  // ✅ Correto
  import { ProductCard } from './ProductCard'
  ```

### Erro: 404 em todas as rotas

**Causa:** Pasta `frontend/` não encontrada ou `.next` não gerado

**Solução:**
1. Verificar `vercel.json` está na **raiz**
2. Verificar `outputDirectory: "frontend/.next"`
3. Limpar cache: Vercel > Settings > Advanced > Clear Build Cache
4. Redeploy: Redeploy na dashboard

### API retorna 404

**Causa:** `BACKEND_URL` não definida ou incorreta

**Solução:**
1. Ir a Project Settings > Environment Variables
2. Verificar `BACKEND_URL` está configurada
3. Verificar URL do backend está correto
4. Redeploy

---

## Estrutura Esperada

```
smartcart/
├── vercel.json                 # ← Configuração Vercel
├── frontend/
│   ├── next.config.js          # ← Config Next.js atualizada
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Home
│   │   │   ├── layout.tsx
│   │   │   ├── listas/page.tsx # Rota /listas
│   │   │   ├── alertas/page.tsx # Rota /alertas
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── backend/
│   └── ...
└── README.md
```

---

## Variáveis de Ambiente (Vercel)

### Production

```
BACKEND_URL = https://api.smartcart.com
NEXT_PUBLIC_API_URL = https://api.smartcart.com/api/v1
NODE_ENV = production
```

### Preview/Development

```
BACKEND_URL = https://dev-api.smartcart.com
NEXT_PUBLIC_API_URL = /api/v1
NODE_ENV = development
```

---

## Como Atualizar após Deploy

### Opção 1: Git Push (Recomendado)

```bash
git add .
git commit -m "fix: update Vercel configuration"
git push origin main

# Vercel fará auto-deploy
```

### Opção 2: Redeploy Manual

1. Acesse https://vercel.com/dashboard
2. Selecione projeto
3. Clique em "Deployments"
4. Clique em "..." ao lado de um deploy
5. Clique em "Redeploy"

---

## Performance & Otimizações

Vercel oferece otimizações automáticas:

- ✅ Edge Network (CDN global)
- ✅ Serverless Functions
- ✅ Image Optimization
- ✅ Automatic Compression
- ✅ Hot Module Replacement

Para ativar Image Optimization:

```javascript
// frontend/next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
};
```

---

## Analytics & Logs

### Ver Logs em Tempo Real

Vercel Dashboard > Project > Deployments > Logs

### Monitorar Performance

Vercel Dashboard > Project > Analytics

---

## Suporte

- **Documentação Vercel:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/app/building-your-application/deploying
- **Community:** https://github.com/vercel/vercel/discussions

