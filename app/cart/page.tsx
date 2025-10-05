"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { User, ShoppingCart, ChevronRight } from "lucide-react"
import { AsaasCheckout } from "@/components/asaas-checkout"
import Header from "@/components/Header"

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

interface FormData {
  name: string
  email: string
  cardNumber: string
  expiryDate: string
  cvv: string
  address: string
  city: string
  zipCode: string
}

interface FormErrors {
  [key: string]: string
}

export default function CartPage() {
  const [isClient, setIsClient] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart items from localStorage on client side
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e)
        setCartItems([])
      }
    }
  }, [])

  // Sync cart items with localStorage whenever cartItems changes
  useEffect(() => {
    if (isClient) {
      if (cartItems.length === 0) {
        localStorage.removeItem("cart")
      } else {
        localStorage.setItem("cart", JSON.stringify(cartItems))
      }
    }
  }, [cartItems, isClient])

  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    address: "",
    city: "",
    zipCode: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Ensure client-side rendering to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    // Set desktop state after client mount to avoid hydration mismatch
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
  }, [])

  // Pre-fill form with user data when user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }))
    }
  }, [isAuthenticated, user])

  // Calculate total
  const subtotal = cartItems.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0)
  const total = subtotal

  // Update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedCart = cartItems.map((item: CartItem) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    setCartItems(updatedCart)
  }

  // Remove item
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item: CartItem) => item.id !== id)
    setCartItems(updatedCart)
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format expiry date with automatic "/" separator
    if (name === 'expiryDate') {
      const prev = formData.expiryDate
      const isDeleting = value.length < prev.length
      
      // Remove all non-numeric characters and limit to 4 digits (MMYY)
      let numericValue = value.replace(/\D/g, '').slice(0, 4)
      
      // Validate month (01-12)
      if (numericValue.length >= 2) {
        const month = parseInt(numericValue.slice(0, 2))
        if (month > 12) {
          numericValue = '12' + numericValue.slice(2)
        } else if (month === 0) {
          numericValue = '01' + numericValue.slice(2)
        }
      }
      
      // Validate year (current year or future)
      if (numericValue.length === 4) {
        const currentYear = new Date().getFullYear() % 100
        const year = parseInt(numericValue.slice(2, 4))
        if (year < currentYear) {
          numericValue = numericValue.slice(0, 2) + currentYear.toString().padStart(2, '0')
        }
      }
      
      if (numericValue.length === 0) {
        formattedValue = ''
      } else if (numericValue.length <= 2) {
        // When typing forward and reaching 2 digits, add the slash
        formattedValue = !isDeleting && numericValue.length === 2
          ? `${numericValue}/`
          : numericValue
      } else {
        // For 3-4 digits, always format as MM/YY
        formattedValue = `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`
      }
      
      // Ensure max length MM/YY (5 characters)
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.slice(0, 5)
      }
    }
    
    // Format CVV (only numbers, max 4 digits)
    if (name === 'cvv') {
      // Remove all non-digits and limit to 4 characters
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Real-time validation for name field
    if (name === 'name' && formattedValue.trim()) {
      const nameParts = formattedValue.trim().split(/\s+/)
      if (nameParts.length < 2) {
        setErrors((prev) => ({
          ...prev,
          name: "Digite seu nome completo (pelo menos nome e sobrenome)"
        }))
      }
    }

    // Real-time validation for email field
    if (name === 'email' && formattedValue.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formattedValue)) {
        setErrors((prev) => ({
          ...prev,
          email: "Digite um email válido"
        }))
      }
    }

    // Real-time validation for CVV field
    if (name === 'cvv' && formattedValue) {
      if (formattedValue.length < 3) {
        setErrors((prev) => ({
          ...prev,
          cvv: "CVV deve ter pelo menos 3 dígitos"
        }))
      }
    }
  }

  // Handle checkout form submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: FormErrors = {}

    // Validate full name (must have at least 2 names)
    if (!formData.name.trim()) {
      newErrors.name = "Nome completo é obrigatório"
    } else {
      const nameParts = formData.name.trim().split(/\s+/)
      if (nameParts.length < 2) {
        newErrors.name = "Digite seu nome completo (pelo menos nome e sobrenome)"
      }
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Digite um email válido"
      }
    }

    if (!formData.cardNumber.trim()) newErrors.cardNumber = "Número do cartão é obrigatório"
    if (!formData.expiryDate.trim()) newErrors.expiryDate = "Data de validade é obrigatória"
    
    // Validate CVV
    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV é obrigatório"
    } else {
      const cvvValue = formData.cvv.replace(/\D/g, '')
      if (cvvValue.length < 3 || cvvValue.length > 4) {
        newErrors.cvv = "CVV deve ter 3 ou 4 dígitos"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // ✅ DEPRECATED - Esta função não deve mais ser usada
    // O checkout agora é feito através do AsaasCheckout component
    console.warn('handleCheckout está deprecated. Use AsaasCheckout component.')
    alert('Use o componente de pagamento Asaas para finalizar a compra.')
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    router.push("/")
  }

  const handleUserClick = () => {
    router.push("/login")
  }

  const handleCartClick = () => {
    router.push("/cart")
  }

  // Handlers para Asaas
  const handleAsaasSuccess = async (paymentId: string, paymentData: any) => {
    try {
      setIsSubmitting(true)
      
      console.log('✅ Pagamento aprovado:', paymentId)
      console.log('📦 Dados do pagamento:', paymentData)
      
      // ✅ O pedido já foi criado durante o checkout
      // Não precisamos fazer compra separada
      setOrderComplete(true)
      setCartItems([]) // Limpar carrinho
      
      // ✅ Atualizar contadores de ingressos se necessário
      for (const item of cartItems) {
        window.dispatchEvent(new CustomEvent('ticketCountUpdated', {
          detail: { eventId: item.eventId, newCount: item.quantity }
        }))
      }
      
    } catch (error) {
      console.error('Erro ao processar sucesso do pagamento:', error)
      alert('Pagamento aprovado, mas houve erro ao finalizar. Entre em contato com o suporte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAsaasError = (error: string) => {
    console.error('Erro no pagamento Asaas:', error)
    alert(`Erro no pagamento: ${error}`)
  }

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div
        style={{
          backgroundColor: "black",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      {/* Main Content */}
      <main
        style={{
          padding: "24px 16px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#A1A1AA",
          }}
        >
          <a
            href="/"
            style={{
              color: "#A1A1AA",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#3B82F6"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#A1A1AA"
            }}
          >
            Home
          </a>
          <ChevronRight size={16} />
          <span style={{ color: "white" }}>Carrinho</span>
        </div>
        {orderComplete ? (
          <div
            style={{
              backgroundColor: "#18181B",
              borderRadius: "12px",
              padding: "32px 24px",
              textAlign: "center",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 13L9 17L19 7"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Pedido realizado com sucesso!
            </h2>
            <p
              style={{
                color: "#A1A1AA",
                marginBottom: "24px",
              }}
            >
              Seus ingressos foram enviados para seu email. Você também pode acessá-los na sua conta.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: isDesktop ? "row" : "column",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <a
                href="/"
                style={{
                  display: "inline-block",
                  backgroundColor: "#3B82F6",
                  color: "black",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Voltar para a página inicial
              </a>
              <a
                href="/account"
                style={{
                  display: "inline-block",
                  backgroundColor: "transparent",
                  border: "1px solid #3B82F6",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Ver meus ingressos
              </a>
            </div>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "32px",
              }}
            >
              Meu Carrinho
            </h1>

            {cartItems.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#18181B",
                  borderRadius: "12px",
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#A1A1AA",
                    marginBottom: "24px",
                  }}
                >
                  Seu carrinho está vazio.
                </p>
                <a
                  href="/"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#3B82F6",
                    color: "black",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  Explorar eventos
                </a>
              </div>
            ) : (
              <>
                {/* Checkout Button at Top */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push('/login?returnUrl=/cart')
                      return
                    }
                    setIsCheckingOut(true)
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#3B82F6",
                    color: "black",
                    border: "none",
                    padding: "16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginBottom: "24px",
                  }}
                >
                  Finalizar Compra
                </button>

                {/* Cart Items List */}
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "24px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginBottom: "16px",
                    }}
                  >
                    Ingressos no Carrinho
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {cartItems.map((item: CartItem) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          backgroundColor: "#27272A",
                          borderRadius: "8px",
                        }}
                      >
                        {/* Event Image - Smaller */}
                        <div
                          style={{
                            width: "60px",
                            height: "45px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.eventName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        {/* Event Info - Compact */}
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              marginBottom: "2px",
                              color: "white",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.eventName}
                          </h3>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#3B82F6",
                              fontWeight: "500",
                              marginBottom: "2px",
                            }}
                          >
                            {item.ticketType}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#A1A1AA",
                              marginBottom: "2px",
                            }}
                          >
                            {item.date} • {item.location}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#A1A1AA",
                            }}
                          >
                            R$ {item.price.toFixed(2).replace(".", ",")} cada
                          </p>
                        </div>

                        {/* Quantity Controls - Smaller */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{
                              backgroundColor: "#3F3F46",
                              border: "none",
                              color: "white",
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                            }}
                          >
                            -
                          </button>
                          <span
                            style={{
                              minWidth: "20px",
                              textAlign: "center",
                              fontWeight: "600",
                              fontSize: "14px",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              backgroundColor: "#3F3F46",
                              border: "none",
                              color: "white",
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total and Remove - Compact */}
                        <div
                          style={{
                            textAlign: "right",
                            minWidth: "70px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#3B82F6",
                              marginBottom: "4px",
                            }}
                          >
                            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#EF4444",
                              cursor: "pointer",
                              fontSize: "10px",
                              padding: "2px 4px",
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginBottom: "16px",
                    }}
                  >
                    Resumo do Pedido
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "#D4D4D8" }}>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid #3F3F46",
                      paddingTop: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: "#3B82F6" }}>R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: isDesktop ? "row" : "column",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push('/login?returnUrl=/cart')
                        return
                      }
                      setIsCheckingOut(true)
                    }}
                    style={{
                      flex: "1",
                      backgroundColor: "#3B82F6",
                      color: "black",
                      border: "none",
                      padding: "16px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Finalizar Compra
                  </button>

                  <a
                    href="/"
                    style={{
                      flex: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "transparent",
                      border: "1px solid #3B82F6",
                      color: "#3B82F6",
                      padding: "16px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      textDecoration: "none",
                    }}
                  >
                    Continuar Comprando
                  </a>
                </div>
              </>
            )}

            {/* Checkout Modal */}
            {isCheckingOut && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "32px",
                    maxWidth: "500px",
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    >
                      Finalizar Compra
                    </h2>
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "24px",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Componente Asaas */}
                  <AsaasCheckout
                    amount={total}
                    description={`Compra de ${cartItems.length} ingresso(s) - ${cartItems.map(item => item.eventName).join(', ')}`}
                    cartItems={cartItems}
                    onSuccess={handleAsaasSuccess}
                    onError={handleAsaasError}
                    userEmail={user?.email}
                    userName={user?.name}
                    userPhone={user?.phone}
                    userCpf={user?.cpf}
                    onLoading={setIsCheckingOut}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
