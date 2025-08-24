"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { use, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MapPin, Users, Ticket, User, ShoppingCart, Info, Camera, Plus, Minus } from "lucide-react"
import { request } from "@/lib/utils"
import { formatDate } from "@/lib/date"

// Mock event data
const eventsData = [
  {
    slug: "festival-de-verao",
    title: "Festival de Verão",
    date: "15 Dez, 2023",
    time: "16:00",
    location: "Copacabana, RJ",
    attendance: "50k+ pessoas",
    price: "A partir de R$ 150",
    startingPrice: 150,
    availableTickets: 45,
    ticketTypes: [
      { id: "pista", name: "Pista", price: 150, available: 45 },
      { id: "premium", name: "Pista Premium", price: 250, available: 23 },
      { id: "vip", name: "VIP", price: 450, available: 8 },
    ],
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Festival de Verão é um dos eventos mais aguardados da temporada, reunindo grandes nomes da música brasileira e internacional em um cenário paradisíaco.",
      "Com uma programação diversificada que vai do pop ao rock, do samba ao eletrônico, o festival promete agradar a todos os gostos musicais.",
      "Além dos shows, o evento conta com áreas de alimentação, lounges e diversas atividades para tornar sua experiência ainda mais completa.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
]

export default function EventPage({ params }: { params: { slug: string } }) {
  const { slug }: any = use(params as any)
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const [event, setEvent]: [any, any] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [ticketQuantities, setTicketQuantities] = useState({})

  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    fetchEvent(slug)
  }, [params])

  const fetchEvent = async (slug: string) => {
    console.log("Fetching event for slug:", slug)
    const eventResponse = await request({
      method: 'GET',
      url: `event_app/event/${slug}/`,
      body: {}
    })

    console.log(await eventResponse)

    if (eventResponse) {
      setEvent({
        ...eventResponse.data,
        startingPrice: 150,
        availableTickets: 45,
        ticketTypes: [
          { id: "pista", name: "Pista", price: 150, available: 45 },
          { id: "premium", name: "Pista Premium", price: 250, available: 23 },
          { id: "vip", name: "VIP", price: 450, available: 8 },
        ],
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60",
        attendance: "50k+ pessoas",
      } as any)
      setNotFound(false)
      const initialQuantities = {}
      // eventResponse.ticketTypes.forEach((ticket) => {
      //   initialQuantities[ticket.id] = 1
      // })
      // setTicketQuantities(initialQuantities)
      setTicketQuantities(initialQuantities)
    } else {
      setNotFound(true)
    }

    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    window.location.href = "/"
  }

  const handleUserClick = () => {
    window.location.href = "/login"
  }

  const handleCartClick = () => {
    window.location.href = "/cart"
  }

  const updateTicketQuantity = (ticketId, newQuantity) => {
    if (newQuantity < 1) return
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: newQuantity,
    }))
  }

  const addToCart = (ticketType) => {
    const quantity = ticketQuantities[ticketType.id] || 1

    const ticket = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: event.slug,
      eventName: event.title,
      ticketType: ticketType.name,
      price: ticketType.price,
      quantity: quantity,
      date: event.date,
      location: event.location,
      image: event.image,
      description: event.description,
      time: event.time,
      attendance: event.attendance,
      gallery: event.gallery || [],
    }

    // Get existing cart or create new one
    let cart = []
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        cart = JSON.parse(savedCart)
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e)
    }

    // Add ticket to cart
    cart.push(ticket)

    // Save cart
    localStorage.setItem("cart", JSON.stringify(cart))

    // Navigate to cart page
    window.location.href = "/cart"
  }

  if (loading) {
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
        <p>Carregando informações do evento...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div
        style={{
          backgroundColor: "black",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Evento não encontrado</h1>
        <p style={{ marginBottom: "24px" }}>O evento que você está procurando não está disponível.</p>
        <a
          href="/"
          style={{
            backgroundColor: "#3B82F6",
            color: "black",
            padding: "10px 20px",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Voltar para a página inicial
        </a>
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
      {/* Header/Navigation */}
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

      {/* Event Details */}
      <main
        style={{
          padding: "24px 16px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Event Header */}
        <h1
          style={{
            fontSize: isDesktop ? "32px" : "24px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {event.name}
        </h1>

        {/* Compact Event Image */}
        <div
          style={{
            position: "relative",
            height: isDesktop ? "300px" : "200px",
            backgroundColor: "#27272A",
            borderRadius: "12px",
            marginBottom: "20px",
            overflow: "hidden",
          }}
        >
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.name}
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

        {/* Compact Event Info */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#D4D4D8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{display: "flex", gap: "6px", alignItems: "center"}}>
              <Calendar size={16} /> / <Clock size={16} />
            </div>
            <span>{formatDate(event?.start_date ?? '')}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>{event.time}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={16} />
            <span>{event.attendance}</span>
          </div>
        </div>

        {/* Price and Ticket Types */}
        <div
          style={{
            backgroundColor: "#27272A",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#3B82F6",
              marginBottom: "20px",
            }}
          >
            A partir de R$ {event.startingPrice}
          </p>

          {/* Ticket Types List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {event.ticketTypes.map((ticketType) => (
              <div
                key={ticketType.id}
                style={{
                  backgroundColor: "#18181B",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {/* Ticket Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1", minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#3B82F6" }}>
                    <Ticket size={16} />
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>{ticketType.available}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{ticketType.name}</h4>
                    <p style={{ fontSize: "18px", fontWeight: "bold", color: "#3B82F6" }}>
                      R$ {ticketType.price.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>

                {/* Quantity and Add to Cart */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Quantity Controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => updateTicketQuantity(ticketType.id, (ticketQuantities[ticketType.id] || 1) - 1)}
                      style={{
                        backgroundColor: "#3F3F46",
                        border: "none",
                        color: "white",
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      style={{
                        minWidth: "24px",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      {ticketQuantities[ticketType.id] || 1}
                    </span>
                    <button
                      onClick={() => updateTicketQuantity(ticketType.id, (ticketQuantities[ticketType.id] || 1) + 1)}
                      style={{
                        backgroundColor: "#3F3F46",
                        border: "none",
                        color: "white",
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(ticketType)}
                    disabled={ticketType.available === 0}
                    style={{
                      backgroundColor: ticketType.available === 0 ? "#6B7280" : "#3B82F6",
                      color: "black",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 16px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: ticketType.available === 0 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ShoppingCart size={16} />
                    {ticketType.available === 0 ? "Esgotado" : "Adicionar"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sell Ticket Button */}
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #3F3F46" }}>
            <button
              style={{
                backgroundColor: "black",
                border: "1px solid #3B82F6",
                color: "#3B82F6",
                borderRadius: "8px",
                padding: "14px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => {
                window.location.href = `/event/${event.slug}/sell`
              }}
            >
              <Ticket size={20} />
              Vender Ingresso
            </button>
          </div>
        </div>

        {/* Event Description */}
        <div
          style={{
            backgroundColor: "#27272A",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Info size={24} /> Sobre o Evento
          </h2>

          <div
            style={{
              color: "#D4D4D8",
              lineHeight: "1.6",
            }}
          >
            {event.description?.map((paragraph, index) => (
              <p key={index} style={{ marginBottom: index < event.description.length - 1 ? "16px" : "0" }}>
                {paragraph}
              </p>
            )) || (
              <>
                <p style={{ marginBottom: "16px" }}>
                  O {event.title} é um dos eventos mais aguardados do ano, reunindo grandes nomes da música brasileira e
                  internacional em um cenário incrível.
                </p>
                <p>
                  Com uma programação diversificada, o festival promete agradar a todos os gostos musicais, além de
                  oferecer uma experiência completa com áreas de alimentação e diversas atividades.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div
          style={{
            backgroundColor: "#27272A",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Camera size={24} /> Galeria de Imagens
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {(
              event.gallery || [
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=80",
              ]
            ).map((image, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  paddingTop: "100%", // 1:1 aspect ratio
                  backgroundColor: "#18181B",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => {
                  // Could implement a lightbox here in the future
                  window.open(image, "_blank")
                }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${event.title} ${index + 1}`}
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
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#18181B",
          borderTop: "1px solid #27272A",
          padding: "32px 16px",
          marginTop: "48px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              Sobre
            </h3>
            <p
              style={{
                color: "#A1A1AA",
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "12px",
              }}
            >
              ReTicket é uma plataforma confiável para compra e venda de ingressos diretamente entre fãs.
            </p>
            <p
              style={{
                color: "#A1A1AA",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Nossa missão é conectar pessoas, que desejam revender seus ingressos devido a imprevistos, com compradores
              que procuram as melhores ofertas de última hora.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            <a
              href="#"
              style={{
                backgroundColor: "#27272A",
                color: "white",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <span>📱</span>
            </a>
            <a
              href="#"
              style={{
                backgroundColor: "#27272A",
                color: "white",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <span>📷</span>
            </a>
            <a
              href="#"
              style={{
                backgroundColor: "#27272A",
                color: "white",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <span>🎬</span>
            </a>
            <a
              href="#"
              style={{
                backgroundColor: "#27272A",
                color: "white",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <span>🐦</span>
            </a>
          </div>

          <p
            style={{
              color: "#71717A",
              fontSize: "12px",
              textAlign: "center",
              marginTop: "24px",
            }}
          >
            © 2023 ReTicket. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
