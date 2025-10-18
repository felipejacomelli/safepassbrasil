# 🔧 Correção: localhost:8000 Persiste em Produção

## 🚨 Problema Identificado

**Erro na imagem:**
```
POST http://localhost:8000/api/payment/create/
net::ERR_CONNECTION_REFUSED
```

**Status:**
- ✅ Variável `NEXT_PUBLIC_API_URL` configurada no Vercel
- ✅ Redeploy feito
- ❌ **AINDA chama localhost:8000**

## 🔍 Causas Encontradas

### 1. **URLs Hardcoded em Arquivos de Teste**
- `app/test-simple-payment/page.tsx` (linha 38)
- `app/test-payment/page.tsx` (linha 25)

### 2. **Variável de Ambiente Não Aplicada no Build**
O `process.env.NEXT_PUBLIC_API_URL` pode não estar sendo lida corretamente em produção.

### 3. **Cache do Navegador/Vercel**
O código antigo ainda estava em cache.

## ✅ Correções Aplicadas

### 1. **Logs de Debug Adicionados**

**Arquivo:** `v0-Reticket/lib/api.ts`

```typescript
// ✅ TEMP: Log para debug
if (typeof window !== 'undefined') {
  console.log('🔍 API_BASE_URL:', API_BASE_URL);
  console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
}
```

### 2. **Hardcode Temporário para Produção**

**Arquivo:** `v0-Reticket/lib/api.ts`

```typescript
// ✅ TEMP: Hardcode para forçar produção a usar Render
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://reticket-backend.onrender.com'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
```

### 3. **Correção de URLs Hardcoded**

**Arquivos corrigidos:**
- `app/test-simple-payment/page.tsx`
- `app/test-payment/page.tsx`
- `lib/stripe-api.ts`
- `components/asaas-checkout.tsx`

**Antes:**
```typescript
const response = await fetch('http://localhost:8000/api/payment/create/', {
```

**Depois:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const response = await fetch(`${apiUrl}/api/payment/create/`, {
```

### 4. **Hardcode Aplicado nos Componentes Críticos**

**Arquivo:** `components/asaas-checkout.tsx`

```typescript
// ✅ TEMP: Hardcode para forçar produção a usar Render
const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://reticket-backend.onrender.com'
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
```

## 🎯 Resultado Esperado

Após essas correções:

1. **Em desenvolvimento:** Usa `http://localhost:8000` (normal)
2. **Em produção:** Força `https://reticket-backend.onrender.com` (correto)
3. **Logs de debug:** Mostram valores reais no console
4. **URLs hardcoded:** Corrigidas para usar variável de ambiente

## 📋 Próximos Passos

### 1. **Teste Imediato**
1. Fazer commit e push das alterações
2. Aguardar deploy no Vercel
3. Testar em aba anônima
4. Verificar console do navegador para logs de debug

### 2. **Verificar Logs**
No console do navegador, deve aparecer:
```
🔍 API_BASE_URL: https://reticket-backend.onrender.com
🔍 NEXT_PUBLIC_API_URL: https://reticket-backend.onrender.com
🔍 NODE_ENV: production
```

### 3. **Se Ainda Não Funcionar**
- Verificar logs do deployment no Vercel
- Confirmar se `NODE_ENV` está sendo detectado como `production`
- Considerar remover e reconfigurar a variável `NEXT_PUBLIC_API_URL`

## 🔄 Solução Temporária vs Definitiva

### **Temporária (Aplicada):**
- Hardcode baseado em `NODE_ENV === 'production'`
- Força produção a usar Render independente da variável

### **Definitiva (Futuro):**
- Corrigir problema da variável `NEXT_PUBLIC_API_URL`
- Remover hardcode e usar apenas variável de ambiente
- Aplicar correção em todos os 59 arquivos que usam a variável

## 📊 Arquivos Modificados

1. ✅ `lib/api.ts` - Hardcode + logs
2. ✅ `lib/stripe-api.ts` - Hardcode
3. ✅ `components/asaas-checkout.tsx` - Hardcode (4 ocorrências)
4. ✅ `app/test-simple-payment/page.tsx` - URL relativa
5. ✅ `app/test-payment/page.tsx` - URL relativa

## 🎉 Status

**Correções aplicadas com sucesso!** 

Agora é necessário:
1. **Commit e push**
2. **Aguardar deploy**
3. **Testar em produção**
4. **Verificar logs no console**

