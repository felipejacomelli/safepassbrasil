# 🧪 Guia de Testes - Métodos de Pagamento

## 📋 Informações Gerais

**Usuário de Teste:** `usuario@teste.com`  
**Senha:** `123456`  
**Status:** ✅ Usuário já existe e está ativo no sistema

---

## 🚀 Pré-requisitos

### 1. Servidores Rodando
- **Frontend:** `http://localhost:3000` (Next.js)
- **Backend:** `http://localhost:8000` (Django + DRF)

### 2. Verificar Configuração do Asaas
O sistema está configurado com o gateway **Asaas** para processar pagamentos. Os métodos disponíveis são:
- 💳 **Cartão de Crédito** (até 12x)
- 💳 **Cartão de Débito**
- 📱 **PIX**
- 📄 **Boleto Bancário**
- 🏦 **Transferência Bancária**

---

## 🔐 1. Login no Sistema

1. Acesse: `http://localhost:3000/login`
2. Faça login com:
   - **Email:** `usuario@teste.com`
   - **Senha:** `123456`
3. ✅ Confirme que o login foi bem-sucedido

---

## 🛒 2. Adicionar Itens ao Carrinho

### Opção A: Através da Página Principal
1. Acesse: `http://localhost:3000`
2. Navegue pelos eventos disponíveis
3. Clique em um evento de interesse
4. Selecione o tipo de ingresso e quantidade
5. Clique em **"Adicionar ao Carrinho"**

### Opção B: Carrinho com Dados de Exemplo
1. Acesse diretamente: `http://localhost:3000/cart`
2. O sistema já possui um item de exemplo:
   - **Evento:** Rock in Rio 2025
   - **Tipo:** Pista Premium
   - **Preço:** R$ 750,00
   - **Quantidade:** 1

---

## 💳 3. Processo de Checkout

### 3.1 Acessar o Checkout
1. No carrinho (`/cart`), clique em **"Finalizar Compra"**
2. Você será redirecionado para `/checkout`
3. ✅ Confirme que os dados do pedido estão corretos

### 3.2 Dados do Comprador
Os campos serão preenchidos automaticamente com os dados do usuário logado:
- **Nome:** (do perfil do usuário)
- **Email:** `usuario@teste.com`
- **CPF:** (se cadastrado no perfil)
- **Telefone:** (se cadastrado no perfil)

---

## 🧪 4. Testes por Método de Pagamento

### 💳 4.1 Cartão de Crédito

#### Dados de Teste (Asaas Sandbox):
```
Número: 4000 0000 0000 0002
Nome: USUARIO TESTE
Validade: 12/28
CVV: 123
```

#### Passos:
1. Selecione **"Cartão de Crédito"**
2. Preencha os dados do cartão
3. Escolha o número de parcelas (1x a 12x)
4. Clique em **"Finalizar Pagamento"**
5. ✅ **Resultado Esperado:** Pagamento aprovado instantaneamente

#### Teste de Parcelamento:
- Teste com **1x** (à vista)
- Teste com **3x** (parcelado)
- Teste com **12x** (máximo de parcelas)

---

### 💳 4.2 Cartão de Débito

#### Dados de Teste:
```
Número: 4000 0000 0000 0002
Nome: USUARIO TESTE
Validade: 12/28
CVV: 123
```

#### Passos:
1. Selecione **"Cartão de Débito"**
2. Preencha os dados do cartão
3. Clique em **"Finalizar Pagamento"**
4. ✅ **Resultado Esperado:** Pagamento aprovado instantaneamente

---

### 📱 4.3 PIX

#### Passos:
1. Selecione **"PIX"**
2. Clique em **"Gerar PIX"**
3. ✅ **Resultado Esperado:** 
   - QR Code gerado
   - Código PIX para copiar e colar
   - Instruções de pagamento
4. **Simulação:** No ambiente sandbox, o pagamento será aprovado automaticamente após alguns segundos

---

