"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import StripeCheckout from "@/components/stripe-checkout"
import { formatAmount } from "@/lib/stripe-api"
import Image from "next/image"

interface CartItem {
  id: string
  eventId: string
  eventName: string
  ticketType: string
  price: number
  quantity: number
  date: string
  location: string
  image: string
  occurrenceId?: string
  ticketTypeId?: string
}

export default function CheckoutStripePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")

  // Carregar itens do carrinho
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e)
    }
  }, [])

  // Calcular totais
  const subtotal = cartItems.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0)
  const serviceFee = subtotal * 0.1 // 10% service fee
  const total = subtotal + serviceFee

  // Handlers
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setIsProcessing(true)
      setError("")

      // Limpar carrinho
      localStorage.removeItem("cart")
      setCartItems([])

      // Redirecionar para página de sucesso
      router.push(`/checkout/success?payment_intent=${paymentIntentId}`)
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    setIsProcessing(false)
  }

  const handleBackToCart = () => {
    router.push("/cart")
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Carrinho Vazio</h1>
            <p className="text-muted-foreground mb-6">
              Você não tem itens no seu carrinho.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToCart}
              className="text-foreground hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Carrinho
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Finalizar Compra</h1>
              <p className="text-muted-foreground">Complete seu pagamento de forma segura</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo do Pedido */}
            <div className="space-y-6">
              <Card className="bg-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-foreground">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.eventName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.eventName}</h3>
                        <p className="text-sm text-muted-foreground">{item.ticketType}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="bg-accent text-foreground">
                            Qtd: {item.quantity}
                          </Badge>
                          <span className="font-semibold text-foreground">
                            {formatAmount(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Separator className="bg-accent" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatAmount(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de serviço</span>
                      <span className="text-foreground">{formatAmount(serviceFee)}</span>
                    </div>
                    <Separator className="bg-accent" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatAmount(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações de Segurança */}
              <Card className="bg-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Pagamento Seguro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Seus dados são protegidos com criptografia SSL
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Processado pelo Stripe, líder mundial em pagamentos
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Garantia de reembolso em caso de problemas
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Pagamento */}
            <div>
              <StripeCheckout
                amount={total}
                description={`Compra de ${cartItems.length} ingresso(s) - Reticket`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                metadata={{
                  user_id: user?.id,
                  user_email: user?.email,
                  cart_items: cartItems.map(item => ({
                    event_id: item.eventId,
                    ticket_type: item.ticketType,
                    quantity: item.quantity,
                    price: item.price
                  }))
                }}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    Processando pagamento... Por favor, aguarde.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




