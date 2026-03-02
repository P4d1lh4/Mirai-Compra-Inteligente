# Migração de Mock Data para API Real — SmartCart

## Status Atual

### Páginas com Mock Data

1. **`/alertas`** (Alerts Page)
   - Usa `DemoAlert[]` local
   - Sem integração com `/api/v1/alerts`
   - Sem persistência

2. **`/listas`** (Shopping Lists)
   - Usa mock para otimização "Onde comprar mais barato?"
   - Busca de listas usa API ✅
   - Otimização ainda é hardcoded

### API Endpoints Disponíveis

```
GET  /api/v1/alerts               - List all price alerts
POST /api/v1/alerts               - Create new alert
DELETE /api/v1/alerts/{alert_id}  - Delete alert

GET  /api/v1/shopping-lists/{id}/optimize - Optimize list by store
```

---

## Migração: Página de Alertas

### Antes (Mock)

```tsx
const [alerts, setAlerts] = useState<DemoAlert[]>([])

useEffect(() => {
  // Nenhuma API call
}, [])
```

### Depois (Com API)

```tsx
import { getPriceAlerts, createPriceAlert, deletePriceAlert } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

export default function AlertasPage() {
  const { user } = useAuth()
  const { error, success } = useToast()
  const [alerts, setAlerts] = useState<PriceAlertOut[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Buscar alertas ao carregar
  useEffect(() => {
    if (!user) return

    const loadAlerts = async () => {
      try {
        setIsLoading(true)
        const data = await getPriceAlerts()
        setAlerts(data)
      } catch (err) {
        error('Erro ao carregar alertas')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAlerts()
  }, [user, error])

  // Deletar alerta
  const handleRemoveAlert = async (alertId: string) => {
    try {
      await deletePriceAlert(alertId)
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      success('Alerta removido')
    } catch (err) {
      error('Erro ao remover alerta')
      console.error(err)
    }
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      {/* ... UI ... */}
      {alerts.map((alert) => (
        <div key={alert.id}>
          {/* ... render alert ... */}
          <button onClick={() => handleRemoveAlert(alert.id)}>
            Remover
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Schema TypeScript para API

```typescript
// frontend/src/lib/api.ts - adicionar tipos

export interface PriceAlertOut {
  id: string
  user_id: string
  product_id: string
  target_price: number | null
  alert_on_any_drop: boolean
  is_active: boolean
  created_at: string
}

export interface PriceAlertCreate {
  product_id: string
  target_price?: number
  alert_on_any_drop?: boolean
}

// Funções da API

export async function getPriceAlerts(): Promise<PriceAlertOut[]> {
  const response = await apiFetch('/alerts')
  if (!response.ok) throw new Error(response.statusText)
  return response.json()
}

