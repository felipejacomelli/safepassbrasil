"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useData } from "@/contexts/data-context"
import { EventCard } from "@/app/page"

// Função para buscar contadores dinâmicos das categorias
const fetchCategoryCounts = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/counts/`)
    if (!response.ok) {
      throw new Error('Falha ao buscar contadores de categorias')
    }
    const data = await response.json()
    
    // Verificar se data é um array ou se tem uma propriedade que contém o array
    const categories = Array.isArray(data) ? data : (data.categories || [])
    
    // Mapear os dados da API para o formato esperado pelo frontend
    return categories.map((item: ApiCategoryItem) => ({
      name: item.name,
      count: item.event_count.toString(),
      image: getCategoryImage(item.name)
    }))
  } catch (error) {
    console.error('Erro ao buscar contadores de categorias:', error)
    return []
  }
}

// Função para buscar localizações dinâmicas
const fetchLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/locations/counts/`)
    if (!response.ok) {
      throw new Error('Falha ao buscar localizações')
    }
    const data = await response.json()
    
    // Mapear os dados da API para o formato esperado pelo frontend
    return data.map((item: ApiLocationItem) => ({
      name: item.name,
      count: item.event_count.toString(),
      image: item.image || getLocationImage(item.name)
    }))
  } catch (error) {
    console.error('Erro ao buscar localizações:', error)
    return []
  }
}

