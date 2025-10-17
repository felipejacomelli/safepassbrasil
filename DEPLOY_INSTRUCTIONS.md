# Instruções de Deploy - Reticket Frontend

## 🚨 Problema Resolvido: URLs Locais em Produção

Este documento contém as instruções para corrigir o problema onde a aplicação em produção estava chamando URLs locais (`http://localhost:8000`) ao invés do backend de produção.

## 📋 Checklist de Configuração

### 1. Configuração de Variáveis de Ambiente no Vercel

**Acesse o painel do Vercel:**
1. Vá para [vercel.com](https://vercel.com)
2. Selecione o projeto `reticket-front` (ou nome do projeto)
3. Vá em **Settings** > **Environment Variables**

**Configure as seguintes variáveis:**

#### ✅ OBRIGATÓRIAS:
```bash
NEXT_PUBLIC_API_URL=https://reticket-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SHA30PqalO77yqoviGb7ilAv1soTTGQFrbBGNTtXNz2eNTHkEWAJypPiqi0I1cb7An5iSH8pcrOrHGyw4J6IDrr00DFeDNpCm
```

#### 🔧 OPCIONAIS (se aplicável):
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NODE_ENV=production
```

### 2. Verificação do Backend Django

**✅ CORS já configurado corretamente:**
- O backend já aceita requisições de `https://reticket-front.vercel.app`
- CORS_ALLOWED_ORIGINS inclui o domínio Vercel
- ALLOWED_HOSTS inclui o domínio Render

### 3. Deploy e Teste

**Após configurar as variáveis:**
1. Faça um novo deploy no Vercel (pode ser automático via Git push)
2. Teste a aplicação em produção
3. Verifique no DevTools (Network tab) se as requisições estão indo para `https://reticket-backend.onrender.com`

## 🔧 Arquivos Modificados

### Frontend:
- ✅ `next.config.mjs` - Rewrites dinâmicos baseados em ambiente
- ✅ `env.example` - Documentação de variáveis de ambiente

### Backend:
- ✅ `settings.py` - CORS atualizado para incluir domínio Vercel atual

## 🧪 Como Testar

### 1. Verificar URLs no DevTools:
```javascript
// Abra o DevTools (F12) > Network tab
// Faça uma ação que chame a API (ex: login, carrinho)
// Verifique se as requisições vão para:
// ✅ https://reticket-backend.onrender.com/api/...
// ❌ http://localhost:8000/api/...
```

### 2. Testar Funcionalidades:
- [ ] Login/Registro
- [ ] Adicionar ao carrinho
- [ ] Finalizar compra
- [ ] Upload de imagens
- [ ] Todas as chamadas de API

## 🚨 Troubleshooting

### Problema: Ainda chama localhost
**Solução:**
1. Verifique se `NEXT_PUBLIC_API_URL` está configurada no Vercel
2. Faça um novo deploy
3. Limpe o cache do navegador

### Problema: CORS Error
**Solução:**
1. Verifique se o domínio Vercel está em `CORS_ALLOWED_ORIGINS`
2. Confirme se o backend está rodando em `https://reticket-backend.onrender.com`

### Problema: 404 nas rotas da API
**Solução:**
1. Verifique se o backend está online
2. Teste diretamente: `https://reticket-backend.onrender.com/api/`

## 📝 Notas Importantes

- **Não altere os 58 arquivos** que usam `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'` - eles estão corretos
- O problema era a falta da variável de ambiente, não o código
- Os rewrites no `next.config.mjs` agora são dinâmicos
- O backend já estava configurado corretamente para CORS

## 🔄 Próximos Passos

1. Configure as variáveis no Vercel
2. Faça o deploy
3. Teste todas as funcionalidades
4. Monitore os logs para garantir que não há mais chamadas para localhost

---

**Status:** ✅ Problema identificado e corrigido
**Data:** $(date)
**Responsável:** Sistema de correção automática
