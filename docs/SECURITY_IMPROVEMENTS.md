# Melhorias de Segurança — SmartCart

## 1. Migração de JWT para Cookies HttpOnly ✅ (Implementação iniciada)

### Por que cookies HttpOnly?

Tokens JWT armazenados em `localStorage` são vulneráveis a ataques XSS (Cross-Site Scripting). Um script malicioso pode acessar `localStorage` e roubar tokens. Cookies HttpOnly não podem ser acessados por JavaScript.

### Implementação (Backend - FastAPI)

O backend já está preparado para enviar cookies. Você precisa:

1. **Modificar a resposta de login/registro** para enviar token em cookie em vez de no body JSON:

```python
# Em backend/app/api/auth.py, após autenticação bem-sucedida:

from fastapi.responses import JSONResponse

response = JSONResponse(
    content={
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }
)
response.set_cookie(
    key="access_token",
    value=token,
    max_age=3600 * 24,  # 24 horas
    httponly=True,       # JavaScript não pode acessar
    secure=True,         # Apenas HTTPS em produção
    samesite="lax",      # Proteção CSRF
)
return response
```

2. **Configurar CORS para credenciais**:
   - Já está em `main.py`: `allow_credentials=True` ✅

3. **Frontend (Next.js)** - Remover localStorage:

```typescript
// Antes:
localStorage.setItem('smartcart_token', token);

// Depois:
// O navegador gerencia automaticamente via cookies
```

4. **Requisições com cookies**:

```typescript
const res = await fetch('/api/v1/...', {
  method: 'GET',
  credentials: 'include',  // Importante: envia cookies automaticamente
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Status**: Parcialmente implementado. Falta integração frontend.

---

## 2. Rate Limiting ✅ (Implementado)

Adicionado `slowapi` com limites em:
- **Auth (register/login)**: 5/hora por IP (register), 10/hora (login)
- **AI endpoints**: Protegidos com autenticação + rate limits:
  - `/ai/chat`: 30 mensagens/hora
  - `/ai/chat/suggest`: 10 sugestões/hora
  - `/ai/generate-list`: 5 gerações/hora

**Status**: ✅ Implementado

---

## 3. Endpoints de IA Protegidos ✅ (Implementado)

Todos os endpoints de IA agora requerem autenticação:
- `/ai/generate-list`
- `/ai/chat`
- `/ai/chat/suggest`

**Status**: ✅ Implementado

---

## 4. Validação de Senha no Backend ✅ (Implementado)

Novos requisitos para senhas:
- Mínimo 8 caracteres (antes: 6 no frontend apenas)
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número

**Exemplo de senha válida**: `MyPassword123`
**Exemplo de senha inválida**: `password123` (sem maiúscula)

**Status**: ✅ Implementado

---

## 5. SECRET_KEY com Validação ✅ (Implementado)

Em produção, se `DEBUG=false` e `SECRET_KEY` estiver com o valor padrão, a aplicação lançará erro:

```
ValueError: SECRET_KEY must be changed in production. Set a strong SECRET_KEY in your .env file.
```

**Como gerar SECRET_KEY seguro**:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Resultado: gQtZoLmn3x_K2pL9xQvR5sW8aB1cD6eF7gH9iJ0kL2mN4o
```

**Status**: ✅ Implementado

---

## 6. CSRF Protection (Não implementado — Recomendação futura)

Atualmente não há proteção CSRF. Recomendações:

1. **Para formulários simples**: Cookies HttpOnly com `SameSite=Lax` já fornece proteção básica
2. **Para APIs sensíveis**: Implementar CSRF tokens

Lib recomendada: `fastapi-csrf-protect`

---

## 7. Próximos Passos de Segurança

### Prioridade 1 (Fazer agora):
- [ ] Implementar cookies HttpOnly no frontend
- [ ] Remover localStorage de tokens
- [ ] Testar rate limiting em produção
- [ ] Configurar HTTPS e certificados

### Prioridade 2 (Próxima sprint):
- [ ] Adicionar logging de tentativas de login fracassadas
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Validar input de geolocalização
- [ ] Audit trail de alterações críticas

### Prioridade 3 (Roadmap futuro):
- [ ] CSRF tokens para operações críticas
- [ ] Content Security Policy (CSP) headers
- [ ] SQL injection prevention (já feito com Pydantic + ORM)
- [ ] Criptografia de dados sensíveis em repouso

---

## 8. Checklist de Deploy para Produção

- [ ] `DEBUG=false` em `.env` de produção
- [ ] `SECRET_KEY` é uma string aleatória forte (não default)
- [ ] `FRONTEND_URL` aponta para domínio correto
- [ ] Database está em PostgreSQL (não SQLite)
- [ ] Redis está configurado e testado
- [ ] HTTPS/TLS está ativo
- [ ] Cookies tem `secure=True`
- [ ] CORS está restrito a domínios conhecidos
- [ ] Logs estão sendo coletados centralizadamente
- [ ] Backups de banco estão automáticos

