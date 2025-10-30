"use client"

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

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreditCard, Landmark, QrCode, ShieldCheck, ChevronRight, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { checkoutApi, CheckoutRequest } from "@/lib/api"
import { PAYMENT_METHODS, PaymentMethodType, PAYMENT_METHOD_LABELS } from "@/lib/constants"

export default function CheckoutPage() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(PAYMENT_METHODS.PIX)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCvv] = useState("")
  const [installments, setInstallments] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [boletoRemovedMessage, setBoletoRemovedMessage] = useState<string>("")
  // Removido useAsaas - agora usa integração direta

  // Buyer information
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerCpf, setBuyerCpf] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Get cart items from localStorage (or use sample data if empty)
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      eventId: "rock-in-rio-2025",
      eventName: "Rock in Rio 2025",
      ticketType: "Pista Premium",
      price: 750,
      quantity: 1,
      date: "19-28 de Setembro, 2025",
      location: "Cidade do Rock, Rio de Janeiro",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
    },
  ])

  // Load cart from localStorage after hydration
  useEffect(() => {
    setIsMounted(true)
    
    // Check for boleto removal message
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    if (errorParam === 'boleto_removed' && messageParam) {
      setBoletoRemovedMessage(messageParam)
      // Remove parameters from URL after showing message
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      url.searchParams.delete('message')
      window.history.replaceState({}, '', url.toString())
    }
    
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e)
    }
    
    // Set desktop state after client mount to avoid hydration mismatch
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Calculate totals
  const subtotal = cartItems.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0)
  const serviceFee = subtotal * 0.1 // 10% service fee
  const total = subtotal + serviceFee

  // Validation functions
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateCardNumber = (number: string) => {
    const digitsOnly = number.replace(/\s/g, "")
    return digitsOnly.length === 16 && /^\d+$/.test(digitsOnly)
  }

  const validateCardExpiry = (expiry: string) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false

    const [month, year] = expiry.split("/")
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1

    const expiryMonth = Number.parseInt(month, 10)
    const expiryYear = Number.parseInt(year, 10)

    if (expiryMonth < 1 || expiryMonth > 12) return false

    if (expiryYear < currentYear) return false
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false

    return true
  }

  const validateCvv = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv)
  }

  const validateCpf = (cpf: string) => {
    const digitsOnly = cpf.replace(/\D/g, "")
    return digitsOnly.length === 11
  }

  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, "")
    return digitsOnly.length >= 10 && digitsOnly.length <= 11
  }

  // ✅ Handle form submission com integração real
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsProcessing(true)
      setErrors({})

      // Validações
      const newErrors: Record<string, string> = {}

      if (!paymentMethod) {
        newErrors.payment = "Selecione um método de pagamento"
      }

      if (!termsAccepted) {
        newErrors.terms = "Você deve aceitar os termos e condições"
      }

      // Validações de dados do comprador
      if (!buyerName.trim()) {
        newErrors.buyerName = "Nome completo é obrigatório"
      }

      if (!buyerEmail.trim()) {
        newErrors.buyerEmail = "Email é obrigatório"
      } else if (!validateEmail(buyerEmail)) {
        newErrors.buyerEmail = "Email inválido"
      }

      if (!buyerCpf.trim()) {
        newErrors.buyerCpf = "CPF é obrigatório"
      } else if (!validateCpf(buyerCpf)) {
        newErrors.buyerCpf = "CPF inválido"
      }

      if (!buyerPhone.trim()) {
        newErrors.buyerPhone = "Telefone é obrigatório"
      } else if (!validatePhone(buyerPhone)) {
        newErrors.buyerPhone = "Telefone inválido"
      }

      // Validações específicas por método
      if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD || paymentMethod === PAYMENT_METHODS.DEBIT_CARD) {
        if (!cardName.trim()) {
          newErrors.cardName = "Nome no cartão é obrigatório"
        }
        if (!validateCardNumber(cardNumber)) {
          newErrors.cardNumber = "Número do cartão inválido"
        }
        if (!validateCardExpiry(cardExpiry)) {
          newErrors.cardExpiry = "Validade inválida (MM/AA)"
        }
        if (!cardCvv || cardCvv.length < 3) {
          newErrors.cardCvv = "CVV inválido (3 ou 4 dígitos)"
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsProcessing(false)
        return
      }

      // Obter dados do carrinho
      const cartItem = cartItems[0]
      if (!cartItem) {
        setErrors({ cart: "Carrinho vazio" })
        setIsProcessing(false)
        return
      }

      const cartItemWithIds = cartItem as CartItem & { occurrenceId: string; ticketTypeId: string }
      
      if (!cartItemWithIds.occurrenceId || !cartItemWithIds.ticketTypeId) {
        setErrors({ cart: "Dados do ingresso incompletos. Adicione o ingresso novamente ao carrinho." })
        setIsProcessing(false)
        return
      }

      // ✅ Preparar dados do checkout
      const checkoutData: CheckoutRequest = {
        occurrence_id: cartItemWithIds.occurrenceId,
        ticket_type_id: cartItemWithIds.ticketTypeId,
        quantity: cartItem.quantity,
        payment_method: paymentMethod,
        buyer_cpf: buyerCpf,
        buyer_phone: buyerPhone,
      }

      // Adicionar dados específicos por método
      if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
        const [expiryMonth, expiryYear] = cardExpiry.split('/')
        
        checkoutData.credit_card = {
          holderName: cardName,
          number: cardNumber.replace(/\s/g, ''),
          expiryMonth: expiryMonth,
          expiryYear: '20' + expiryYear,
          ccv: cardCvv
        }
        checkoutData.installments = parseInt(installments)
      } else if (paymentMethod === PAYMENT_METHODS.DEBIT_CARD) {
        const [expiryMonth, expiryYear] = cardExpiry.split('/')
        
        checkoutData.credit_card = {
          holderName: cardName,
          number: cardNumber.replace(/\s/g, ''),
          expiryMonth: expiryMonth,
          expiryYear: '20' + expiryYear,
          ccv: cardCvv
        }
      }

      // ✅ Chamar API de checkout
      const response = await checkoutApi.createOrder(checkoutData)

      if (response.success) {
        // Limpar carrinho
        localStorage.removeItem('cart')

        // Redirecionar conforme método
        if (paymentMethod === PAYMENT_METHODS.PIX) {
          router.push(`/checkout/pix?order_id=${response.order_id}`)
        } else {
          router.push(`/checkout/success?order_id=${response.order_id}`)
        }
      }
    } catch (error: any) {
      console.error('Erro no checkout:', error)
      
      // Extrair mensagem de erro
      let errorMessage = 'Erro ao processar pagamento'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.response) {
        try {
          const errorData = await error.response.json()
          errorMessage = errorData.error || errorData.detail || errorMessage
        } catch {
          errorMessage = 'Erro ao comunicar com o servidor'
        }
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setIsProcessing(false)
    }
  }

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, "")

    // Format with spaces every 4 digits
    let formatted = ""
    for (let i = 0; i < digitsOnly.length && i < 16; i += 4) {
      const chunk = digitsOnly.slice(i, Math.min(i + 4, 16))
      if (i > 0) formatted += " "
      formatted += chunk
    }

    setCardNumber(formatted)
  }

  // Format expiry date
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, "").substring(0, 4)

    // Format as MM/YY
    if (digitsOnly.length <= 2) {
      setCardExpiry(digitsOnly)
    } else {
      setCardExpiry(`${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2)}`)
    }
  }

  // Handle CVV input
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits and limit to 4 digits
    const digitsOnly = input.replace(/\D/g, "").substring(0, 4)
    setCvv(digitsOnly)
  }

  // Format CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, "").substring(0, 11)

    // Format as 000.000.000-00
    let formatted = ""
    if (digitsOnly.length <= 3) {
      formatted = digitsOnly
    } else if (digitsOnly.length <= 6) {
      formatted = `${digitsOnly.substring(0, 3)}.${digitsOnly.substring(3)}`
    } else if (digitsOnly.length <= 9) {
      formatted = `${digitsOnly.substring(0, 3)}.${digitsOnly.substring(3, 6)}.${digitsOnly.substring(6)}`
    } else {
      formatted = `${digitsOnly.substring(0, 3)}.${digitsOnly.substring(3, 6)}.${digitsOnly.substring(6, 9)}-${digitsOnly.substring(9)}`
    }

    setBuyerCpf(formatted)
  }

  // Format phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, "").substring(0, 11)

    // Format as (00) 00000-0000
    let formatted = ""
    if (digitsOnly.length === 0) {
      formatted = ""
    } else if (digitsOnly.length <= 2) {
      formatted = `(${digitsOnly}`
    } else if (digitsOnly.length <= 7) {
      formatted = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2)}`
    } else {
      formatted = `(${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 7)}-${digitsOnly.substring(7)}`
    }

    setBuyerPhone(formatted)
  }

  // ✅ Evitar hydration error - renderizar loading até montagem
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Carregando checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="w-full py-4 border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-background rounded" />
            </div>
            <span className="text-foreground text-xl font-bold">Safe Pass</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/#como-funciona" className="text-foreground hover:text-primary transition">
              Como Funciona
            </a>
            <a href="#" className="text-foreground hover:text-primary transition">
              WhatsApp
            </a>
            <Button variant="outline" className="bg-background text-foreground border-primary hover:bg-primary hover:text-black">
              Acessar
            </Button>
          </div>
        </div>
      </nav>

      {/* Checkout Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Payment Methods */}
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-foreground mb-6">Finalizar Compra</h1>

            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-muted-foreground mb-8">
              <a href="/" className="hover:text-primary">
                Início
              </a>
              <ChevronRight className="w-4 h-4 mx-2" />
              <a href="/cart" className="hover:text-primary">
                Carrinho
              </a>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-primary">Pagamento</span>
            </div>

            {/* Boleto Removed Warning */}
            {boletoRemovedMessage && (
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-200 font-medium">Método de Pagamento Removido</p>
                    <p className="text-yellow-300 text-sm mt-1">{boletoRemovedMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Payment Methods */}
              <div className="bg-card rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Método de Pagamento</h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {/* PIX */}
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border transition-all ${paymentMethod === PAYMENT_METHODS.PIX ? "border-primary bg-primary/10" : "border-border bg-accent hover:border-zinc-600"}`}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.PIX)}
                  >
                    <QrCode className={`w-8 h-8 mb-2 ${paymentMethod === PAYMENT_METHODS.PIX ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm text-center ${paymentMethod === PAYMENT_METHODS.PIX ? "text-primary" : "text-muted-foreground"}`}>PIX</span>
                  </div>

                  {/* Cartão de Crédito */}
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border transition-all ${paymentMethod === PAYMENT_METHODS.CREDIT_CARD ? "border-primary bg-primary/10" : "border-border bg-accent hover:border-zinc-600"}`}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.CREDIT_CARD)}
                  >
                    <CreditCard className={`w-8 h-8 mb-2 ${paymentMethod === PAYMENT_METHODS.CREDIT_CARD ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm text-center ${paymentMethod === PAYMENT_METHODS.CREDIT_CARD ? "text-primary" : "text-muted-foreground"}`}>Crédito</span>
                  </div>

                  {/* Cartão de Débito */}
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border transition-all ${paymentMethod === PAYMENT_METHODS.DEBIT_CARD ? "border-primary bg-primary/10" : "border-border bg-accent hover:border-zinc-600"}`}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.DEBIT_CARD)}
                  >
                    <CreditCard className={`w-8 h-8 mb-2 ${paymentMethod === PAYMENT_METHODS.DEBIT_CARD ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm text-center ${paymentMethod === PAYMENT_METHODS.DEBIT_CARD ? "text-primary" : "text-muted-foreground"}`}>Débito</span>
                  </div>

                  {/* Transferência */}
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border transition-all ${paymentMethod === PAYMENT_METHODS.TRANSFER ? "border-primary bg-primary/10" : "border-border bg-accent hover:border-zinc-600"}`}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.TRANSFER)}
                  >
                    <Landmark className={`w-8 h-8 mb-2 ${paymentMethod === PAYMENT_METHODS.TRANSFER ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm text-center ${paymentMethod === PAYMENT_METHODS.TRANSFER ? "text-primary" : "text-muted-foreground"}`}>Transfer</span>
                  </div>
                </div>

                {/* Credit Card Form */}
                {(paymentMethod === PAYMENT_METHODS.CREDIT_CARD || paymentMethod === PAYMENT_METHODS.DEBIT_CARD) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Dados do Cartão de {paymentMethod === PAYMENT_METHODS.CREDIT_CARD ? 'Crédito' : 'Débito'}
                    </h3>
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-muted-foreground mb-1">
                        Número do Cartão
                      </label>
                      <div className="relative">
                        <input
                          id="card-number"
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.cardNumber ? "border-red-500" : "border-border"}`}
                        />
                        {errors.cardNumber && (
                          <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.cardNumber}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para teste: Use 0000 0000 0000 0000 para sucesso ou 1111 1111 1111 1111 para falha
                      </p>
                    </div>

                    <div>
                      <label htmlFor="card-name" className="block text-sm font-medium text-muted-foreground mb-1">
                        Nome no Cartão
                      </label>
                      <div className="relative">
                        <input
                          id="card-name"
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Nome como está no cartão"
                          className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.cardName ? "border-red-500" : "border-border"}`}
                        />
                        {errors.cardName && (
                          <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.cardName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="card-expiry" className="block text-sm font-medium text-muted-foreground mb-1">
                          Validade
                        </label>
                        <div className="relative">
                          <input
                            id="card-expiry"
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/AA"
                            maxLength={5}
                            className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.cardExpiry ? "border-red-500" : "border-border"}`}
                          />
                          {errors.cardExpiry && (
                            <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.cardExpiry}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="card-cvv" className="block text-sm font-medium text-muted-foreground mb-1">
                          CVV
                        </label>
                        <div className="relative">
                          <input
                            id="card-cvv"
                            type="text"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            placeholder="123"
                            maxLength={4}
                            className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.cardCvv ? "border-red-500" : "border-border"}`}
                          />
                          {errors.cardCvv && (
                            <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                              <AlertCircle size={12} className="mr-1" />
                              {errors.cardCvv}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="installments" className="block text-sm font-medium text-muted-foreground mb-1">
                        Parcelamento
                      </label>
                      <select
                        id="installments"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full bg-accent text-foreground p-3 rounded-md border border-border"
                      >
                        <option value="1">À vista - R$ {total.toFixed(2).replace(".", ",")}</option>
                        <option value="2">2x de R$ {(total / 2).toFixed(2).replace(".", ",")}</option>
                        <option value="3">3x de R$ {(total / 3).toFixed(2).replace(".", ",")}</option>
                        <option value="4">4x de R$ {(total / 4).toFixed(2).replace(".", ",")}</option>
                        <option value="5">5x de R$ {(total / 5).toFixed(2).replace(".", ",")}</option>
                        <option value="6">6x de R$ {(total / 6).toFixed(2).replace(".", ",")}</option>
                      </select>
                    </div>
                  </div>
                )}


                {/* PIX Payment */}
                {paymentMethod === PAYMENT_METHODS.PIX && (
                  <div className="flex flex-col items-center p-6 bg-accent rounded-lg">
                    <div className="w-48 h-48 bg-white p-4 rounded-lg mb-4 flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-black" />
                    </div>
                    <p className="text-muted-foreground mb-2">Escaneie o QR Code com seu aplicativo de banco</p>
                    <div className="bg-zinc-700 p-3 rounded-lg w-full text-center mb-4">
                      <p className="text-muted-foreground text-sm mb-1">Código PIX</p>
                      <p className="text-foreground font-mono">00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028</p>
                    </div>
                    <Button variant="outline" className="bg-transparent border-zinc-600 text-foreground hover:bg-zinc-700">
                      Copiar Código PIX
                    </Button>
                  </div>
                )}

                {/* Bank Transfer */}
                {paymentMethod === PAYMENT_METHODS.TRANSFER && (
                  <div className="p-6 bg-accent rounded-lg">
                    <p className="text-muted-foreground mb-4">
                      Faça uma transferência bancária para a conta abaixo. Seus ingressos serão liberados após a
                      confirmação do pagamento.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-foreground">Banco:</span>
                        <span className="text-foreground">260 - Nu Pagamentos S.A.</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-foreground">Agência:</span>
                        <span className="text-foreground">0001</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-foreground">Conta:</span>
                        <span className="text-foreground">0000000-0</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-foreground">CNPJ:</span>
                        <span className="text-foreground">00.000.000/0001-00</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-foreground">Valor:</span>
                        <span className="text-primary font-bold">R$ {total.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buyer Information */}
              <div className="bg-card rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Informações do Comprador</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.buyerName ? "border-red-500" : "border-border"}`}
                        />
                        {errors.buyerName && (
                          <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.buyerName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.buyerEmail ? "border-red-500" : "border-border"}`}
                        />
                        {errors.buyerEmail && (
                          <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.buyerEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cpf" className="block text-sm font-medium text-muted-foreground mb-1">
                        CPF
                      </label>
                      <div className="relative">
                        <input
                          id="cpf"
                          type="text"
                          value={buyerCpf}
                          onChange={handleCpfChange}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.buyerCpf ? "border-red-500" : "border-border"}`}
                        />
                        {errors.buyerCpf && (
                          <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.buyerCpf}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">
                        Telefone
                      </label>
                      <div className="relative">
                        <input
                          id="phone"
                          type="tel"
                          value={buyerPhone}
                          onChange={handlePhoneChange}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                          className={`w-full bg-accent text-foreground p-3 rounded-md border ${errors.buyerPhone ? "border-red-500" : "border-border"}`}
                        />
                        {errors.buyerPhone && (
                          <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.buyerPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-card rounded-lg p-6 mb-6">
                <div className="relative flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-muted-foreground text-sm">
                    Eu li e concordo com os{" "}
                    <a href="#" className="text-primary hover:underline">
                      Termos e Condições
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-primary hover:underline">
                      Política de Privacidade
                    </a>{" "}
                    da Safe Pass. Entendo que meus ingressos estão sujeitos à verificação e que a plataforma garante a
                    autenticidade dos mesmos.
                  </label>
                  {errors.terms && (
                    <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.terms}
                    </div>
                  )}
                </div>
              </div>

              {/* Mensagem de Erro Geral */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-500 font-medium">Erro no Pagamento</p>
                    <p className="text-red-400 text-sm mt-1">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-bold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  `Finalizar Compra - R$ ${total.toFixed(2).replace(".", ",")}`
                )}
              </Button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">Resumo do Pedido</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-accent rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.eventName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium">{item.eventName}</h3>
                      <p className="text-muted-foreground text-sm">{item.date}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground text-sm">{item.ticketType}</span>
                        <span className="text-foreground">R$ {item.price.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground text-sm">Quantidade:</span>
                        <span className="text-foreground">{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Taxa de serviço</span>
                  <span className="text-foreground">R$ {serviceFee.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-primary font-medium mb-1">Compra Segura</h3>
                    <p className="text-muted-foreground text-sm">
                      Todos os ingressos são verificados e garantidos pela Safe Pass. Caso ocorra algum problema, você
                      receberá um reembolso total.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded">
                  <div className="w-6 h-6 bg-background rounded" />
                </div>
                <span className="text-foreground text-xl font-bold">Safe Pass</span>
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground text-sm">© 2023 Safe Pass. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
