"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'
import { mercadoPagoApi, type MercadoPagoConfig, type PaymentRequest } from '@/lib/api'

interface MercadoPagoCheckoutProps {
  amount: number
  description: string
  onSuccess: (paymentId: number) => void
  onError: (error: string) => void
  userEmail?: string
}

interface PaymentMethod {
  id: string
  name: string
  payment_type_id: string
  secure_thumbnail: string
}

interface Issuer {
  id: string
  name: string
}

interface InstallmentOption {
  installments: number
  installment_rate: number
  discount_rate: number
  reimbursement_rate: number
  labels: string[]
  installment_rate_collector: string[]
  min_allowed_amount: number
  max_allowed_amount: number
  recommended_message: string
  installment_amount: number
  total_amount: number
}

export function MercadoPagoCheckout({ 
  amount, 
  description, 
  onSuccess, 
  onError, 
  userEmail 
}: MercadoPagoCheckoutProps) {
  const [config, setConfig] = useState<MercadoPagoConfig | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [issuers, setIssuers] = useState<Issuer[]>([])
  const [installments, setInstallments] = useState<InstallmentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    paymentMethodId: '',
    issuerId: '',
    installments: 1,
    identificationType: 'CPF',
    identificationNumber: ''
  })

  // Carregar configurações e métodos de pagamento
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        
        // Carregar configurações
        const configData = await mercadoPagoApi.getConfig()
        setConfig(configData)

        if (!configData.enabled) {
          setError('Mercado Pago não está habilitado')
          return
        }

        // Carregar métodos de pagamento
        const methods = await mercadoPagoApi.getPaymentMethods()
        const creditCardMethods = methods.filter(method => 
          method.payment_type_id === 'credit_card'
        )
        setPaymentMethods(creditCardMethods)

      } catch (err) {
        console.error('Erro ao carregar dados do Mercado Pago:', err)
        setError('Erro ao carregar configurações de pagamento')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Carregar emissores quando método de pagamento for selecionado
  useEffect(() => {
    const loadIssuers = async () => {
      if (!formData.paymentMethodId) return

      try {
        const issuersData = await mercadoPagoApi.getIssuers(formData.paymentMethodId)
        setIssuers(issuersData)
      } catch (err) {
        console.error('Erro ao carregar emissores:', err)
      }
    }

    loadIssuers()
  }, [formData.paymentMethodId])

  // Carregar parcelas quando método e emissor forem selecionados
  useEffect(() => {
    const loadInstallments = async () => {
      if (!formData.paymentMethodId || !formData.issuerId) return

      try {
        const installmentsData = await mercadoPagoApi.getInstallments(
          amount,
          formData.paymentMethodId,
          formData.issuerId
        )
        
        if (installmentsData.length > 0) {
          setInstallments(installmentsData[0].payer_costs || [])
        }
      } catch (err) {
        console.error('Erro ao carregar parcelas:', err)
      }
    }

    loadInstallments()
  }, [formData.paymentMethodId, formData.issuerId, amount])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '')
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ')
    return formatted.substring(0, 19) // Máximo 16 dígitos + 3 espaços
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    handleInputChange('cardNumber', formatted)

    // Detectar método de pagamento baseado no número do cartão
    const digitsOnly = formatted.replace(/\s/g, '')
    if (digitsOnly.length >= 6) {
      const bin = digitsOnly.substring(0, 6)
      const detectedMethod = paymentMethods.find(method => {
        // Lógica simplificada de detecção - em produção, usar a API do MP
        if (bin.startsWith('4')) return method.id === 'visa'
        if (bin.startsWith('5')) return method.id === 'master'
        return false
      })
      
      if (detectedMethod && detectedMethod.id !== formData.paymentMethodId) {
        handleInputChange('paymentMethodId', detectedMethod.id)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    try {
      // Validações básicas
      if (!formData.cardNumber || !formData.cardholderName || !formData.securityCode) {
        throw new Error('Preencha todos os campos obrigatórios')
      }

      if (!formData.paymentMethodId) {
        throw new Error('Selecione um método de pagamento')
      }

      // Preparar dados do pagamento
      const paymentData: PaymentRequest = {
        amount,
        description,
        payment_method_id: formData.paymentMethodId,
        installments: formData.installments,
        issuer_id: formData.issuerId,
        payer: {
          email: userEmail || 'test@example.com',
          identification: {
            type: formData.identificationType,
            number: formData.identificationNumber
          }
        }
      }

      // Processar pagamento
      const response = await mercadoPagoApi.processPayment(paymentData)
      
      if (response.status === 'approved') {
        onSuccess(response.id)
      } else {
        throw new Error(`Pagamento ${response.status}: ${response.status_detail}`)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar pagamento'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </CardContent>
      </Card>
    )
  }

  if (!config?.enabled) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Pagamentos com Mercado Pago não estão disponíveis no momento.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamento com Cartão
        </CardTitle>
        <CardDescription>
          Valor: R$ {(amount / 100).toFixed(2)}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Nome do Portador</Label>
            <Input
              id="cardholderName"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              placeholder="Nome como está no cartão"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="expirationMonth">Mês</Label>
              <Select 
                value={formData.expirationMonth} 
                onValueChange={(value) => handleInputChange('expirationMonth', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationYear">Ano</Label>
              <Select 
                value={formData.expirationYear} 
                onValueChange={(value) => handleInputChange('expirationYear', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="AA" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i
                    return (
                      <SelectItem key={year} value={String(year).slice(-2)}>
                        {String(year).slice(-2)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityCode">CVV</Label>
              <Input
                id="securityCode"
                value={formData.securityCode}
                onChange={(e) => handleInputChange('securityCode', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          {formData.paymentMethodId && issuers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="issuer">Banco Emissor</Label>
              <Select 
                value={formData.issuerId} 
                onValueChange={(value) => handleInputChange('issuerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {issuers.map((issuer) => (
                    <SelectItem key={issuer.id} value={issuer.id}>
                      {issuer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {installments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select 
                value={String(formData.installments)} 
                onValueChange={(value) => handleInputChange('installments', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione as parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {installments.map((option) => (
                    <SelectItem key={option.installments} value={String(option.installments)}>
                      {option.installments}x de R$ {(option.installment_amount / 100).toFixed(2)}
                      {option.installment_rate > 0 && ' (com juros)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="identificationType">Tipo Doc.</Label>
              <Select 
                value={formData.identificationType} 
                onValueChange={(value) => handleInputChange('identificationType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationNumber">Número</Label>
              <Input
                id="identificationNumber"
                value={formData.identificationNumber}
                onChange={(e) => handleInputChange('identificationNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="12345678901"
                maxLength={14}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              `Pagar R$ ${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}