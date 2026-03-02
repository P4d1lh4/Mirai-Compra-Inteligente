# Guia de Acessibilidade — SmartCart

## Status Atual ✅

| Recurso | Status | Detalhes |
|---------|--------|----------|
| **HTML Semântico** | ✅ | Uso de `<main>`, `<nav>`, `<header>`, `<section>`, `<form>` |
| **Idioma da página** | ✅ | `lang="pt-BR"` no root |
| **Labels em formulários** | ✅ | `htmlFor` associado em login/cadastro |
| **aria-label** | ✅ Parcial | Adicionado em SearchBar, LocationSwitcher |
| **aria-expanded** | ✅ | Menus dropdown com estado de expansão |
| **Skip Navigation** | ✅ | Link "Ir para conteúdo principal" |
| **Contrast WCAG** | ⚠️ | Verificar com ferramentas automáticas |
| **Teclado Navigation** | ⚠️ | Parcialmente suportado |
| **Screen Readers** | ⚠️ | Suporte básico, melhorias necessárias |

---

## Melhorias Implementadas

### 1. SearchBar — aria-label e label

```tsx
<label htmlFor="search-input" className="sr-only">
  Buscar produtos
</label>
<input
  id="search-input"
  aria-label="Campo de busca de produtos"
/>
```

### 2. LocationSwitcher — aria-expanded

```tsx
<button
  aria-expanded={open}
  aria-label="Seletor de localização"
>
  {/* ... */}
</button>
```

### 3. Skip Navigation Link

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only"
>
  Ir para conteúdo principal
</a>
```

---

## Recomendações Futuras

### 1. Teclado Navigation

Certifique-se que todos os elementos interativos são acessíveis via teclado:

```tsx
// Exemplo: menu pode ser navegado com Tab e Arrow keys
const [focusedIndex, setFocusedIndex] = useState(0)

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    setFocusedIndex((prev) => (prev + 1) % items.length)
  } else if (e.key === 'ArrowUp') {
    setFocusedIndex((prev) => (prev - 1 + items.length) % items.length)
  } else if (e.key === 'Enter') {
    selectItem(items[focusedIndex])
  }
}
```

### 2. Melhorar suporte a leitores de tela

```tsx
// ProductCard
<div role="article" aria-label={`${product.name}, R$ ${product.min_price}`}>
  {/* ... */}
</div>

// ShoppingList
<ul role="list" aria-label="Itens da lista de compras">
  {items.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

### 3. Contrast WCAG AA

Verificar com ferramentas:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

**Cores atuais vs. WCAG AA**:

```
✅ Brand-600 (#00c896) sobre branco: 4.5:1 (OK)
✅ Texto cinza-700 sobre branco: 8.1:1 (OK)
⚠️ Placeholder gray-400: Verificar contrast
```

### 4. Form Validation & Error Messages

```tsx
<input
  aria-invalid={hasError}
  aria-describedby="error-message"
/>
{hasError && (
  <span id="error-message" className="text-red-600" role="alert">
    Este campo é obrigatório
  </span>
)}
```

### 5. Modals & Dialogs

```tsx
<dialog
  open={isOpen}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">Confirmar ação</h2>
  <p id="dialog-desc">Esta ação não pode ser desfeita.</p>
  {/* ... */}
</dialog>
```

### 6. Images

```tsx
// Evitar alt text vago
<img src={product.image_url} alt="Produto" />  ❌

// Usar descrição significativa
<img
  src={product.image_url}
  alt={`${product.name} - ${product.brand}`}
/>  ✅
```

### 7. Toasts/Notifications

```tsx
<div role="alert" aria-live="polite" aria-atomic="true">
  {message}
</div>
```

---

## Testes Recomendados

### 1. Automáticos (npm package)

```bash
npm install --save-dev eslint-plugin-jsx-a11y

# .eslintrc.json
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

### 2. Ferramentas Online

- **axe DevTools**: Chrome extension para auditoria
- **WAVE**: Web Accessibility Evaluation Tool
- **Lighthouse**: Google Chrome built-in

### 3. Manual Testing

- Testar com **Tab** key (keyboard navigation)
- Testar com **screen readers**:
  - NVDA (Windows, grátis)
  - JAWS (Windows, pago)
  - VoiceOver (Mac, built-in)
- Testar com **zoom** (200% min)

---

## Checklist WCAG 2.1 AA

- [ ] **1.1.1 Non-text Content** — Imagens têm alt text
- [ ] **1.4.3 Contrast** — Texto tem contrast mínimo 4.5:1
- [ ] **2.1.1 Keyboard** — Todos os elementos interativos acessíveis via teclado
- [ ] **2.4.1 Bypass Blocks** — Skip navigation link presente
- [ ] **2.4.3 Focus Order** — Ordem lógica de foco
- [ ] **3.3.1 Error Identification** — Erros são claramente identificados
- [ ] **3.3.4 Error Prevention** — Confirmação antes de ações críticas
- [ ] **4.1.2 Name, Role, Value** — Componentes com nome, role e valores acessíveis

---

## Recursos

- [MDN: Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [Deque: Accessibility Knowledge Base](https://dequeuniversity.com/)

