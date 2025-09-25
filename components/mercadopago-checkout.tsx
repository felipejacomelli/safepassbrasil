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

// Declarar tipos para MercadoPago SDK
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface MercadoPagoCheckoutProps {
  amount: number
  description: string
  onSuccess: (paymentId: string) => void
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
  const [mp, setMp] = useState<any>(null)

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

  // Carregar SDK do MercadoPago
  useEffect(() => {
    const loadMercadoPagoSDK = () => {
      return new Promise((resolve, reject) => {
        if (window.MercadoPago) {
          resolve(window.MercadoPago)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://sdk.mercadopago.com/js/v2'
        script.onload = () => resolve(window.MercadoPago)
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    loadMercadoPagoSDK()
      .then(() => {
        console.log('MercadoPago SDK carregado')
      })
      .catch((error) => {
        console.error('Erro ao carregar SDK do MercadoPago:', error)
        setError('Erro ao carregar SDK de pagamento')
      })
  }, [])

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

        // Inicializar SDK com public key
        if (window.MercadoPago && configData.public_key) {
          const mercadoPago = new window.MercadoPago(configData.public_key)
          setMp(mercadoPago)
          console.log('MercadoPago inicializado com public key:', configData.public_key.substring(0, 20) + '...')
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

  // Carregar emissores quando método de pagamento é selecionado
  useEffect(() => {
    if (formData.paymentMethodId) {
      loadIssuers(formData.paymentMethodId)
    }
  }, [formData.paymentMethodId])

  // Carregar parcelamentos quando emissor é selecionado
  useEffect(() => {
    if (formData.paymentMethodId && formData.issuerId) {
      loadInstallments(formData.paymentMethodId, formData.issuerId)
    }
  }, [formData.paymentMethodId, formData.issuerId])

  const loadIssuers = async (paymentMethodId: string) => {
    try {
      const issuersData = await mercadoPagoApi.getIssuers(paymentMethodId)
      setIssuers(issuersData)
      
      // Auto-selecionar primeiro emissor se houver apenas um
      if (issuersData.length === 1) {
        handleInputChange('issuerId', issuersData[0].id)
      }
    } catch (err) {
      console.error('Erro ao carregar emissores:', err)
    }
  }

  const loadInstallments = async (paymentMethodId: string, issuerId: string) => {
    try {
      const installmentsData = await mercadoPagoApi.getInstallments(
        amount,
        paymentMethodId, 
        issuerId
      )
      setInstallments(installmentsData)
    } catch (err) {
      console.error('Erro ao carregar parcelamentos:', err)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '')
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ')
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

  const createCardToken = async () => {
    if (!mp) {
      throw new Error('SDK do MercadoPago não está inicializado')
    }

    const cardData = {
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      cardholderName: formData.cardholderName,
      cardExpirationMonth: formData.expirationMonth,
      cardExpirationYear: formData.expirationYear,
      securityCode: formData.securityCode,
      identificationType: formData.identificationType,
      identificationNumber: formData.identificationNumber
    }

    console.log('Criando card token com dados:', {
      ...cardData,
      cardNumber: cardData.cardNumber.substring(0, 6) + '...',
      securityCode: '***'
    })

    try {
      const response = await mp.createCardToken(cardData)
      console.log('Card token criado:', response)
      return response
    } catch (error) {
      console.error('Erro ao criar card token:', error)
      throw error
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

      if (!formData.expirationMonth || !formData.expirationYear) {
        throw new Error('Preencha a data de vencimento do cartão')
      }

      if (!formData.identificationNumber) {
        throw new Error('Preencha o número do documento')
      }

      // Criar card token
      const tokenResponse = await createCardToken()
      
      if (!tokenResponse || !tokenResponse.id) {
        throw new Error('Erro ao gerar token do cartão')
      }

      // Preparar dados do pagamento com o token
      const paymentData: PaymentRequest = {
        amount,
        description,
        token: tokenResponse.id,
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

      console.log('Processando pagamento com dados:', {
        ...paymentData,
        token: tokenResponse.id.substring(0, 20) + '...'
      })

      // Processar pagamento
      const response = await mercadoPagoApi.processPayment(paymentData)
      
      if (response.status === 'approved') {
        onSuccess(response.id)
      } else {
        throw new Error(`Pagamento ${response.status}: ${response.status_detail}`)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar pagamento'
      console.error('Erro no processamento:', err)
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
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Nome do Titular</Label>
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
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
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
                  <SelectValue placeholder="AAAA" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityCode">CVV</Label>
              <Input
                id="securityCode"
                value={formData.securityCode}
                onChange={(e) => handleInputChange('securityCode', e.target.value)}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identificationType">Tipo de Documento</Label>
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
            <Label htmlFor="identificationNumber">Número do Documento</Label>
            <Input
              id="identificationNumber"
              value={formData.identificationNumber}
              onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </div>

          {formData.paymentMethodId && (
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <Select 
                value={formData.paymentMethodId} 
                onValueChange={(value) => handleInputChange('paymentMethodId', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {issuers.length > 1 && (
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
                  {issuers.map(issuer => (
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
              <Label htmlFor="installments">Parcelamento</Label>
              <Select 
                value={formData.installments.toString()} 
                onValueChange={(value) => handleInputChange('installments', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {installments.map(option => (
                    <SelectItem key={option.installments} value={option.installments.toString()}>
                      {option.recommended_message}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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