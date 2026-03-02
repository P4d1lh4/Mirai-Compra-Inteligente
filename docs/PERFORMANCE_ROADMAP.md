# Performance Roadmap — SmartCart

## Melhorias Implementadas ✅

1. **React.memo no ProductCard** — Evita re-renders desnecessários quando props não mudam
2. **ProductCardSkeleton** — Exibe loading states enquanto dados estão sendo carregados
3. **Haversine extraído para utilitário** — Reutilizável em múltiplos serviços
4. **Logging estruturado** — Melhor observabilidade sem overhead de print statements

---

## Recomendações Futuras

### 1. Migração para next/image (Prioridade Alta)

**Problema**: `<img>` nativa perde lazy loading, redimensionamento e otimização de formato.

**Solução**:
```typescript
import Image from 'next/image'

<Image
  src={product.image_url}
  alt={product.name}
  width={300}
  height={300}
  className="w-full h-auto"
  priority={false}  // Lazy load por padrão
/>
```

**Benefícios**:
- Automatic lazy loading
- Responsive images
- WebP/AVIF support
- Size optimization

---

### 2. Paginação Infinita ou Virtual Scrolling

**Problema**: Busca carrega todos os produtos de uma vez, causando lag com grandes datasets.

**Solução opção 1 — Infinite Scroll (com react-intersection-observer)**:
```typescript
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore) {
      fetchNextPage()
    }
  })
  
  observer.observe(sentinelRef.current)
  return () => observer.disconnect()
}, [])
```

**Solução opção 2 — Virtual Scrolling (com react-window)**:
```typescript
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <ProductCard style={style} product={items[index]} />
  )}
</FixedSizeList>
```

**Recomendação**: Use infinite scroll para melhor UX em mobile.

---

### 3. Redis Caching

**Problema**: Queries repetidas ao banco causam latência.

**Cenários para cache**:
- Categorias (muda raras vezes)
- Encartes ativos
- Historicamente produtos populares
- Searches recentes (TTL 1 hora)

**Implementação (backend)**:
```python
from app.core.redis import redis_client

async def get_categories():
    # Tenta cache
    cached = await redis_client.get("categories")
    if cached:
        return json.loads(cached)
    
    # Busca no DB
    categories = await db.execute(select(Category))
    
    # Armazena por 24h
    await redis_client.setex(
        "categories",
        86400,
        json.dumps([...])
    )
    
    return categories
```

---

### 4. Code Splitting no Frontend

**Implementação**: Lazy load páginas menos críticas
```typescript
// pages não críticas na home
const AlertasPage = dynamic(() => import('@/app/alertas/page'), {
  loading: () => <Loading />,
})

const AssistentePage = dynamic(() => import('@/app/assistente/page'), {
  loading: () => <Loading />,
})
```

---

### 5. Implementar Pagination API

**Problema**: Sem controle de tamanho de página.

**Solução no backend**:
```python
@router.get("/search")
async def search(
    query: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    skip = (page - 1) * page_size
    total = await count_matching_products(query)
    items = await db.execute(
        select(Product)
        .where(...)
        .offset(skip)
        .limit(page_size)
    )
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size)
    )
```

**Frontend com tanstack/react-query**:
```typescript
const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ['products', query],
  queryFn: ({ pageParam = 1 }) => 
    searchProducts(query, pageParam),
  getNextPageParam: (lastPage) =>
    lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
})
```

---

### 6. Database Indexes

Certifique-se de que consultas frequentes têm índices:

```python
# product.py
class Product(Base):
    __tablename__ = "products"
    
    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, index=True)  # ✅
    normalized_name: Mapped[str] = mapped_column(String, index=True)  # ✅
    category_id: Mapped[UUID] = mapped_column(ForeignKey(...), index=True)  # ✅

# price_entry.py
class PriceEntry(Base):
    __tablename__ = "price_entries"
    
    __table_args__ = (
        Index("ix_product_store", "product_id", "store_id"),  # ✅
        Index("ix_seen_at", "seen_at"),  # ✅
    )
```

---

### 7. Query Optimization

Use `joinedload` para evitar N+1 queries:

```python
# Antes (N+1 queries):
products = await db.execute(select(Product))
for product in products:
    prices = product.prices  # ❌ Query extra!

# Depois (1 query):
stmt = select(Product).options(
    joinedload(Product.prices),
    joinedload(Product.category),
)
products = await db.execute(stmt)
```

---

## Métricas de Performance

### Baseline Atual
- Homepage Load: ~2-3s
- Search: ~1-2s
- Add to List: ~0.5s

### Metas Após Otimizações
- Homepage Load: <1s (com paginação)
- Search: <0.8s (com cache)
- Add to List: <0.3s (com Redis)
- Lighthouse Score: >90 (Performance)

---

## Próximos Passos

1. **Sprint 1**: next/image + ProductCardSkeleton
2. **Sprint 2**: Paginação + Infinite scroll
3. **Sprint 3**: Redis caching para categorias e encartes
4. **Sprint 4**: Code splitting e lazy loading de rotas
5. **Sprint 5**: Database indexes e query optimization