// Função auxiliar para obter imagem da categoria
const getCategoryImage = (categoryName: string): string => {
  const imageMap: { [key: string]: string } = {
    'Música': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60',
    'Esportes': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=60',
    'Teatro': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=60',
    'Festivais': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60',
    'Música Eletrônica': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=60'
  }
  return imageMap[categoryName] || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60'
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

// Interfaces
// Interfaces para tipos da API
interface ApiCategoryItem {
  name: string
  event_count: number
}

interface ApiLocationItem {
  name: string
  event_count: number
  image?: string
}

interface ApiEvent {
  id: string
  image: string
  image_url?: string
  title: string
  description?: string
  date: string
  location: string
  price: string
  slug: string
  category: string
  category_name?: string
  category_slug: string
  city: string
  ticket_count: number
  total_available_tickets?: number
  occurrences?: Array<{
    venue_city_slug?: string
    venue?: {
      city?: string
    }
  }>
}

interface ApiCategory {
  name: string
  slug: string
}

interface ApiLocation {
  name: string
  slug: string
}

interface Event {
  id: string
  image: string
  title: string
  date: string
  location: string
  price: string
  slug: string
  category: string
  city: string
  ticket_count: number
}

interface Category {
  name: string
  count: string
  image: string
}

interface Location {
  name: string
  count: string
  image: string
}

interface SearchResults {
  events: Event[]
  categories: Category[]
  locations: Location[]
  query: string
  categoryFilter: string
  locationFilter: string
}







export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const categoryFilter = searchParams.get('category') || ''
  const locationFilter = searchParams.get('location') || ''
  const dateFilter = searchParams.get('date') || ''
  const [isDesktop, setIsDesktop] = useState(false)

  const { events, categories, locations, isLoading, error } = useData()

  useEffect(() => {
    // Set desktop state after client mount to avoid hydration mismatch
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
  }, [])
  
  // Filter events, categories, and locations based on search parameters
  const { filteredEvents, filteredCategories, filteredLocations } = useMemo(() => {

    if (!events || !categories || !locations) return {
      filteredEvents: [],
      filteredCategories: [],
      filteredLocations: []
    }

    // Filter events based on search query and category
    const filteredEvts = events.filter((event) => {
      // Convert category name to slug for comparison (lowercase and replace spaces with hyphens)
      console.log('categoryFilter: ', categoryFilter);
      const eventCategorySlug = event.category.toLowerCase().replace(/\s+/g, '-')
      console.log('eventCategorySlug: ', eventCategorySlug);

      if (categoryFilter && eventCategorySlug !== categoryFilter) return false
      if (query && !event.title.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })

    // Filter categories based on search query
    const filteredCats = categories.filter((category) => {
      if (categoryFilter && category.slug !== categoryFilter) return false
      if (query && !category.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })

    // Filter locations based on search query
    const filteredLocs = locations.filter((location) => {
      if (locationFilter && location.uf !== locationFilter) return false
      if (query && !location.state.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })

    return {
      filteredEvents: filteredEvts,
      filteredCategories: filteredCats,
      filteredLocations: filteredLocs
    }
  }, [events, categories, locations, query, categoryFilter, locationFilter])

  // Determine the title based on filters
  const getSearchTitle = () => {
    if (categoryFilter) {
      return `Eventos de ${categoryFilter}`
    } else if (locationFilter) {
      return `Eventos em ${locationFilter}`
    } else if (query) {
      return `Resultados para "${query}"`
    } else {
      return "Todos os eventos"
    }
  }

  // Transform event data to match EventCard component expectations
  const transformEventForCard = (event: any) => {
    return {
      ...event,
      name: event.name || event.title, // EventCard expects 'name', use event.name or fallback to title
      total_available_tickets: event.ticket_count
    }
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
            >
              Acessar
            </button>
          </nav>
        </div>
      </header>

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: "#18181B",
          padding: "24px 16px",
          borderBottom: "1px solid #333",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <form
            action="/search"
            method="get"
            style={{
              width: "100%",
              position: "relative",
            }}
          >
            <input
              type="search"
              name="q"
              placeholder="Busque por evento, categoria ou palavra-chave"
              defaultValue={query}
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
            <button
              type="submit"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "#3B82F6",
                border: "none",
                color: "black",
                borderRadius: "4px",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Buscar
            </button>

            {/* Hidden inputs to preserve filters when searching */}
            {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
            {locationFilter && <input type="hidden" name="location" value={locationFilter} />}
          </form>
        </div>
      </div>

      {/* Filter Chips */}
      {(categoryFilter || locationFilter) && (
        <div
          style={{
            backgroundColor: "#18181B",
            padding: "0 16px 16px 16px",
            borderBottom: "1px solid #333",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {categoryFilter && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "16px",
                  padding: "4px 12px",
                }}
              >
                <span style={{ marginRight: "8px" }}>Categoria: {categoryFilter}</span>
                <a
                  href={
                    locationFilter
                      ? `/search?location=${encodeURIComponent(locationFilter)}${query ? `&q=${encodeURIComponent(query)}` : ""}`
                      : `/search${query ? `?q=${encodeURIComponent(query)}` : ""}`
                  }
                  style={{
                    color: "#3B82F6",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </a>
              </div>
            )}

            {locationFilter && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "16px",
                  padding: "4px 12px",
                }}
              >
                <span style={{ marginRight: "8px" }}>Local: {locationFilter}</span>
                <a
                  href={
                    categoryFilter
                      ? `/search?category=${encodeURIComponent(categoryFilter)}${query ? `&q=${encodeURIComponent(query)}` : ""}`
                      : `/search${query ? `?q=${encodeURIComponent(query)}` : ""}`
                  }
                  style={{
                    color: "#3B82F6",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </a>
              </div>
            )}

            {(categoryFilter || locationFilter) && (
              <a
                href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
                style={{
                  color: "#3B82F6",
                  textDecoration: "none",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Limpar todos os filtros
              </a>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      <main
        style={{
          padding: "48px 16px",
          backgroundColor: "#18181B",
          flex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {getSearchTitle()}
          </h1>

          {isLoading ? (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              padding: "40px",
              color: "#A1A1AA" 
            }}>
              <div style={{ marginRight: "12px" }}>🔄</div>
              <span>Carregando eventos...</span>
            </div>
          ) : error ? (
            <div style={{ 
              padding: "20px", 
              backgroundColor: "#7F1D1D", 
              borderRadius: "8px", 
              marginBottom: "32px",
              color: "#FEF2F2" 
            }}>
              <div style={{ marginBottom: "8px", fontWeight: "600" }}>⚠️ Erro ao carregar eventos</div>
              <div>Erro ao carregar eventos. Tente novamente.</div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <p style={{ color: "#A1A1AA", marginBottom: "32px" }}>
              Nenhum resultado encontrado. Tente outra busca ou remova os filtros.
            </p>
          ) : (
            <p style={{ color: "#A1A1AA", marginBottom: "32px" }}>
              Encontramos {filteredEvents.length} eventos.
            </p>
          )}

          {filteredEvents.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              {filteredEvents.map((event: Event, index: number) => (
                <EventCard key={`search-event-${event.id}`} event={transformEventForCard(event)} />
              ))}
            </div>
          )}

          {!categoryFilter && !locationFilter && query && filteredCategories.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  marginTop: "24px",
                }}
              >
                Categorias ({filteredCategories.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {filteredCategories.map((category) => (
                  <a
                    key={`search-category-${category.name}`}
                    href={`/search?category=${encodeURIComponent(category.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        aspectRatio: "1/1",
                      }}
                    >
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
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
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
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
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                        >
                          {category.name}
                        </h3>
                        <p
                          style={{
                            color: "#A1A1AA",
                            fontSize: "14px",
                          }}
                        >
                          {category.event_count || 0} eventos
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}

          {!categoryFilter && !locationFilter && query && filteredLocations.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  marginTop: "24px",
                }}
              >
                Localizações ({filteredLocations.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {filteredLocations.map((location) => (
                  <a
                    key={`search-location-${location.state}`}
                    href={`/search?location=${encodeURIComponent(location.uf)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        aspectRatio: "1/1",
                      }}
                    >
                      <img
                        src="/placeholder.svg"
                        alt={location.state}
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
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
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
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                        >
                          {location.state}
                        </h3>
                        <p
                          style={{
                            color: "#A1A1AA",
                            fontSize: "14px",
                          }}
                        >
                          {location.event_count || 0} eventos
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer Section */}
      <footer
        style={{
          backgroundColor: "#18181B",
          borderTop: "1px solid #27272A",
          padding: "64px 16px 32px",
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
              gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(1, 1fr)",
              gap: "32px",
            }}
          >
            {/* About Section */}
            <div>
              <h3
                style={{
                  fontSize: "18px",
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
                      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16134 5.19859C1.8207 5.54894 1.57884 5.98378 1.46 6.46C1 6.66 1 12.34 1 12.34C1 12.34 1 18.14 1.46 18.34C1.57884 18.8162 1.8207 19.2511 2.16134 19.6014C2.50198 19.9518 2.92925 20.2068 3.4 20.34C5.12 20.8 12 20.8 12 20.8C12 20.8 18.88 20.8 20.6 20.34C21.0708 20.2068 21.498 19.9518 21.8387 19.6014C22.1793 19.2511 22.4212 18.8162 22.54 18.34C23 18.14 23 12.34 23 12.34C23 12.34 23 6.66 22.54 6.42Z"
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
              </div>
              <p
                style={{
                  color: "#A1A1AA",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                © 2023 ReTicket. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
