"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Smartphone, Receipt } from 'lucide-react'
import { stripeApi, formatAmount, PAYMENT_METHODS, PAYMENT_STATUS } from '@/lib/stripe-api'

// Configurações do Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SHA30PqalO77yqoviGb7ilAv1soTTGQFrbBGNTtXNz2eNTHkEWAJypPiqi0I1cb7An5iSH8pcrOrHGyw4J6IDrr00DFeDNpCm')

interface StripeCheckoutProps {
  amount: number
  description: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  metadata?: Record<string, any>
}

interface PaymentFormProps {
  amount: number
  description: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  metadata?: Record<string, any>
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description,
  onSuccess,
  onError,
  metadata = {}
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS.CARD)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Criar Payment Intent quando o componente monta
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const response = await stripeApi.createPaymentIntent({
          amount,
          description,
          metadata
        })

        if (response.success) {
          setClientSecret(response.client_secret)
        } else {
          throw new Error('Falha ao criar Payment Intent')
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao inicializar pagamento')
        onError(err.message || 'Erro ao inicializar pagamento')
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [amount, description, metadata, onError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Confirmar pagamento
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || 'Erro no pagamento')
        onError(stripeError.message || 'Erro no pagamento')
      } else {
        // Pagamento bem-sucedido
        const paymentElement = elements.getElement(PaymentElement)
        if (paymentElement) {
          const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
          if (paymentIntent) {
            onSuccess(paymentIntent.id)
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro no pagamento')
      onError(err.message || 'Erro no pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Inicializando pagamento...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="payment-element">Informações de Pagamento</Label>
          <div className="mt-2">
            <PaymentElement
              id="payment-element"
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'pix', 'boleto'],
                fields: {
                  billingDetails: {
                    name: 'auto',
                    email: 'auto',
                    phone: 'auto',
                  },
                },
                wallets: {
                  applePay: 'auto',
                  googlePay: 'auto',
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{formatAmount(amount)}</span>
        </div>
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  description,
  onSuccess,
  onError,
  metadata = {}
}) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await stripeApi.getPaymentMethods()
        if (response.success) {
          setPaymentMethods(response.payment_methods)
        }
      } catch (err) {
        console.error('Erro ao carregar métodos de pagamento:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPaymentMethods()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamento Seguro
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: '', // Será definido no PaymentForm
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#3B82F6',
                  colorBackground: '#ffffff',
                  colorText: '#1F2937',
                  colorDanger: '#EF4444',
                  fontFamily: 'system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <PaymentForm
              amount={amount}
              description={description}
              onSuccess={onSuccess}
              onError={onError}
              metadata={metadata}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}

export default StripeCheckout
