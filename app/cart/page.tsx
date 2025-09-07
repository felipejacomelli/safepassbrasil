"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/contexts/auth-context"
import { User, ShoppingCart } from "lucide-react"

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
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  // Cart state
  const [cartItems, setCartItems] = useState(() => {
    // If we're in the browser, try to get cart items from localStorage
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          return JSON.parse(savedCart)
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e)
        }
      }
    }

    // Default cart with sample items
    return [
      {
        id: "1",
        eventId: "rock-in-rio-2025",
        eventName: "Rock in Rio 2025",
        ticketType: "Pista Premium",
        price: 750,
        quantity: 2,
        date: "19-28 de Setembro, 2025",
        location: "Cidade do Rock, Rio de Janeiro",
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
      },
      {
        id: "2",
        eventId: "lollapalooza-brasil-2025",
        eventName: "Lollapalooza Brasil 2025",
        ticketType: "VIP",
        price: 1200,
        quantity: 1,
        date: "28-30 de Março, 2025",
        location: "Autódromo de Interlagos, São Paulo",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
      },
    ]
  })

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
  const serviceFee = subtotal * 0.1 // 10% service fee
  const total = subtotal + serviceFee

  // Update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedCart = cartItems.map((item: CartItem) => (item.id === id ? { ...item, quantity: newQuantity } : item))

    setCartItems(updatedCart)

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updatedCart))
    }
  }

  // Remove item
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item: CartItem) => item.id !== id)
    setCartItems(updatedCart)

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updatedCart))
    }
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle checkout form submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: FormErrors = {}

    if (!formData.cardNumber.trim()) newErrors.cardNumber = "Número do cartão é obrigatório"
    if (!formData.expiryDate.trim()) newErrors.expiryDate = "Data de validade é obrigatória"
    if (!formData.cvv.trim()) newErrors.cvv = "CVV é obrigatório"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit form
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setOrderComplete(true)

      // Clear cart
      setCartItems([])
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart")
      }
    }, 2000)
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
      {/* Header/Navigation - Same as home page */}
      <header
        style={{
          padding: "16px",
          borderBottom: "1px solid #333",
          position: "sticky",
          top: 0,
          backgroundColor: "black",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                backgroundColor: "#3B82F6",
                padding: "6px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: "black",
                  borderRadius: "4px",
                }}
              />
            </div>
            <span
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              reticket
            </span>
          </a>

          {/* Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {isDesktop && (
              <>
                <a
                  href="/#como-funciona"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Como Funciona
                </a>
                <a
                  href="#"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  WhatsApp
                </a>
              </>
            )}

            {isAuthenticated && user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #3B82F6",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <User size={16} />
                  {user.name.split(" ")[0]}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "8px",
                      backgroundColor: "#18181B",
                      border: "1px solid #3F3F46",
                      borderRadius: "8px",
                      padding: "8px 0",
                      minWidth: "200px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #3F3F46",
                        marginBottom: "8px",
                      }}
                    >
                      <p style={{ fontWeight: "600", marginBottom: "4px" }}>{user.name}</p>
                      <p style={{ fontSize: "14px", color: "#A1A1AA" }}>{user.email}</p>
                    </div>

                    <a
                      href="/account"
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                      }}
                    >
                      Minha Conta
                    </a>

                    <a
                      href="/account/orders"
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                      }}
                    >
                      Meus Pedidos
                    </a>

                    {user.isAdmin && (
                      <a
                        href="/admin"
                        style={{
                          display: "block",
                          padding: "12px 16px",
                          color: "#3B82F6",
                          textDecoration: "none",
                          fontSize: "14px",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                        }}
                      >
                        Painel Admin
                      </a>
                    )}

                    <div
                      style={{
                        borderTop: "1px solid #3F3F46",
                        marginTop: "8px",
                        paddingTop: "8px",
                      }}
                    >
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "12px 16px",
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#EF4444",
                          textAlign: "left",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                        }}
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #3B82F6",
                    color: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={handleUserClick}
                  title="Login"
                >
                  <User size={20} />
                </button>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #3B82F6",
                    color: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={handleCartClick}
                  title="Carrinho"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

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
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "24px",
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
                  onClick={() => setIsCheckingOut(true)}
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
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "#D4D4D8" }}>Taxa de serviço</span>
                    <span>R$ {serviceFee.toFixed(2).replace(".", ",")}</span>
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
                    onClick={() => setIsCheckingOut(true)}
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

                  <form onSubmit={handleCheckout}>
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          backgroundColor: "#27272A",
                          border: "1px solid #3F3F46",
                          borderRadius: "8px",
                          color: "white",
                          fontSize: "16px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          backgroundColor: "#27272A",
                          border: "1px solid #3F3F46",
                          borderRadius: "8px",
                          color: "white",
                          fontSize: "16px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        style={{
                          width: "100%",
                          padding: "12px",
                          backgroundColor: "#27272A",
                          border: errors.cardNumber ? "1px solid #EF4444" : "1px solid #3F3F46",
                          borderRadius: "8px",
                          color: "white",
                          fontSize: "16px",
                        }}
                      />
                      {errors.cardNumber && (
                        <p style={{ color: "#EF4444", fontSize: "14px", marginTop: "4px" }}>{errors.cardNumber}</p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                          }}
                        >
                          Validade
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/AA"
                          style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#27272A",
                            border: errors.expiryDate ? "1px solid #EF4444" : "1px solid #3F3F46",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "16px",
                          }}
                        />
                        {errors.expiryDate && (
                          <p style={{ color: "#EF4444", fontSize: "14px", marginTop: "4px" }}>{errors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                          }}
                        >
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#27272A",
                            border: errors.cvv ? "1px solid #EF4444" : "1px solid #3F3F46",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "16px",
                          }}
                        />
                        {errors.cvv && (
                          <p style={{ color: "#EF4444", fontSize: "14px", marginTop: "4px" }}>{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#27272A",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "24px",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Resumo do Pedido
                      </h4>
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
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#D4D4D8" }}>Taxa de serviço</span>
                        <span>R$ {serviceFee.toFixed(2).replace(".", ",")}</span>
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

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: "100%",
                        backgroundColor: isSubmitting ? "#6B7280" : "#3B82F6",
                        color: "black",
                        border: "none",
                        padding: "16px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