export async function createPriceAlert(
  data: PriceAlertCreate
): Promise<PriceAlertOut> {
  const response = await apiFetch('/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(response.statusText)
  return response.json()
}

export async function deletePriceAlert(alertId: string): Promise<void> {
  const response = await apiFetch(`/alerts/${alertId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(response.statusText)
}
```

---

## Migração: Otimização de Listas

### Antes (Mock)

```tsx
// /listas/page.tsx
const bestPrices = [
  { store: 'Carrefour', total: 123.45, items: [/* ... */] },
  { store: 'Sonda', total: 145.67, items: [/* ... */] },
]
```

### Depois (Com API)

```tsx
interface StoreCostBreakdown {
  store_id: string
  store_name: string
  chain_name: string
  total_cost: number
  items: ShoppingListItem[]
}

useEffect(() => {
  if (!selectedList?.id) return

  const optimizeList = async () => {
    try {
      const response = await apiFetch(
        `/shopping-lists/${selectedList.id}/optimize`
      )
      const data: StoreCostBreakdown[] = await response.json()
      setOptimization(data)
    } catch (err) {
      error('Erro ao otimizar lista')
    }
  }

  optimizeList()
}, [selectedList?.id, error])

// Render
<div className="space-y-4">
  {optimization?.map((breakdown) => (
    <div key={breakdown.store_id}>
      <h3>{breakdown.store_name}</h3>
      <p>Total: {formatPrice(breakdown.total_cost)}</p>
      <ul>
        {breakdown.items.map((item) => (
          <li key={item.id}>{item.custom_name || item.product_id}</li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

---

## Backend: Implementação da Otimização (SE NÃO EXISTIR)

Se o endpoint `/shopping-lists/{id}/optimize` ainda não retorna dados reais:

```python
# backend/app/api/shopping_lists.py

@router.get("/{list_id}/optimize", response_model=list[StoreCostBreakdown])
async def optimize_shopping_list(
    list_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Find the cheapest stores for a shopping list."""
    service = ShoppingListService(db)
    return await service.optimize_list(user_id, list_id)
```

```python
# backend/app/services/shopping_list_service.py

async def optimize_list(
    self, user_id: UUID, list_id: UUID
) -> list[StoreCostBreakdown]:
    """Group items by store and calculate total cost per store."""
    # 1. Fetch list items
    list_obj = await self.get_shopping_list(user_id, list_id)

    # 2. For each item, get all prices (prices.py)
    items_with_prices = []
    for item in list_obj.items:
        prices = await self.db.execute(
            select(PriceEntry)
            .where(PriceEntry.product_id == item.product_id)
            .where(PriceEntry.is_current == True)
        )
        items_with_prices.append({
            'item': item,
            'prices': prices.scalars().all()
        })

    # 3. Group by store, sum prices
    store_costs = {}
    for item_data in items_with_prices:
        item = item_data['item']
        prices = item_data['prices']

        for price in prices:
            store_id = price.store_id
            if store_id not in store_costs:
                store_costs[store_id] = {
                    'store': price.store,
                    'items': [],
                    'total': 0
                }

            cost = price.price * item.quantity
            store_costs[store_id]['total'] += cost
            store_costs[store_id]['items'].append(item)

    # 4. Return sorted by total (cheapest first)
    return sorted(
        [
            StoreCostBreakdown(
                store_id=store_id,
                store_name=data['store'].name,
                chain_name=data['store'].chain.name,
                total_cost=data['total'],
                items=data['items']
            )
            for store_id, data in store_costs.items()
        ],
        key=lambda x: x.total_cost
    )
```

---

## Checklist de Migração

### Alerts Page
- [ ] Remover `DemoAlert` interface
- [ ] Implementar `useEffect` para `getPriceAlerts()`
- [ ] Conectar `deleteAlert` com `deletePriceAlert()`
- [ ] Teste manual
- [ ] Teste em CI/CD

### Shopping Lists Page
- [ ] Implementar backend endpoint `/optimize` (se não existir)
- [ ] Remover mock data de `bestPrices`
- [ ] Chamar endpoint no `useEffect`
- [ ] Render usando dados reais
- [ ] Teste manual
- [ ] Teste em CI/CD

---

## Testes Sugeridos

### Unit Tests (Frontend)

```typescript
// src/__tests__/alertas.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AlertasPage from '@/app/alertas/page'
import * as api from '@/lib/api'

jest.mock('@/lib/api')
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}))

describe('Alertas Page', () => {
  it('loads alerts from API', async () => {
    const mockAlerts = [
      {
        id: '1',
        product_id: 'prod-1',
        target_price: 10,
        is_active: true,
      },
    ]

    ;(api.getPriceAlerts as jest.Mock).mockResolvedValue(mockAlerts)

    render(<AlertasPage />)

    await waitFor(() => {
      expect(api.getPriceAlerts).toHaveBeenCalled()
    })
  })

  it('deletes alert on button click', async () => {
    const mockAlerts = [{ id: '1', is_active: true }]
    ;(api.getPriceAlerts as jest.Mock).mockResolvedValue(mockAlerts)
    ;(api.deletePriceAlert as jest.Mock).mockResolvedValue({})

    render(<AlertasPage />)

    const deleteButton = await screen.findByText('Remover')
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(api.deletePriceAlert).toHaveBeenCalledWith('1')
    })
  })
})
```

### Integration Tests (E2E)

```typescript
// e2e/alertas.spec.ts (Playwright)

import { test, expect } from '@playwright/test'

test('user can create and delete price alert', async ({ page }) => {
  // 1. Login
  await page.goto('/entrar')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'TestPassword123')
  await page.click('button:has-text("Entrar")')

  // 2. Navigate to alerts
  await page.goto('/alertas')

  // 3. Create alert (if button exists)
  const createButton = page.locator('button:has-text("Novo Alerta")')
  if (await createButton.isVisible()) {
    await createButton.click()
    await page.fill('input[name="target_price"]', '50')
    await page.click('button:has-text("Salvar")')
  }

  // 4. Verify alert appears
  await expect(page.locator('text=Alerta criado')).toBeVisible()

  // 5. Delete alert
  const deleteButton = page.locator('button:has-text("Remover")').first()
  await deleteButton.click()

  // 6. Verify deletion
  await expect(page.locator('text=Alerta removido')).toBeVisible()
})
```

---

## Timeline Sugerida

**Sprint 1 (2 dias)**
- Implementar tipos de API no frontend
- Conectar alertas com API

**Sprint 2 (2 dias)**
- Testar alertas
- Implementar otimização de listas

**Sprint 3 (1 dia)**
- Testes E2E
- Code review

