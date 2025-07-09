"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/contexts/auth-context"

export default function CartPage() {
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

    // Default cart with one item
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
        description: [
          "O Rock in Rio é um dos maiores festivais de música do mundo, reunindo artistas nacionais e internacionais em performances inesquecíveis.",
          "Durante os dias de festival, a Cidade do Rock se transforma em um verdadeiro parque de diversões para os amantes da música, com várias atrações além dos shows principais.",
        ],
        time: "14:00 - 00:00",
        attendance: "100.000+ pessoas",
        gallery: [
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1504295016394-f96591c60c5a?w=300&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1531206715517-5c019193961a?w=300&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1516935548944-08fb90dd99aa?w=300&auto=format&fit=crop&q=60",
        ],
      },
    ]
  })

  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    address: "",
    city: "",
    zipCode: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const serviceFee = subtotal * 0.1 // 10% service fee
  const total = subtotal + serviceFee

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return

    const updatedCart = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))

    setCartItems(updatedCart)

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updatedCart))
    }
  }

  // Remove item
  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedCart)

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updatedCart))
    }
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle checkout form submission
  const handleCheckout = (e) => {
    e.preventDefault()

    // Validate form
    const newErrors = {}

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
      {/* Header/Navigation */}
      <header
        style={{
          padding: "16px",
          borderBottom: "1px solid #333",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(0,0,0,0.9)",
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
                  href="#"
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {user.name.split(" ")[0]}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        e.target.style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent"
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
                        e.target.style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent"
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
                          e.target.style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent"
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
                          e.target.style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent"
                        }}
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #3B82F6",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  onClick={() => router.push("/register")}
                >
                  Cadastrar
                </button>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #3B82F6",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  onClick={() => router.push("/login")}
                >
                  Acessar
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "24px 16px",
          maxWidth: "1200px",
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "2fr 1fr" : "1fr",
                  gap: "24px",
                }}
              >
                {/* Cart Items */}
                <div>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "#18181B",
                        borderRadius: "12px",
                        padding: "24px",
                        marginBottom: "24px",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          marginBottom: "16px",
                        }}
                      >
                        Detalhes do Ingresso
                      </h2>

                      {/* Ticket Badge */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V10M22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10M22 10H2M9 14H15"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span style={{ fontWeight: "600" }}>Ingresso</span>
                        </div>
                        <div
                          style={{
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            color: "#10B981",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Garantido
                        </div>
                      </div>

                      {/* Event Header */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: isDesktop ? "row" : "column",
                          gap: "20px",
                          marginBottom: "24px",
                        }}
                      >
                        {/* Event Image */}
                        <div
                          style={{
                            width: isDesktop ? "280px" : "100%",
                            height: isDesktop ? "160px" : "200px",
                            borderRadius: "8px",
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

                        {/* Event Basic Info */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                fontSize: "22px",
                                fontWeight: "bold",
                                marginBottom: "8px",
                              }}
                            >
                              {item.eventName}
                            </h3>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                                color: "#D4D4D8",
                              }}
                            >
                              <span style={{ marginRight: "8px" }}>📅</span>
                              <span>{item.date}</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                                color: "#D4D4D8",
                              }}
                            >
                              <span style={{ marginRight: "8px" }}>📍</span>
                              <span>{item.location}</span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "inline-block",
                              backgroundColor: "rgba(59, 130, 246, 0.15)",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              color: "#3B82F6",
                              fontWeight: "600",
                              fontSize: "14px",
                              marginTop: "8px",
                            }}
                          >
                            {item.ticketType}
                          </div>
                        </div>
                      </div>

                      {/* Ticket Details */}
                      <div
                        style={{
                          backgroundColor: "#27272A",
                          borderRadius: "8px",
                          padding: "16px",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <span style={{ color: "#D4D4D8" }}>Tipo de Ingresso</span>
                          <span style={{ fontWeight: "500" }}>{item.ticketType}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <span style={{ color: "#D4D4D8" }}>Preço Unitário</span>
                          <span style={{ fontWeight: "500" }}>R$ {item.price.toFixed(2).replace(".", ",")}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <span style={{ color: "#D4D4D8" }}>Quantidade</span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                backgroundColor: "#3F3F46",
                                border: "none",
                                color: "white",
                                width: "28px",
                                height: "28px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                backgroundColor: "#3F3F46",
                                border: "none",
                                color: "white",
                                width: "28px",
                                height: "28px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: "1px solid #3F3F46",
                            paddingTop: "12px",
                            marginTop: "12px",
                          }}
                        >
                          <span style={{ fontWeight: "600" }}>Subtotal</span>
                          <span style={{ color: "#3B82F6", fontWeight: "bold", fontSize: "18px" }}>
                            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </div>

                      {/* Event Additional Info */}
                      <div
                        style={{
                          marginBottom: "20px",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "12px",
                          }}
                        >
                          Informações do Evento
                        </h4>
                        {item.description &&
                          item.description.map((paragraph, index) => (
                            <p
                              key={index}
                              style={{
                                color: "#D4D4D8",
                                fontSize: "14px",
                                lineHeight: "1.6",
                                marginBottom: index < item.description.length - 1 ? "12px" : 0,
                              }}
                            >
                              {paragraph}
                            </p>
                          ))}
                      </div>

                      {/* Event Gallery */}
                      {item.gallery && item.gallery.length > 0 && (
                        <div
                          style={{
                            marginBottom: "20px",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "12px",
                            }}
                          >
                            Galeria de Imagens
                          </h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                              gap: "8px",
                            }}
                          >
                            {(item.gallery || []).slice(0, 4).map((image, index) => (
                              <div
                                key={index}
                                style={{
                                  position: "relative",
                                  paddingTop: "100%", // 1:1 aspect ratio
                                  backgroundColor: "#27272A",
                                  borderRadius: "6px",
                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`${item.eventName} ${index + 1}`}
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6H5H21"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 11V17"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 11V17"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "24px",
                    height: "fit-content",
                    position: "sticky",
                    top: "100px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginBottom: "20px",
                    }}
                  >
                    Resumo do Pedido
                  </h3>

                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
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
                      marginBottom: "12px",
                    }}
                  >
                    Finalizar Compra
                  </button>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#A1A1AA",
                      textAlign: "center",
                    }}
                  >
                    Pagamento seguro e protegido
                  </p>
                </div>
              </div>
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
