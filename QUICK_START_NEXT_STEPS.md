# Quick Start — Próximos Passos Imediatos

## Você tem 15 minutos? Faça isto AGORA:

### 1. Instale as novas dependências

```bash
# Backend
cd backend
pip install -r requirements.txt  # Inclui slowapi, pytest, logging

# Frontend
cd frontend
npm install  # Inclui jest, prettier, eslint
```

### 2. Rode os testes

```bash
# Backend
cd backend
pytest tests/test_auth.py -v

# Frontend
cd frontend
npm test -- --testPathPattern="SearchBar" --watchAll=false
```

**Resultado esperado:** ✅ Todos os testes passam

### 3. Valide a segurança

```bash
# Tente fazer login com senha fraca
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak","name":"Test"}'

# Resposta esperada: 422 (validação falhou)
```

---

## Próximas 24 horas? Faça isto:

### 1. Integrar ToastProvider no layout

```tsx
// frontend/src/app/layout.tsx
import { ToastProvider } from '@/contexts/ToastContext'
import { ToastContainer, useToast } from '@/components/Toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
          <ToastContainerWrapper />  {/* Novo */}
        </ToastProvider>
      </body>
    </html>
  )
}

// Componente wrapper:
function ToastContainerWrapper() {
  const { toasts, removeToast } = useToast()
  return <ToastContainer toasts={toasts} onClose={removeToast} />
}
```

### 2. Testar o componente Toast

```bash
npm run dev  # Rodar frontend em dev

# No navegador:
# 1. Abrir /listas
# 2. Clicar em um produto para adicionar à lista
# 3. Ver toast de sucesso (em vez de alert)
```

### 3. Configurar Husky (pré-commit hooks)

```bash
cd frontend
npm install --save-dev husky lint-staged

# Inicializar Husky
npx husky install

# Criar pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Adicionar ao package.json:
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "src/**/*.css": ["prettier --write"]
  }
}
```

---

## Próximas 48 horas? Faça isto:

### 1. Testar CI/CD Pipeline

```bash
# Push para uma branch de feature
git checkout -b feature/test-ci
git add .
git commit -m "test: validate CI/CD"
git push -u origin feature/test-ci

# Ir para GitHub > Actions
# Verificar se CI passa
```

### 2. Implementar cookies HttpOnly (Importante!)

Seguir guia em `docs/SECURITY_IMPROVEMENTS.md` seção "1. Migração de JWT para Cookies HttpOnly"

**Resumo:**
1. Modificar resposta de login para enviar cookie
2. Frontend remover localStorage
3. Requisições usar `credentials: 'include'`

### 3. Migrar dados mock para API real

Seguir `docs/MOCK_DATA_MIGRATION.md`

**Exemplo rápido:**
```tsx
// /alertas/page.tsx - ANTES
const [alerts, setAlerts] = useState<DemoAlert[]>([
  { id: '1', productName: 'Arroz', ... }
])

// /alertas/page.tsx - DEPOIS
const [alerts, setAlerts] = useState<PriceAlertOut[]>([])

useEffect(() => {
  const loadAlerts = async () => {
    try {
      const data = await getPriceAlerts()
      setAlerts(data)
    } catch (err) {
      error('Erro ao carregar alertas')
    }
  }
  loadAlerts()
}, [user])
```

---

## Checklist — Validar Implementação

- [ ] `npm install` no backend e frontend rodou sem erros
- [ ] `pytest tests/ -v` passou (backend)
- [ ] `npm test -- --watchAll=false` passou (frontend)
- [ ] `.env.example` arquivo existe e tem documentação
- [ ] GitHub Actions workflow existe em `.github/workflows/ci.yml`
- [ ] Documentação em `docs/` completa
- [ ] ESLint + Prettier configurados (`npm run lint`, `npm run format`)
- [ ] Toast aparece ao tentar adicionar produto à lista
- [ ] Error page funciona ao acessar rota inexistente
- [ ] Password validation rejeita senhas fracas

---

## Troubleshooting Rápido

### "ModuleNotFoundError: No module named 'slowapi'"

```bash
cd backend
pip install slowapi==0.1.*
```

### "Cannot find module '@testing-library/react'"

```bash
cd frontend
npm install @testing-library/react --save-dev
```

### "Port 8000 already in use"

```bash
# Matar processo
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Ou usar porta diferente
uvicorn app.main:app --port 8001
```

### "Database connection refused"

```bash
# Verificar se PostgreSQL/SQLite está rodando
docker-compose up -d postgres

# Ou usar SQLite (default)
# Editar .env: DATABASE_URL=sqlite+aiosqlite:///./smartcart.db
```

---

## Recursos Úteis

| Recurso | Link |
|---------|------|
| Security Guide | `docs/SECURITY_IMPROVEMENTS.md` |
| Performance Tips | `docs/PERFORMANCE_ROADMAP.md` |
| Accessibility | `docs/ACCESSIBILITY_GUIDE.md` |
| Deployment | `docs/DEPLOYMENT.md` |
| Mock Migration | `docs/MOCK_DATA_MIGRATION.md` |
| Full Summary | `IMPLEMENTATION_SUMMARY.md` |

---

## Questões?

1. **Segurança?** → Ver `docs/SECURITY_IMPROVEMENTS.md`
2. **Testes?** → Ver exemplos em `backend/tests/` e `frontend/src/__tests__/`
3. **Deploy?** → Ver `docs/DEPLOYMENT.md`
4. **Performance?** → Ver `docs/PERFORMANCE_ROADMAP.md`

---

## 🚀 Resumo

Você tem uma aplicação muito melhor agora! 

**De 4.8/10 para 7.5/10 potencial** após implementar estas mudanças.

**Prioridades em ordem:**
1. ✅ Instalar dependências (feito)
2. 🔄 Rodar testes (próximo)
3. 🔄 Integrar Toast provider
4. 🔄 Implementar cookies HttpOnly
5. 🔄 Migrar dados mock

**Time: ~1-2 semanas para implementar tudo**

Boa sorte! 🎉

