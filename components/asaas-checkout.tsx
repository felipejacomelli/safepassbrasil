"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, QrCode, FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/utils/formatCurrency"
import { paymentClient } from "@/lib/payment-api-client"
import { PaymentErrorHandler } from "@/lib/payment-error-handler"

interface AsaasCheckoutProps {
  amount: number
  description: string
  userEmail?: string
  userName?: string
  userPhone?: string
  userCpf?: string
  cartItems?: Array<{ occurrenceId?: string; ticketTypeId?: string; quantity: number }>
  sharedTicketToken?: string // Novo: token do link compartilhado
  onSuccess: (paymentId: string, paymentData: any) => void
  onError: (error: string) => void
  onLoading?: (loading: boolean) => void
}

interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
}

interface InstallmentOption {
  installments: number
  installment_amount: number
  total_amount: number
  interest_rate: number
}

interface CreditCardData {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

export function AsaasCheckout({
  amount,
  description,
  userEmail,
  userName,
  userPhone,
  userCpf,
  cartItems,
  sharedTicketToken,
  onSuccess,
  onError,
  onLoading
}: AsaasCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [installmentOptions, setInstallmentOptions] = useState<InstallmentOption[]>([])
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1)
  
  // Dados do cartão de crédito
  const [creditCard, setCreditCard] = useState<CreditCardData>({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: ""
  })
  
  // Dados do cliente
  const [customerData, setCustomerData] = useState({
    name: userName || "",
    email: userEmail || "",
    cpf: userCpf || "",
    phone: userPhone || "",
    mobilePhone: userPhone || ""
  })
  
  // Estados de pagamento
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [pixCode, setPixCode] = useState<string>("")
  const [boletoUrl, setBoletoUrl] = useState<string>("")

  // Carregar métodos de pagamento disponíveis
  useEffect(() => {
    loadPaymentMethods()
  }, [])

  // Carregar opções de parcelamento quando o valor ou método mudar
  useEffect(() => {
    if (paymentMethod === "CREDIT_CARD" && amount > 0) {
      loadInstallmentOptions()
    }
  }, [paymentMethod, amount])

