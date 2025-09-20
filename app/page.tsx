"use client"

// Removed useMediaQuery to avoid hydration mismatch - using CSS classes instead
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MapPin, User, ShoppingCart, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { eventsApi, transformEventForFrontend, Event } from "@/lib/api"

// Interface para eventos do frontend
interface FrontendEvent {
  id: string;
  image: string;
  title: string;
  date: string;
  location: string;
  price: string;
  slug: string;
  ticketCount: number;
  description?: string;
  category?: string;
}

// Interface para categorias da API
interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

// Interface para localizações da API
interface ApiLocation {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

// Interface para categorias do frontend
interface FrontendCategory {
  name: string;
  count: string;
  image: string;
}

// Interface para localizações do frontend
interface FrontendLocation {
  name: string;
  count: string;
  image: string;
}

const defaultCategories = [
  {
    name: "Música",
    count: "0",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Esportes",
    count: "0",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Teatro",
    count: "0",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Festivais",
    count: "0",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60",
  },
]

const defaultLocations = [
  {
    name: "São Paulo",
    count: "0",
    image: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Rio de Janeiro",
    count: "0",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Belo Horizonte",
    count: "0",
    image: "https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?w=800&auto=format&fit=crop&q=60",
  },
  {
    name: "Curitiba",
    count: "0",
    image: "https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?w=800&auto=format&fit=crop&q=60",
  },
]

// Update the Page component to include search functionality
export default function Page() {
  console.log('🔍 DEBUG - Componente Page renderizado')
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Estado para os eventos carregados da API
  const [events, setEvents] = useState<FrontendEvent[]>([])
  const [categories, setCategories] = useState<FrontendCategory[]>(defaultCategories)
  const [locations, setLocations] = useState<FrontendLocation[]>(defaultLocations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Estado para paginação dos eventos
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 4

  // Ensure client-side rendering to avoid hydration mismatch
  useEffect(() => {
    console.log('🔍 DEBUG - useEffect isClient executado')
    setIsClient(true)
    console.log('🔍 DEBUG - Window está disponível, executando no cliente!')
  }, [])
  
  // Carregar dados quando o componente for montado
  useEffect(() => {
    if (dataLoaded) {
      return
    }
    
    console.log('🔍 DEBUG - Iniciando carregamento dos dados!')
    setLoading(true)
    
    const loadData = async () => {
      try {
        console.log('🔍 DEBUG - Carregando localizações...')
        const apiLocations = await loadLocationCounts()
        console.log('🔍 DEBUG - Localizações carregadas:', apiLocations)
        
        const [apiEvents, apiCategories] = await Promise.all([
          eventsApi.getAll(),
          loadCategoryCounts()
        ])
        
        const transformedEvents: FrontendEvent[] = apiEvents.map((event: any) => ({
          id: event.id,
          image: event.image,
          title: event.name,
          date: event.date,
          location: event.location,
          price: event.price,
          slug: event.slug,
          ticketCount: event.ticket_count,
          description: event.description,
          category: event.category
        }))
        
        console.log('🔍 DEBUG - Setando estados...')
        setEvents(transformedEvents)
        setCategories(apiCategories)
        setLocations(apiLocations)
        setError(null)
        setDataLoaded(true)
        console.log('🔍 DEBUG - Dados carregados com sucesso!')
      } catch (err) {
        console.error('🔍 DEBUG - Erro ao carregar dados:', err)
        setError('Erro ao carregar dados')
        setEvents([])
        setCategories(defaultCategories)
        setLocations(defaultLocations)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [dataLoaded])

  // Listener para atualizar contador de ingressos
  useEffect(() => {
    const handleTicketCountUpdate = (event: CustomEvent) => {
      const { eventId, newCount } = event.detail
      setEvents(prevEvents => 
        prevEvents.map(evt => 
          evt.slug === eventId || evt.title === eventId
            ? { ...evt, ticketCount: newCount }
            : evt
        )
      )
    }

    window.addEventListener('ticketCountUpdated', handleTicketCountUpdate as EventListener)
    
    return () => {
      window.removeEventListener('ticketCountUpdated', handleTicketCountUpdate as EventListener)
    }
  }, [])
  
  // Cálculos para paginação
  const totalPages = Math.ceil(events.length / eventsPerPage)
  const startIndex = (currentPage - 1) * eventsPerPage
  const endIndex = startIndex + eventsPerPage
  const currentEvents = events.slice(startIndex, endIndex)
  
  // Funções para buscar dados da API
  const loadCategoryCounts = async (): Promise<FrontendCategory[]> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/category_app/categories/counts/`)
      if (!response.ok) throw new Error('Erro ao carregar contadores de categorias')
      const apiCategoryCounts = await response.json()
      
      return apiCategoryCounts.map((category: any) => ({
        name: category.name,
        count: category.event_count > 0 ? `${category.event_count}+` : "0",
        image: getCategoryImage(category.name)
      }))
    } catch (err) {
      console.error('Erro ao carregar contadores de categorias:', err)
      return defaultCategories
    }
  }

  // Função auxiliar para obter imagem da categoria
  const getCategoryImage = (categoryName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Música': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60',
      'Esportes': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=60',
      'Teatro': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=60',
      'Festivais': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60',
      'Shows': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60',
      'Stand-up': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=60',
      'Conferências': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
    }
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60'
  }

  const loadLocationCounts = async (): Promise<FrontendLocation[]> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/category_app/locations/counts/`)
      if (!response.ok) throw new Error('Erro ao carregar contadores de localizações')
      const apiLocationCounts = await response.json()
      
      console.log('🔍 DEBUG - Dados recebidos do backend:', apiLocationCounts)
      
      const result = apiLocationCounts.map((location: any) => ({
        name: location.name,
        count: location.event_count > 0 ? `${location.event_count}+` : "0",
        image: getLocationImage(location.name)
      }))
      
      console.log('🔍 DEBUG - Dados processados para frontend:', result)
      return result
    } catch (err) {
      console.error('Erro ao carregar contadores de localizações:', err)
      return defaultLocations
    }
  }

  // Função auxiliar para obter imagem da localização
  const getLocationImage = (locationName: string): string => {
    const imageMap: { [key: string]: string } = {
      'São Paulo': 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=800&auto=format&fit=crop&q=60',
      'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=60',
      'Belo Horizonte': 'https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?w=800&auto=format&fit=crop&q=60',
      'Curitiba': 'https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?w=800&auto=format&fit=crop&q=60',
      'Brasília': 'https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?w=800&auto=format&fit=crop&q=60',
      'Salvador': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=60'
    }
    return imageMap[locationName] || 'https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?w=800&auto=format&fit=crop&q=60'
  }

  // Os dados são carregados diretamente no corpo do componente acima

  // Os contadores agora vêm diretamente do backend via endpoints dinâmicos
  // Removidos os useEffects de contagem local

  // Add search function
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Navigate to search page with query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  // Function for search button click
  const handleSearchButtonClick = () => {
    if (!searchQuery.trim()) return

    // Navigate to search page with query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    router.push("/") // Redireciona para página inicial após logout
  }

  const handleUserClick = () => {
    router.push("/login")
  }

  const handleCartClick = () => {
    router.push("/cart")
  }

  const handleSellTickets = () => {
    router.push("/sell")
  }
  
  console.log('🔍 DEBUG - Estado atual das localizações antes da renderização:', locations)

  // Show loading state while data is being loaded
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
              className="hidden sm:flex"
            >
              <a
                href="#como-funciona"
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
            </div>

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
                        e.currentTarget.style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
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
                        e.currentTarget.style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
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
                          e.currentTarget.style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
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
                          e.currentTarget.style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
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

      {/* Hero Section */}
      <section
        style={{
          padding: "40px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(24px, 6vw, 48px)",
            fontWeight: "bold",
            lineHeight: "1.1",
            maxWidth: "800px",
            margin: "0 0 16px 0",
          }}
        >
          COMPRA E VENDA DE INGRESSOS COM SEGURANÇA
        </h1>
        <p
          style={{
            color: "#3B82F6",
            fontSize: "18px",
            fontWeight: "500",
            margin: "0 0 32px 0",
          }}
        >
          Compre e revenda com proteção total sem estresse e sem golpe.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            width: "100%",
            maxWidth: "600px",
            position: "relative",
            marginBottom: "32px",
          }}
        >
          <input
            type="search"
            placeholder="Busque por evento, categoria ou palavra-chave"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "16px 48px",
              backgroundColor: "rgba(39, 39, 42, 0.8)",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "white",
              fontSize: "16px",
              outline: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#71717A",
            }}
          >
            🔍
          </span>
        </form>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
            maxWidth: "600px",
            flexDirection: "column",
          }}
          className="sm:flex-row"
        >
          <button
            onClick={handleSearchButtonClick}
            style={{
              backgroundColor: "#3B82F6",
              color: "black",
              border: "none",
              borderRadius: "8px",
              padding: "16px 32px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              flex: "1",
            }}
          >
            Buscar Eventos
          </button>

          <button
            onClick={handleSellTickets}
            style={{
              backgroundColor: "transparent",
              color: "#3B82F6",
              border: "2px solid #3B82F6",
              borderRadius: "8px",
              padding: "16px 32px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Plus size={20} />
            Vender Ingressos
          </button>
        </div>

        <p
          style={{
            color: "#A1A1AA",
            fontSize: "14px",
            textAlign: "center",
            marginTop: "16px",
            maxWidth: "500px",
          }}
        >
          Seu ingresso é entregue com segurança. Seu pagamento também. A gente cuida dos dois lados.
        </p>
      </section>

      {/* Events Section */}
      <section
        style={{
          backgroundColor: "#18181B",
          padding: "48px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            Próximos eventos
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", gridColumn: "1 / -1" }}>
                <p>Carregando eventos...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px", gridColumn: "1 / -1", color: "#ef4444" }}>
                <p>{error}</p>
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", gridColumn: "1 / -1" }}>
                <p>Nenhum evento encontrado.</p>
              </div>
            ) : (
              currentEvents.map((event, index) => (
                <EventCard key={index} {...event} />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "1px solid #3F3F46",
                  backgroundColor: currentPage === 1 ? "#27272A" : "#18181B",
                  color: currentPage === 1 ? "#71717A" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid #3F3F46",
                      backgroundColor: currentPage === page ? "#3B82F6" : "#18181B",
                      color: currentPage === page ? "black" : "white",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "1px solid #3F3F46",
                  backgroundColor: currentPage === totalPages ? "#27272A" : "#18181B",
                  color: currentPage === totalPages ? "#71717A" : "white",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section
        style={{
          padding: "48px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            Eventos por categoria
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {categories
              .filter(category => parseInt(category.count) > 0)
              .map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section
        style={{
          backgroundColor: "#18181B",
          padding: "48px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            Eventos por localização
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {locations
              .filter(location => parseInt(location.count) > 0)
              .map((location, index) => (
                <LocationCard key={index} {...location} />
              ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="como-funciona"
        style={{
          padding: "64px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Como funciona
          </h2>
          <p
            style={{
              color: "#A1A1AA",
              textAlign: "center",
              maxWidth: "600px",
              margin: "0 auto 48px auto",
            }}
          >
            Comprar e vender ingressos nunca foi tão fácil e seguro
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "12px",
                  width: "120px",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  padding: "20px",
                }}
              >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="#3B82F6" strokeWidth="1.5" />
                  <path
                    d="M16.5 16.5L21 21"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                Encontre seu evento
              </h3>
              <p
                style={{
                  color: "#A1A1AA",
                  lineHeight: "1.6",
                }}
              >
                Busque por eventos, categorias ou localizações e encontre os ingressos que você procura.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "12px",
                  width: "120px",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  padding: "20px",
                }}
              >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="#3B82F6" strokeWidth="1.5" />
                  <path d="M3 10H21" stroke="#3B82F6" strokeWidth="1.5" />
                  <path d="M7 15H13" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                Compre com segurança
              </h3>
              <p
                style={{
                  color: "#A1A1AA",
                  lineHeight: "1.6",
                }}
              >
                Realize o pagamento de forma segura e receba seu ingresso digital instantaneamente.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "12px",
                  width: "120px",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  padding: "20px",
                }}
              >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M20 12H21M3 12H4M12 4V3M12 21V20M6.34315 6.34315L5.63604 5.63604M18.364 18.364L17.6569 17.6569M6.34315 17.6569L5.63604 18.364M18.364 5.63609L17.6569 6.34315"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                Aproveite o evento
              </h3>
              <p
                style={{
                  color: "#A1A1AA",
                  lineHeight: "1.6",
                }}
              >
                Apresente seu ingresso digital na entrada do evento e divirta-se!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer
        style={{
          backgroundColor: "#18181B",
          borderTop: "1px solid #27272A",
          padding: "64px 16px 32px",
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
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            {/* About Section */}
            <div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  color: "white",
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
                  marginBottom: "12px",
                }}
              >
                Nossa missão é conectar pessoas, que desejam revender seus ingressos devido a imprevistos, com
                compradores que procuram as melhores ofertas de última hora.
              </p>
              <p
                style={{
                  color: "#A1A1AA",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  marginBottom: "12px",
                }}
              >
                Seja bem bem vindo, seja feliz, seja ReTicket!
              </p>
            </div>

            {/* Quick Access */}
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  color: "white",
                }}
              >
                Acesso Rápido
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <a
                  href="#"
                  style={{
                    color: "#A1A1AA",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Como Funciona
                </a>
                <a
                  href="#"
                  style={{
                    color: "#A1A1AA",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Login
                </a>
                <a
                  href="#"
                  style={{
                    color: "#A1A1AA",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Termos de Uso
                </a>
                <a
                  href="#"
                  style={{
                    color: "#A1A1AA",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Política de Privacidade
                </a>
                <a
                  href="#"
                  style={{
                    color: "#A1A1AA",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Início
                </a>
              </div>
            </div>

            {/* Guarantee Section */}
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  color: "white",
                }}
              >
                Garantia ReTicket
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      marginTop: "4px",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 12L11 14L15 10M12 3L4 7V13C4 17.4183 7.58172 21 12 21C16.4183 21 20 17.4183 20 13V7L12 3Z"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "4px",
                      }}
                    >
                      Ingresso Garantido
                    </p>
                    <p
                      style={{
                        color: "#A1A1AA",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      Para o comprador: garantimos sua entrada ou seu dinheiro de volta.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      marginTop: "4px",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 12L11 14L15 10M12 3L4 7V13C4 17.4183 7.58172 21 12 21C16.4183 21 20 17.4183 20 13V7L12 3Z"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "4px",
                      }}
                    >
                      Pagamento Garantido
                    </p>
                    <p
                      style={{
                        color: "#A1A1AA",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      Para o vendedor: garantimos seu pagamento por ingressos válidos.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      marginTop: "4px",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "4px",
                      }}
                    >
                      Plataforma Confiável
                    </p>
                    <p
                      style={{
                        color: "#A1A1AA",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      Transações autenticadas, suporte humano e conformidade com as leis brasileiras.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  color: "white",
                }}
              >
                Redes Sociais
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <a
                  href="#"
                  style={{
                    backgroundColor: "#27272A",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  style={{
                    backgroundColor: "#27272A",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" />
                    <circle cx="18" cy="6" r="1" fill="white" />
                  </svg>
                </a>
                <a
                  href="#"
                  style={{
                    backgroundColor: "#27272A",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16135 5.19941C1.82072 5.55057 1.57879 5.98541 1.46 6.46C1.14521 8.20556 0.991235 9.97631 1 11.75C0.988687 13.537 1.14266 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17814 18.2945C2.51798 18.6308 2.93882 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0113 9.96295 22.8573 8.1787 22.54 6.42Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  style={{
                    backgroundColor: "#27272A",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22 4.01C21 4.5 20.02 4.69 19 5C17.879 3.735 16.217 3.665 14.62 4.263C13.023 4.861 11.977 6.323 12 8.01V9.01C8.755 9.083 5.865 7.605 4 5.01C4 5.01 -0.182 12.94 8 16.01C6.128 17.247 4.261 18.088 2 18.01C5.308 19.687 8.913 20.322 12.034 19.503C15.614 18.565 18.556 15.906 19.685 11.924C20.0218 10.6449 20.189 9.32679 20.182 8.01C20.18 7.858 20.176 7.707 20.168 7.556C21.037 6.662 21.614 5.458 22 4.01Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <p
            style={{
              color: "#71717A",
              fontSize: "12px",
              textAlign: "center",
              marginTop: "48px",
            }}
          >
            © 2023 ReTicket. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

interface EventCardProps {
  image: string;
  title: string;
  date: string;
  location: string;
  price: string;
  id: string;
  ticketCount: number;
}

function EventCard({ image, title, date, location, price, id, ticketCount }: EventCardProps) {
  // Function to format date for calendar display
  const formatDateForCalendar = (dateString: string) => {
    // Check if dateString is null or undefined
    if (!dateString) {
      return { day: "15", month: "JUN" }
    }
    
    // Extract the first date from ranges like "19-28 de Setembro, 2025"
    const dateMatch = dateString.match(/(\d{1,2})\s*(?:-\d{1,2})?\s*de\s*(\w+)/)
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0")
      const monthName = dateMatch[2]

      // Map Portuguese month names to abbreviations
      const monthMap: { [key: string]: string } = {
        Janeiro: "JAN",
        Fevereiro: "FEV",
        Março: "MAR",
        Abril: "ABR",
        Maio: "MAI",
        Junho: "JUN",
        Julho: "JUL",
        Agosto: "AGO",
        Setembro: "SET",
        Outubro: "OUT",
        Novembro: "NOV",
        Dezembro: "DEZ",
      }

      const monthAbbr = monthMap[monthName] || monthName.substring(0, 3).toUpperCase()
      return { day, month: monthAbbr }
    }

    // Fallback
    return { day: "15", month: "JUN" }
  }

  const { day, month } = formatDateForCalendar(date)

  return (
    <div
      style={{
        backgroundColor: "black",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <a
          href={`/event/${id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
        <div
          style={{
            position: "relative",
            paddingTop: "56.25%", // 16:9 aspect ratio
            backgroundColor: "#27272A",
          }}
        >
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Calendar Date Badge */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              padding: "8px",
              minWidth: "50px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1F2937",
                lineHeight: "1",
                marginBottom: "2px",
              }}
            >
              {day}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#3B82F6",
                lineHeight: "1",
              }}
            >
              {month}
            </div>
          </div>
        </div>
      </a>

      <div
        style={{
          padding: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "white",
          }}
        >
          {title}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
            color: "#A1A1AA",
            fontSize: "14px",
          }}
        >
          <MapPin size={16} style={{ marginRight: "8px" }} />
          <span>{location}</span>
        </div>

        {/* Add ticket count with icon - with more emphasis */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
            padding: "6px 10px",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            borderRadius: "6px",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: "10px", flexShrink: 0 }}
          >
            <path
              d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V10M22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10M22 10H2M9 14H15"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: "#3B82F6", fontWeight: "600", fontSize: "15px" }}>
            {ticketCount} ingressos disponíveis
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              color: "#3B82F6",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {price}
          </span>
        </div>

        {/* Buttons container */}
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <a
              href={`/event/${id}`}
              style={{
                textDecoration: "none",
                flex: "1",
              }}
            >
            <button
              style={{
                backgroundColor: "#3B82F6",
                border: "none",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
              }}
            >
              Ver Detalhes
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

// CategoryCard component with proper TypeScript types
function CategoryCard({ image, name, count }: { image: string; name: string; count: string }) {
  const router = useRouter()

  const handleCategoryClick = () => {
    router.push(`/search?category=${encodeURIComponent(name)}`)
  }

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
      onClick={handleCategoryClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)"
      }}
    >
      <div
        style={{
          paddingTop: "75%", // 4:3 aspect ratio
          position: "relative",
        }}
      >
        <img
          src={image}
          alt={name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "16px",
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            {name}
          </h3>
          <p
            style={{
              color: "#A1A1AA",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {count} eventos
          </p>
        </div>
      </div>
    </div>
  )
}

// LocationCard component with proper TypeScript types
function LocationCard({ image, name, count }: { image: string; name: string; count: string }) {
  const router = useRouter()

  const handleLocationClick = () => {
    router.push(`/search?location=${encodeURIComponent(name)}`)
  }

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
      onClick={handleLocationClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)"
      }}
    >
      <div
        style={{
          paddingTop: "75%", // 4:3 aspect ratio
          position: "relative",
        }}
      >
        <img
          src={image}
          alt={name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "16px",
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            {name}
          </h3>
          <p
            style={{
              color: "#A1A1AA",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {count} eventos
          </p>
        </div>
      </div>
    </div>
  )
}
