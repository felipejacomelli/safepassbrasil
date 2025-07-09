"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

// Mock event data
const eventsData = [
  {
    slug: "festival-de-verao",
    title: "Festival de Verão",
    date: "15 de Dezembro, 2023",
    time: "16:00 - 02:00",
    location: "Praia de Copacabana, Rio de Janeiro",
    attendance: "50.000+ pessoas",
    price: "A partir de R$ 150",
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
  {
    slug: "rock-in-rio-2023",
    title: "Rock in Rio 2023",
    date: "2-10 de Setembro, 2023",
    time: "14:00 - 00:00",
    location: "Cidade do Rock, Rio de Janeiro",
    attendance: "100.000+ pessoas",
    price: "A partir de R$ 250",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Rock in Rio é um dos maiores festivais de música do mundo, reunindo artistas nacionais e internacionais em performances inesquecíveis. Em 2023, o evento promete ser ainda mais grandioso, com uma lineup diversificada e cheia de estrelas.",
      "Durante os dias de festival, a Cidade do Rock se transforma em um verdadeiro parque de diversões para os amantes da música, com várias atrações além dos shows principais, incluindo a famosa roda gigante, tirolesa, e diversas opções gastronômicas.",
      "Não perca a chance de fazer parte deste evento histórico e viver momentos únicos ao som de seus artistas favoritos!",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
  {
    slug: "lollapalooza-brasil-2024",
    title: "Lollapalooza Brasil 2024",
    date: "24-26 de Março, 2024",
    time: "11:00 - 23:00",
    location: "Autódromo de Interlagos, São Paulo",
    attendance: "80.000+ pessoas",
    price: "A partir de R$ 200",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Lollapalooza Brasil retorna em 2024 para sua décima edição no país, trazendo o melhor da música alternativa, rock, hip-hop, música eletrônica e muito mais.",
      "Distribuído em diversos palcos no Autódromo de Interlagos, o festival oferece uma experiência completa com atrações para todos os gostos, além de áreas de descanso, praça de alimentação com opções diversificadas e espaços instagramáveis.",
      "Prepare-se para três dias intensos de música, arte e cultura em um dos festivais mais aguardados do calendário brasileiro.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
  {
    slug: "rock-in-rio-2025",
    title: "Rock in Rio 2025",
    date: "19-28 de Setembro, 2025",
    time: "14:00 - 00:00",
    location: "Cidade do Rock, Rio de Janeiro",
    attendance: "100.000+ pessoas",
    price: "A partir de R$ 650",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Rock in Rio retorna em 2025 para sua edição comemorativa de 40 anos, prometendo ser o maior festival da história do evento.",
      "Com uma programação especial que celebra quatro décadas de música, o festival trará grandes nomes do rock, pop, hip-hop e música eletrônica de diferentes gerações.",
      "A Cidade do Rock será completamente renovada para esta edição especial, com novas áreas temáticas, atrações interativas e uma experiência imersiva única.",
      "Não perca a chance de fazer parte desta celebração histórica da música mundial!",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
  {
    slug: "lollapalooza-brasil-2025",
    title: "Lollapalooza Brasil 2025",
    date: "28-30 de Março, 2025",
    time: "11:00 - 23:00",
    location: "Autódromo de Interlagos, São Paulo",
    attendance: "90.000+ pessoas",
    price: "A partir de R$ 750",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Lollapalooza Brasil 2025 promete ser a maior edição já realizada no país, com uma lineup internacional de peso e novidades exclusivas.",
      "O festival expandirá para três dias completos de música, com mais de 70 atrações distribuídas em 5 palcos diferentes no Autódromo de Interlagos.",
      "Além dos shows, o evento contará com áreas gastronômicas ampliadas, espaços de arte interativa e uma nova área dedicada à sustentabilidade e tecnologia.",
      "Prepare-se para uma experiência musical completa em um dos festivais mais importantes do calendário global.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
  {
    slug: "tomorrowland-brasil-2025",
    title: "Tomorrowland Brasil 2025",
    date: "10-12 de Outubro, 2025",
    time: "12:00 - 02:00",
    location: "Parque Maeda, Itu, São Paulo",
    attendance: "180.000+ pessoas",
    price: "A partir de R$ 1200",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=60",
    description: [
      "O Tomorrowland retorna ao Brasil em 2025 com sua maior edição já realizada no país, trazendo o melhor da música eletrônica mundial.",
      "Com mais de 10 palcos temáticos espalhados pelo Parque Maeda, o festival promete uma experiência imersiva única, com cenografia elaborada e efeitos visuais de última geração.",
      "Além dos DJs internacionais, o evento contará com uma área dedicada aos talentos brasileiros da música eletrônica e experiências gastronômicas exclusivas.",
      "Prepare-se para três dias de magia, música e uma produção de nível internacional que só o Tomorrowland pode oferecer.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
  },
]

export default function EventPage({ params }: { params: { slug: string } }) {
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Find the event data based on the slug
    const foundEvent = eventsData.find((e) => e.slug === params.slug)

    if (foundEvent) {
      setEvent(foundEvent)
      setNotFound(false)
    } else {
      setNotFound(true)
    }

    setLoading(false)
  }, [params.slug])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    window.location.href = "/"
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
          backgroundColor: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
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
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
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
                        transition: "background-color 0.2s",
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
                        transition: "background-color 0.2s",
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
                          transition: "background-color 0.2s",
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
                          transition: "background-color 0.2s",
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
                  onClick={() => (window.location.href = "/register")}
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
                  onClick={() => (window.location.href = "/login")}
                >
                  Acessar
                </button>
              </>
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
        {/* Event Header with Title and Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: isDesktop ? "36px" : "24px",
              fontWeight: "bold",
            }}
          >
            {event.title}
          </h1>

          <div
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              color: "#3B82F6",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {event.price}
          </div>
        </div>

        {/* Event Image */}
        <div
          style={{
            position: "relative",
            paddingTop: "56.25%", // 16:9 aspect ratio
            backgroundColor: "#27272A",
            borderRadius: "12px",
            marginBottom: "24px",
            overflow: "hidden",
          }}
        >
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
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

        {/* Event Info Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#27272A",
              padding: "16px",
              borderRadius: "8px",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📅</span>
            <span style={{ fontSize: "14px", color: "#A1A1AA" }}>Data</span>
            <span style={{ fontWeight: "500" }}>{event.date}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#27272A",
              padding: "16px",
              borderRadius: "8px",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📍</span>
            <span style={{ fontSize: "14px", color: "#A1A1AA" }}>Local</span>
            <span style={{ fontWeight: "500" }}>{event.location}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#27272A",
              padding: "16px",
              borderRadius: "8px",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⏰</span>
            <span style={{ fontSize: "14px", color: "#A1A1AA" }}>Horário</span>
            <span style={{ fontWeight: "500" }}>{event.time || "19:00 - 23:00"}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#27272A",
              padding: "16px",
              borderRadius: "8px",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>👥</span>
            <span style={{ fontSize: "14px", color: "#A1A1AA" }}>Público</span>
            <span style={{ fontWeight: "500" }}>{event.attendance || "10.000+ pessoas"}</span>
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
            <span style={{ fontSize: "24px" }}>ℹ️</span> Sobre o Evento
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

        {/* Ticket Selection */}
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
            <span style={{ fontSize: "24px" }}>🎟️</span> Ingressos Disponíveis
          </h2>

          <div
            style={{
              backgroundColor: "#18181B",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "16px",
              border: "1px solid #3F3F46",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#E4E4E7",
              }}
            >
              Selecione o tipo de ingresso
            </h3>

            <select
              style={{
                width: "100%",
                backgroundColor: "#3F3F46",
                color: "white",
                padding: "12px",
                borderRadius: "4px",
                border: "none",
                marginBottom: "20px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              <option>Pista Premium</option>
              <option>Pista</option>
              <option>Cadeira Inferior</option>
              <option>Cadeira Superior</option>
            </select>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#27272A",
                borderRadius: "6px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#E4E4E7",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Acesso ao evento
                </p>
                <p
                  style={{
                    color: "#A1A1AA",
                    fontSize: "12px",
                  }}
                >
                  Entrada garantida
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#3B82F6",
                  fontSize: "14px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  fontWeight: "500",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V10M22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10M22 10H2M9 14H15"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>12 ingressos disponíveis</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "12px 16px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: "6px",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#E4E4E7",
                }}
              >
                Valor do ingresso
              </p>
              <p
                style={{
                  color: "#3B82F6",
                  fontWeight: "bold",
                  fontSize: "24px",
                }}
              >
                R$ 750,00
              </p>
            </div>

            <button
              style={{
                backgroundColor: "#3B82F6",
                color: "black",
                border: "none",
                borderRadius: "8px",
                padding: "16px",
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
                // Add the selected ticket to cart
                const ticket = {
                  id: Math.random().toString(36).substr(2, 9),
                  eventId: event.slug,
                  eventName: event.title,
                  ticketType: document.querySelector("select").value,
                  price: 750,
                  quantity: 1,
                  date: event.date,
                  location: event.location,
                  image: event.image,
                  description: event.description || [
                    `O ${event.title} é um dos eventos mais aguardados do ano, reunindo grandes nomes da música brasileira e internacional em um cenário incrível.`,
                    "Com uma programação diversificada, o festival promete agradar a todos os gostos musicais, além de oferecer uma experiência completa com áreas de alimentação e diversas atividades.",
                  ],
                  time: event.time || "19:00 - 23:00",
                  attendance: event.attendance || "10.000+ pessoas",
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
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 3H5L5.4 5M5.4 5H21L17 13H7M5.4 5L7 13M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C16.4696 17 15.9609 17.2107 15.5858 17.5858C15.2107 17.9609 15 18.4696 15 19C15 19.5304 15.2107 20.0391 15.5858 20.4142C15.9609 20.7893 16.4696 21 17 21C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19C19 18.4696 18.7893 17.9609 18.4142 17.5858C18.0391 17.2107 17.5304 17 17 17ZM9 19C9 19.5304 8.78929 20.0391 8.41421 20.4142C8.03914 20.7893 7.53043 21 7 21C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19C5 18.4696 5.21071 17.9609 5.58579 17.5858C5.96086 17.2107 6.46957 17 7 17C7.53043 17 8.03914 17.2107 8.41421 17.5858C8.78929 17.9609 9 18.4696 9 19Z"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Comprar
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#18181B",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Tem ingressos para vender?
            </h3>

            {/* Ticket Type Selection */}
            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="sell-ticket-type"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  color: "#D4D4D8",
                }}
              >
                Tipo de Ingresso
              </label>
              <select
                id="sell-ticket-type"
                style={{
                  width: "100%",
                  backgroundColor: "#27272A",
                  color: "white",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #3F3F46",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              >
                <option value="pista-premium">Pista Premium</option>
                <option value="pista">Pista</option>
                <option value="cadeira-inferior">Cadeira Inferior</option>
                <option value="cadeira-superior">Cadeira Superior</option>
                <option value="camarote">Camarote</option>
              </select>
            </div>

            {/* Price Input */}
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="sell-price"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  color: "#D4D4D8",
                }}
              >
                Valor (R$)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="sell-price"
                  type="text"
                  placeholder="0,00"
                  style={{
                    width: "100%",
                    backgroundColor: "#27272A",
                    color: "white",
                    padding: "10px 10px 10px 36px",
                    borderRadius: "6px",
                    border: "1px solid #3F3F46",
                    fontSize: "14px",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#A1A1AA",
                    fontSize: "14px",
                  }}
                >
                  R$
                </span>
              </div>
            </div>

            <button
              style={{
                backgroundColor: "transparent",
                border: "1px solid #10B981",
                color: "#10B981",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                width: "100%",
                marginTop: "4px",
              }}
              onClick={() => {
                const ticketType = document.getElementById("sell-ticket-type").value
                const price = document.getElementById("sell-price").value
                if (!price || isNaN(Number(price.replace(",", "."))) || Number(price.replace(",", ".")) <= 0) {
                  alert("Por favor, insira um valor válido")
                  return
                }
                window.location.href = `/event/${event.slug}/sell?type=${ticketType}&price=${price}`
              }}
            >
              Vender Ingressos
            </button>
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
            <span style={{ fontSize: "24px" }}>📷</span> Galeria de Imagens
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
                  transition: "transform 0.2s ease-in-out",
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
