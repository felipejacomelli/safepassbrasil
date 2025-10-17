# Guia de Configuração do Vercel - Variáveis de Ambiente

## 🎯 Objetivo

Configurar as variáveis de ambiente no Vercel para corrigir o problema de URLs locais em produção.

## 📍 Acesso ao Painel do Vercel

1. **Acesse:** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Faça login** com sua conta
3. **Selecione o projeto:** `reticket-front` (ou nome do seu projeto)

## 🔧 Configuração Passo a Passo

### Passo 1: Navegar para Environment Variables

1. No painel do projeto, clique em **"Settings"** (Configurações)
2. No menu lateral, clique em **"Environment Variables"** (Variáveis de Ambiente)

### Passo 2: Adicionar Variáveis Obrigatórias

**Clique em "Add New" para cada variável:**

#### 1. NEXT_PUBLIC_API_URL
```
Name: NEXT_PUBLIC_API_URL
Value: https://reticket-backend.onrender.com
Environment: Production, Preview, Development
```

#### 2. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51SHA30PqalO77yqoviGb7ilAv1soTTGQFrbBGNTtXNz2eNTHkEWAJypPiqi0I1cb7An5iSH8pcrOrHGyw4J6IDrr00DFeDNpCm
Environment: Production, Preview, Development
```

### Passo 3: Variáveis Opcionais (se aplicável)

#### 3. BLOB_READ_WRITE_TOKEN (apenas se usar upload de imagens)
```
Name: BLOB_READ_WRITE_TOKEN
Value: vercel_blob_rw_...
Environment: Production, Preview, Development
```

#### 4. NEXT_PUBLIC_GOOGLE_CLIENT_ID (apenas se usar Google OAuth)
```
Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: your-google-client-id.apps.googleusercontent.com
Environment: Production, Preview, Development
```

#### 5. NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production, Preview
```

## 🚀 Deploy Após Configuração

### Opção 1: Deploy Automático
- Se o projeto está conectado ao Git, o deploy será automático após o push
- As variáveis serão aplicadas no próximo deploy

### Opção 2: Deploy Manual
1. Vá para a aba **"Deployments"**
2. Clique em **"Redeploy"** no último deployment
3. Ou faça um novo push para o repositório

## ✅ Verificação

### 1. Verificar se as Variáveis Foram Aplicadas
1. Vá para **"Deployments"**
2. Clique no último deployment
3. Na seção **"Environment Variables"**, verifique se as variáveis estão listadas

### 2. Testar a Aplicação
1. Acesse a URL de produção
2. Abra o DevTools (F12) > Network tab
3. Faça uma ação que chame a API (ex: login)
4. Verifique se as requisições vão para `https://reticket-backend.onrender.com`

## 🚨 Troubleshooting

### Problema: Variáveis não aparecem no deployment
**Solução:**
- Certifique-se de que selecionou os ambientes corretos (Production, Preview, Development)
- Faça um novo deploy após adicionar as variáveis

### Problema: Ainda chama localhost
**Solução:**
- Verifique se `NEXT_PUBLIC_API_URL` está configurada corretamente
- Limpe o cache do navegador
- Aguarde alguns minutos para o cache do Vercel atualizar

### Problema: Erro de CORS
**Solução:**
- O backend já está configurado para aceitar o domínio Vercel
- Verifique se o backend está online em `https://reticket-backend.onrender.com`

## 📋 Checklist Final

- [ ] `NEXT_PUBLIC_API_URL` configurada com `https://reticket-backend.onrender.com`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada
- [ ] Variáveis aplicadas em Production, Preview e Development
- [ ] Deploy realizado após configuração
- [ ] Teste realizado - requisições vão para backend de produção
- [ ] Não há mais chamadas para `localhost:8000`

## 🔗 Links Úteis

- [Documentação do Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js - Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Importante:** Após configurar as variáveis, a aplicação deve parar de chamar URLs locais e usar o backend de produção corretamente.