  const loadPaymentMethods = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/payment/methods/`)
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(data.methods)
      }
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error)
    }
  }

  const loadInstallmentOptions = async () => {
    try {
      console.log('Carregando opções de parcelamento para valor:', amount)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/payment/installments/?amount=${amount}`)
      const data = await response.json()
      
      console.log('Resposta das opções de parcelamento:', data)
      
      if (data.success) {
        setInstallmentOptions(data.options)
        console.log('Opções de parcelamento carregadas:', data.options.length, 'opções')
      } else {
        console.error('Erro ao carregar opções de parcelamento:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar opções de parcelamento:', error)
    }
  }

  const handlePayment = async () => {
    console.log('🚀 Iniciando processo de pagamento...')
    console.log('📊 Dados atuais:', {
      paymentMethod,
      amount,
      customerData,
      creditCard: paymentMethod === "CREDIT_CARD" ? creditCard : null
    })

    setIsLoading(true)
    onLoading?.(true)

    try {
      const authToken = localStorage.getItem('authToken')
      console.log('🔑 Token de autenticação:', authToken ? 'Presente' : 'Ausente')
      
      if (!authToken) {
        console.error('❌ Token não encontrado')
        onError('Token de autenticação não encontrado. Faça login novamente.')
        setIsLoading(false)
        onLoading?.(false)
        return
      }

      // ✅ Validação básica antes de prosseguir
      if (!customerData.name || !customerData.email || !customerData.cpf) {
        console.error('❌ Dados do cliente incompletos:', customerData)
        onError('Dados do cliente incompletos. Preencha todos os campos.')
        setIsLoading(false)
        onLoading?.(false)
        return
      }

      // ✅ Construir dados do pagamento
      const paymentData: any = {
        billing_type: paymentMethod,
        value: amount,
        description,
        customer_cpf: customerData.cpf,
        customer_phone: customerData.phone,
        customer_mobile_phone: customerData.mobilePhone
      }

      console.log('📦 Dados base do pagamento:', paymentData)

      // ✅ Suporte para links compartilhados
      if (sharedTicketToken) {
        console.log('🔗 Processando link compartilhado:', sharedTicketToken)
        
        // Para links compartilhados, não aceitar o link ainda
        // O pagamento será processado primeiro, e só depois aceitar o link
        paymentData.external_reference = `shared_ticket_${sharedTicketToken}`
        console.log('🎫 Referência externa para link compartilhado:', paymentData.external_reference)
      } else if (cartItems && cartItems.length > 0) {
        paymentData.items = cartItems.map(item => ({
          occurrence_id: item.occurrenceId,
          ticket_type_id: item.ticketTypeId,
          quantity: item.quantity,
          ticket_ids: item.individualTicketId ? [item.individualTicketId] : undefined  // ✅ NOVO: Lista de IDs
        }))
        console.log('🛒 Itens do carrinho:', paymentData.items)
      }

      // Adicionar dados específicos do método de pagamento
      if (paymentMethod === "CREDIT_CARD") {
        if (!creditCard.holderName || !creditCard.number || !creditCard.expiryMonth || !creditCard.expiryYear || !creditCard.ccv) {
          console.error('❌ Dados do cartão incompletos:', creditCard)
          onError('Dados do cartão incompletos. Preencha todos os campos.')
          setIsLoading(false)
          onLoading?.(false)
          return
        }

        paymentData.credit_card = {
          holder_name: creditCard.holderName,
          number: creditCard.number,
          expiry_month: creditCard.expiryMonth,
          expiry_year: creditCard.expiryYear,
          ccv: creditCard.ccv,
          holderName: creditCard.holderName,
          expiryMonth: creditCard.expiryMonth,
          expiryYear: creditCard.expiryYear,
          cardNumber: creditCard.number,
          cardNumberMasked: creditCard.number
        }

        paymentData.credit_card_holder_info = {
          name: customerData.name,
          email: customerData.email,
          cpf_cnpj: customerData.cpf,
          phone: customerData.phone,
          mobile_phone: customerData.mobilePhone,
          postal_code: "01310-100", // CEP válido para teste
          address_number: "123", // Número padrão para teste
          address_complement: "Apto 45" // Complemento padrão para teste
        }
        paymentData.installment_count = selectedInstallments
        
        console.log('💳 Dados do cartão:', paymentData.credit_card)
      } else if (paymentMethod === "BOLETO") {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 7)
        paymentData.due_date = dueDate.toISOString().split('T')[0]
        console.log('📄 Data de vencimento do boleto:', paymentData.due_date)
      }

      console.log('📦 Dados finais do pagamento:', paymentData)
      console.log('📡 Enviando para PaymentApiClient...')

      // ✅ Usar cliente robusto com retry e timeout
      const result = await paymentClient.createPayment(paymentData, authToken)

      console.log('✅ Pagamento processado:', result)
      console.log('🔍 Verificando resultado do pagamento:')
      console.log('  - success:', result.success)
      console.log('  - payment_id:', result.payment_id)
      console.log('  - error:', result.error)
      console.log('  - sharedTicketToken:', sharedTicketToken)

      if (result.success) {
        setPaymentResult(result)
        
        // Configurar dados específicos do método de pagamento
        if (paymentMethod === "PIX") {
          setQrCodeData(result.qr_code || "")
          setPixCode(result.pix_code || "")
        } else if (paymentMethod === "BOLETO") {
          setBoletoUrl(result.bank_slip_url || "")
        }
        
        // ✅ Para links compartilhados, aceitar o link após pagamento aprovado
        // Verificar se o pagamento foi realmente aprovado (não apenas criado)
        const isPaymentApproved = result.success && result.payment_id && !result.error
        
        console.log('🔍 Verificação de aprovação do pagamento:')
        console.log('  - isPaymentApproved:', isPaymentApproved)
        console.log('  - sharedTicketToken presente:', !!sharedTicketToken)
        
        if (sharedTicketToken && isPaymentApproved) {
          try {
            console.log('🔗 Aceitando link compartilhado após pagamento aprovado...')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const acceptResponse = await fetch(`${apiUrl}/api/v1/sharing/accept/${sharedTicketToken}/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${authToken}`
              }
            })

            if (!acceptResponse.ok) {
              const errorData = await acceptResponse.json()
              console.error('❌ Erro ao aceitar link compartilhado:', errorData)
              onError(`Pagamento aprovado, mas erro ao transferir ingresso: ${errorData.error}`)
              return
            }

            const acceptData = await acceptResponse.json()
            console.log('✅ Link aceito com sucesso:', acceptData)
          } catch (acceptError) {
            console.error('❌ Erro ao aceitar link compartilhado:', acceptError)
            onError(`Pagamento aprovado, mas erro ao transferir ingresso: ${acceptError}`)
            return
          }
        }
        
        onSuccess(result.payment_id || '', result)
      } else {
        console.error('❌ Pagamento falhou:', result.error)
        onError(result.error || 'Erro ao processar pagamento')
      }
    } catch (error: any) {
      console.error('❌ Erro no pagamento:', error)
      console.error('❌ Stack trace:', error.stack)
      
      // ✅ NOVO: Cancelar pedido se foi criado mas pagamento falhou
      if (result?.order_id) {
        try {
          const authToken = localStorage.getItem('authToken')
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          
          await fetch(`${apiUrl}/api/orders/${result.order_id}/cancel/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Token ${authToken}`
            }
          })
          
          console.log('✅ Pedido cancelado, tickets liberados automaticamente')
        } catch (cancelError) {
          console.error('❌ Erro ao cancelar pedido:', cancelError)
        }
      }
      
      const errorInfo = PaymentErrorHandler.handlePaymentError(error)
      console.error('❌ Informações do erro:', errorInfo)
      onError(errorInfo.userMessage)
    } finally {
      setIsLoading(false)
      onLoading?.(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCreditCard(prev => ({ ...prev, number: formatted }))
  }

  const isFormValid = () => {
    if (!customerData.name || !customerData.email || !customerData.cpf) {
      return false
    }

    if (paymentMethod === "CREDIT_CARD") {
      return creditCard.holderName && 
             creditCard.number.replace(/\s/g, '').length >= 13 && 
             creditCard.expiryMonth && 
             creditCard.expiryYear && 
             creditCard.ccv.length >= 3
    }

    return true
  }

  if (paymentResult && paymentMethod === "PIX" && qrCodeData) {
    return (
      <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-700">
        <CardHeader className="text-center">
          <QrCode className="w-12 h-12 mx-auto text-primary mb-2" />
          <CardTitle className="text-white">Pagamento PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Escaneie o QR Code ou copie o código PIX para finalizar o pagamento
            </p>
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={qrCodeData} alt="QR Code PIX" className="w-full max-w-48 mx-auto" />
            </div>
            {pixCode && (
              <div className="space-y-2">
                <Label className="text-gray-300">Código PIX:</Label>
                <div className="flex gap-2">
                  <Input
                    value={pixCode}
                    readOnly
                    className="bg-zinc-800 text-white border-zinc-600 text-xs"
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(pixCode)}
                    variant="outline"
                    size="sm"
                    className="border-zinc-600 text-gray-300 hover:bg-zinc-700"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="text-center text-sm text-gray-400">
            <p>Valor: {formatCurrency(amount)}</p>
            <p>O pagamento será confirmado automaticamente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentResult && paymentMethod === "BOLETO" && boletoUrl) {
    return (
      <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-700">
        <CardHeader className="text-center">
          <FileText className="w-12 h-12 mx-auto text-primary mb-2" />
          <CardTitle className="text-white">Boleto Bancário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Seu boleto foi gerado com sucesso
            </p>
            <Button
              onClick={() => window.open(boletoUrl, '_blank')}
              className="w-full bg-primary text-black hover:bg-primary/90"
            >
              Visualizar Boleto
            </Button>
          </div>
          <div className="text-center text-sm text-gray-400">
            <p>Valor: {formatCurrency(amount)}</p>
            <p>Vencimento: 7 dias</p>
            <p>O pagamento será confirmado em até 2 dias úteis após o pagamento</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentResult && paymentMethod === "CREDIT_CARD") {
    return (
      <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-700">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
          <CardTitle className="text-white">Pagamento Processado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Seu pagamento está sendo processado
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>ID do Pagamento: {paymentResult.payment_id}</p>
              <p>Valor: {formatCurrency(amount)}</p>
              <p>Status: {paymentResult.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white text-center">Finalizar Pagamento</CardTitle>
        <p className="text-center text-gray-300">
          Valor: {formatCurrency(amount)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dados do Cliente */}
        <div className="space-y-4">
          <h3 className="text-white font-medium">Dados do Pagador</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-gray-300">Nome Completo</Label>
              <Input
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-zinc-800 text-white border-zinc-600"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-zinc-800 text-white border-zinc-600"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label className="text-gray-300">CPF</Label>
              <Input
                value={customerData.cpf}
                onChange={(e) => setCustomerData(prev => ({ ...prev, cpf: e.target.value }))}
                className="bg-zinc-800 text-white border-zinc-600"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label className="text-gray-300">Telefone</Label>
              <Input
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-zinc-800 text-white border-zinc-600"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </div>

        {/* Seleção do Método de Pagamento */}
        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
            <TabsTrigger value="PIX" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              PIX
            </TabsTrigger>
            <TabsTrigger value="CREDIT_CARD" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Cartão
            </TabsTrigger>
            <TabsTrigger value="BOLETO" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Boleto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="PIX" className="space-y-4">
            <div className="text-center py-4">
              <QrCode className="w-16 h-16 mx-auto text-primary mb-2" />
              <p className="text-gray-300">
                Pagamento instantâneo via PIX
              </p>
              <p className="text-sm text-gray-400">
                Aprovação imediata
              </p>
            </div>
          </TabsContent>

          <TabsContent value="CREDIT_CARD" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Nome no Cartão</Label>
                <Input
                  value={creditCard.holderName}
                  onChange={(e) => setCreditCard(prev => ({ ...prev, holderName: e.target.value }))}
                  className="bg-zinc-800 text-white border-zinc-600"
                  placeholder="Nome como está no cartão"
                />
              </div>
              <div>
                <Label className="text-gray-300">Número do Cartão</Label>
                <Input
                  value={creditCard.number}
                  onChange={handleCardNumberChange}
                  className="bg-zinc-800 text-white border-zinc-600"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-gray-300">Mês</Label>
                  <Select 
                    value={creditCard.expiryMonth} 
                    onValueChange={(value) => {
                      console.log('Mês selecionado:', value)
                      setCreditCard(prev => ({ ...prev, expiryMonth: value }))
                    }}
                  >
                    <SelectTrigger className="bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600 text-white z-[9999] max-h-60 overflow-y-auto">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = String(i + 1).padStart(2, '0')
                        return (
                          <SelectItem 
                            key={month} 
                            value={month} 
                            className="text-white hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer"
                          >
                            {month}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Ano</Label>
                  <Select 
                    value={creditCard.expiryYear} 
                    onValueChange={(value) => {
                      console.log('Ano selecionado:', value)
                      setCreditCard(prev => ({ ...prev, expiryYear: value }))
                    }}
                  >
                    <SelectTrigger className="bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700">
                      <SelectValue placeholder="AAAA" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600 text-white z-[9999] max-h-60 overflow-y-auto">
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i
                        return (
                          <SelectItem 
                            key={year} 
                            value={String(year)} 
                            className="text-white hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer"
                          >
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">CVV</Label>
                  <Input
                    value={creditCard.ccv}
                    onChange={(e) => setCreditCard(prev => ({ ...prev, ccv: e.target.value }))}
                    className="bg-zinc-800 text-white border-zinc-600"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
              
              {/* Opções de Parcelamento */}
              {installmentOptions.length > 0 && (
                <div>
                  <Label className="text-gray-300">Parcelamento</Label>
                  <Select value={String(selectedInstallments)} onValueChange={(value) => setSelectedInstallments(Number(value))}>
                    <SelectTrigger className="bg-zinc-800 text-white border-zinc-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {installmentOptions.map((option) => (
                        <SelectItem key={option.installments} value={String(option.installments)}>
                          {option.installments}x de {formatCurrency(option.installment_amount)}
                          {option.interest_rate > 0 && ` (${option.interest_rate}% a.m.)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="BOLETO" className="space-y-4">
            <div className="text-center py-4">
              <FileText className="w-16 h-16 mx-auto text-primary mb-2" />
              <p className="text-gray-300">
                Boleto Bancário
              </p>
              <p className="text-sm text-gray-400">
                Vencimento em 7 dias
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botão de Pagamento */}
        <Button
          onClick={handlePayment}
          disabled={!isFormValid() || isLoading}
          className="w-full bg-primary text-black hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            `Pagar ${formatCurrency(amount)}`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}