### 📄 4.4 Boleto Bancário

#### Passos:
1. Selecione **"Boleto Bancário"**
2. Defina a data de vencimento (opcional)
3. Clique em **"Gerar Boleto"**
4. ✅ **Resultado Esperado:**
   - Link para visualizar o boleto
   - Código de barras
   - Data de vencimento
5. **Simulação:** No sandbox, você pode simular o pagamento através do painel do Asaas

---

### 🏦 4.5 Transferência Bancária

#### Passos:
1. Selecione **"Transferência Bancária"**
2. Clique em **"Gerar Dados para Transferência"**
3. ✅ **Resultado Esperado:**
   - Dados bancários para transferência
   - Instruções de pagamento
   - Código de referência

---

## 📊 5. Verificação dos Resultados

### 5.1 Status do Pagamento
Após cada teste, verifique:
1. **Status na Interface:** Deve mostrar o status atual do pagamento
2. **Redirecionamento:** Para página de confirmação ou "Meus Pedidos"
3. **Email de Confirmação:** (se configurado)

### 5.2 Painel Administrativo
1. Acesse: `http://localhost:3000/admin/orders`
2. Verifique se o pedido aparece na lista
3. Confirme os detalhes:
   - Valor correto
   - Método de pagamento
   - Status do pedido

### 5.3 Backend (Opcional)
Verifique os logs do backend para confirmar:
```bash
# No terminal do backend
tail -f logs/payment.log
```

---

## 🔍 6. Cenários de Teste Específicos

### 6.1 Teste de Erro - Cartão Recusado
```
Número: 4000 0000 0000 0069
Nome: USUARIO TESTE
Validade: 12/28
CVV: 123
```
✅ **Resultado Esperado:** Pagamento recusado com mensagem de erro

### 6.2 Teste de Timeout
```
Número: 4000 0000 0000 0119
Nome: USUARIO TESTE
Validade: 12/28
CVV: 123
```
✅ **Resultado Esperado:** Timeout na transação

### 6.3 Teste sem Autenticação
1. Faça logout
2. Tente acessar `/checkout` diretamente
3. ✅ **Resultado Esperado:** Redirecionamento para login

---

## 🚨 7. Problemas Comuns e Soluções

### Erro 401 - Token Inválido
**Solução:** Faça logout e login novamente

### Erro 404 - Endpoint não encontrado
**Solução:** Verifique se o backend está rodando na porta 8000

### Carrinho vazio
**Solução:** Adicione itens ao carrinho antes do checkout

### Dados do Asaas não configurados
**Solução:** Verifique as variáveis de ambiente do backend:
```env
ASAAS_API_KEY=sua_chave_sandbox
ASAAS_SANDBOX_MODE=True
```

---

## 📝 8. Checklist de Testes

### ✅ Testes Básicos
- [ ] Login com `usuario@teste.com`
- [ ] Adicionar item ao carrinho
- [ ] Acessar checkout
- [ ] Dados do usuário preenchidos automaticamente

### ✅ Métodos de Pagamento
- [ ] Cartão de Crédito (1x)
- [ ] Cartão de Crédito (3x)
- [ ] Cartão de Crédito (12x)
- [ ] Cartão de Débito
- [ ] PIX
- [ ] Boleto Bancário
- [ ] Transferência Bancária

### ✅ Cenários de Erro
- [ ] Cartão recusado
- [ ] Timeout de transação
- [ ] Acesso sem autenticação

### ✅ Verificações Finais
- [ ] Status do pagamento atualizado
- [ ] Pedido no painel admin
- [ ] Logs do backend (opcional)

---

## 📞 Suporte

Em caso de problemas durante os testes:
1. Verifique os logs do backend
2. Confirme se os serviços estão rodando
3. Verifique as configurações do Asaas
4. Teste com dados de cartão diferentes

**Ambiente de Teste:** Sandbox Asaas  
**Documentação:** https://docs.asaas.com/

---

*Última atualização: $(date)*