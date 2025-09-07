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
}

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { CreditCard, Landmark, Banknote, QrCode, ShieldCheck, ChevronRight, AlertCircle } from "lucide-react"

export default function CheckoutPage() {
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const router = useRouter()

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCvv] = useState("")
  const [installments, setInstallments] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Buyer information
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerCpf, setBuyerCpf] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Get cart items from localStorage (or use sample data if empty)
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          return JSON.parse(savedCart)
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e)
      }
    }

    // Sample cart item if none exists
    return [
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
    ]
  })

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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    const newErrors: Record<string, string> = {}

    // Validate buyer information
    if (!buyerName.trim()) {
      newErrors.buyerName = "Nome é obrigatório"
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

    // Validate payment method specific fields
    if (paymentMethod === "credit-card") {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = "Número do cartão é obrigatório"
      } else if (!validateCardNumber(cardNumber)) {
        newErrors.cardNumber = "Número do cartão inválido"
      }

      if (!cardName.trim()) {
        newErrors.cardName = "Nome no cartão é obrigatório"
      }

      if (!cardExpiry.trim()) {
        newErrors.cardExpiry = "Data de validade é obrigatória"
      } else if (!validateCardExpiry(cardExpiry)) {
        newErrors.cardExpiry = "Data de validade inválida"
      }

      if (!cardCvv.trim()) {
        newErrors.cardCvv = "CVV é obrigatório"
      } else if (!validateCvv(cardCvv)) {
        newErrors.cardCvv = "CVV inválido"
      }
    }

    if (!termsAccepted) {
      newErrors.terms = "Você precisa aceitar os termos e condições"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Process payment
    setIsProcessing(true)

    // Simulate API call with test cards
    setTimeout(() => {
      setIsProcessing(false)

      // Test card logic
      if (paymentMethod === "credit-card") {
        // All zeros card succeeds
        if (cardNumber.replace(/\s+/g, "") === "0000000000000000") {
          // Clear cart
          if (typeof window !== "undefined") {
            localStorage.removeItem("cart")
          }
          // Redirect to success page
          router.push("/checkout/success")
        }
        // All ones card fails
        else if (cardNumber.replace(/\s+/g, "") === "1111111111111111") {
          // Redirect to error page
          router.push("/checkout/error?reason=payment_declined")
        }
        // Other cards have 50/50 chance
        else {
          const randomSuccess = Math.random() > 0.5
          if (randomSuccess) {
            // Clear cart
            if (typeof window !== "undefined") {
              localStorage.removeItem("cart")
            }
            // Redirect to success page
            router.push("/checkout/success")
          } else {
            // Redirect to error page
            router.push("/checkout/error?reason=payment_failed")
          }
        }
      } else {
        // Non-credit card payments always succeed for demo
        // Clear cart
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart")
        }
        // Redirect to success page
        router.push("/checkout/success")
      }
    }, 2000)
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

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="w-full py-4 border-b border-zinc-800">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-black rounded" />
            </div>
            <span className="text-white text-xl font-bold">reticket</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/#como-funciona" className="text-white hover:text-primary transition">
              Como Funciona
            </a>
            <a href="#" className="text-white hover:text-primary transition">
              WhatsApp
            </a>
            <Button variant="outline" className="bg-black text-white border-primary hover:bg-primary hover:text-black">
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
            <h1 className="text-3xl font-bold text-white mb-6">Finalizar Compra</h1>

            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-400 mb-8">
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

            <form onSubmit={handleSubmit}>
              {/* Payment Methods */}
              <div className="bg-zinc-900 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Método de Pagamento</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border ${paymentMethod === "credit-card" ? "border-primary bg-blue-900 bg-opacity-20" : "border-zinc-700 bg-zinc-800"}`}
                    onClick={() => setPaymentMethod("credit-card")}
                  >
                    <CreditCard
                      className={`w-8 h-8 mb-2 ${paymentMethod === "credit-card" ? "text-primary" : "text-gray-400"}`}
                    />
                    <span className={`text-sm ${paymentMethod === "credit-card" ? "text-primary" : "text-gray-300"}`}>
                      Cartão de Crédito
                    </span>
                  </div>

                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border ${paymentMethod === "bank-transfer" ? "border-primary bg-blue-900 bg-opacity-20" : "border-zinc-700 bg-zinc-800"}`}
                    onClick={() => setPaymentMethod("bank-transfer")}
                  >
                    <Landmark
                      className={`w-8 h-8 mb-2 ${paymentMethod === "bank-transfer" ? "text-primary" : "text-gray-400"}`}
                    />
                    <span className={`text-sm ${paymentMethod === "bank-transfer" ? "text-primary" : "text-gray-300"}`}>
                      Transferência
                    </span>
                  </div>

                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border ${paymentMethod === "boleto" ? "border-primary bg-blue-900 bg-opacity-20" : "border-zinc-700 bg-zinc-800"}`}
                    onClick={() => setPaymentMethod("boleto")}
                  >
                    <Banknote
                      className={`w-8 h-8 mb-2 ${paymentMethod === "boleto" ? "text-primary" : "text-gray-400"}`}
                    />
                    <span className={`text-sm ${paymentMethod === "boleto" ? "text-primary" : "text-gray-300"}`}>
                      Boleto
                    </span>
                  </div>

                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border ${paymentMethod === "pix" ? "border-primary bg-blue-900 bg-opacity-20" : "border-zinc-700 bg-zinc-800"}`}
                    onClick={() => setPaymentMethod("pix")}
                  >
                    <QrCode className={`w-8 h-8 mb-2 ${paymentMethod === "pix" ? "text-primary" : "text-gray-400"}`} />
                    <span className={`text-sm ${paymentMethod === "pix" ? "text-primary" : "text-gray-300"}`}>PIX</span>
                  </div>
                </div>

                {/* Credit Card Form */}
                {paymentMethod === "credit-card" && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-gray-300 mb-1">
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
                          className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.cardNumber ? "border-red-500" : "border-zinc-700"}`}
                        />
                        {errors.cardNumber && (
                          <div className="absolute -top-6 left-0 flex items-center text-red-500 text-xs">
                            <AlertCircle size={12} className="mr-1" />
                            {errors.cardNumber}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Para teste: Use 0000 0000 0000 0000 para sucesso ou 1111 1111 1111 1111 para falha
                      </p>
                    </div>

                    <div>
                      <label htmlFor="card-name" className="block text-sm font-medium text-gray-300 mb-1">
                        Nome no Cartão
                      </label>
                      <div className="relative">
                        <input
                          id="card-name"
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Nome como está no cartão"
                          className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.cardName ? "border-red-500" : "border-zinc-700"}`}
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
                        <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-300 mb-1">
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
                            className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.cardExpiry ? "border-red-500" : "border-zinc-700"}`}
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
                        <label htmlFor="card-cvv" className="block text-sm font-medium text-gray-300 mb-1">
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
                            className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.cardCvv ? "border-red-500" : "border-zinc-700"}`}
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
                      <label htmlFor="installments" className="block text-sm font-medium text-gray-300 mb-1">
                        Parcelamento
                      </label>
                      <select
                        id="installments"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full bg-zinc-800 text-white p-3 rounded-md border border-zinc-700"
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
                {paymentMethod === "pix" && (
                  <div className="flex flex-col items-center p-6 bg-zinc-800 rounded-lg">
                    <div className="w-48 h-48 bg-white p-4 rounded-lg mb-4 flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-black" />
                    </div>
                    <p className="text-gray-300 mb-2">Escaneie o QR Code com seu aplicativo de banco</p>
                    <div className="bg-zinc-700 p-3 rounded-lg w-full text-center mb-4">
                      <p className="text-gray-300 text-sm mb-1">Código PIX</p>
                      <p className="text-white font-mono">00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028</p>
                    </div>
                    <Button variant="outline" className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700">
                      Copiar Código PIX
                    </Button>
                  </div>
                )}

                {/* Boleto Payment */}
                {paymentMethod === "boleto" && (
                  <div className="p-6 bg-zinc-800 rounded-lg">
                    <p className="text-gray-300 mb-4">
                      Ao finalizar a compra, você receberá o boleto para pagamento. O prazo de compensação é de até 3
                      dias úteis.
                    </p>
                    <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg mb-4">
                      <span className="text-white">Valor do Boleto:</span>
                      <span className="text-primary font-bold">R$ {total.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                      <span className="text-white">Vencimento:</span>
                      <span className="text-white">3 dias após a emissão</span>
                    </div>
                  </div>
                )}

                {/* Bank Transfer */}
                {paymentMethod === "bank-transfer" && (
                  <div className="p-6 bg-zinc-800 rounded-lg">
                    <p className="text-gray-300 mb-4">
                      Faça uma transferência bancária para a conta abaixo. Seus ingressos serão liberados após a
                      confirmação do pagamento.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-white">Banco:</span>
                        <span className="text-white">260 - Nu Pagamentos S.A.</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-white">Agência:</span>
                        <span className="text-white">0001</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-white">Conta:</span>
                        <span className="text-white">0000000-0</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-white">CNPJ:</span>
                        <span className="text-white">00.000.000/0001-00</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <span className="text-white">Valor:</span>
                        <span className="text-primary font-bold">R$ {total.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buyer Information */}
              <div className="bg-zinc-900 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Informações do Comprador</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.buyerName ? "border-red-500" : "border-zinc-700"}`}
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
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.buyerEmail ? "border-red-500" : "border-zinc-700"}`}
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
                      <label htmlFor="cpf" className="block text-sm font-medium text-gray-300 mb-1">
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
                          className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.buyerCpf ? "border-red-500" : "border-zinc-700"}`}
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
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
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
                          className={`w-full bg-zinc-800 text-white p-3 rounded-md border ${errors.buyerPhone ? "border-red-500" : "border-zinc-700"}`}
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
              <div className="bg-zinc-900 rounded-lg p-6 mb-6">
                <div className="relative flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-gray-300 text-sm">
                    Eu li e concordo com os{" "}
                    <a href="#" className="text-primary hover:underline">
                      Termos e Condições
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-primary hover:underline">
                      Política de Privacidade
                    </a>{" "}
                    da ReTicket. Entendo que meus ingressos estão sujeitos à verificação e que a plataforma garante a
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600 text-black py-4 text-lg font-bold"
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
            <div className="bg-zinc-900 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.eventName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.eventName}</h3>
                      <p className="text-gray-400 text-sm">{item.date}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-400 text-sm">{item.ticketType}</span>
                        <span className="text-white">R$ {item.price.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-400 text-sm">Quantidade:</span>
                        <span className="text-white">{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t border-zinc-800 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Taxa de serviço</span>
                  <span className="text-white">R$ {serviceFee.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span className="text-white">Total</span>
                  <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-primary">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-primary font-medium mb-1">Compra Segura</h3>
                    <p className="text-gray-300 text-sm">
                      Todos os ingressos são verificados e garantidos pela ReTicket. Caso ocorra algum problema, você
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
      <footer className="bg-zinc-900 border-t border-zinc-800 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded">
                  <div className="w-6 h-6 bg-black rounded" />
                </div>
                <span className="text-white text-xl font-bold">reticket</span>
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">© 2023 ReTicket. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
