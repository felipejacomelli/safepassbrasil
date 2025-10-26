"use client"

import { useEffect, useState, use } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MapPin, Users, Ticket, Info, Camera, Plus, Minus, ChevronRight, ShoppingCart } from "lucide-react"
import { eventsApi, occurrencesApi, ApiEventWithOccurrences, ApiOccurrenceWithTickets, ApiTicketType } from "@/lib/api"
import Header from "@/components/Header"

// Interfaces atualizadas para usar os dados reais da API
interface TicketType {
  id: string
  name: string
  price: number
  available: number
  description?: string
  max_per_order?: number
  type?: 'official' | 'individual'
  ticket_type_id?: string
  ticket_id?: string
  owner?: string
}

interface EventData {
  id: string // Corrigido de number para string
  slug: string
  title: string
  date: string
  time: string
  location: string
  attendance: string
  price: string
  startingPrice: number
  availableTickets: number
  ticketTypes: TicketType[]
  image: string
  description: string[]
  gallery: string[]
  occurrenceId?: string // ID da occurrence específica
}

interface TicketQuantities {
  [key: string]: number
}

interface CartTicket {
  id: string
  eventId: string
  eventName: string
  ticketTypeName: string
  price: number
  quantity: number
  date: string
  location: string
  image: string
  description: string[]
  time: string
  attendance: string
  gallery: string[]
  occurrenceId?: string  // ✅ ADICIONADO
  ticketTypeId?: string  // ✅ ADICIONADO
  ticketType?: 'official' | 'individual'  // ✅ ADICIONADO - Tipo do ticket
  individualTicketId?: string  // ✅ ADICIONADO - ID do ticket individual
}

// Função utilitária para encontrar occurrence baseada no parâmetro city-date
function findOccurrenceByCityDate(occurrences: any[], cityDate: string) {
  if (!occurrences || occurrences.length === 0) {
    return null;
  }

  // Parse do parâmetro city-date (formato: "cidade-dd-mm-yyyy")
  // Exemplo: "belém-10-11-2025"
  const parts = cityDate.split('-');
  if (parts.length < 4) {
    // Se não conseguir fazer parse, retorna a primeira occurrence
    return occurrences[0];
  }

  // Extrair cidade (pode ter hífens no nome)
  const cityPart = parts.slice(0, -3).join('-').toLowerCase();
  const day = parts[parts.length - 3];
  const month = parts[parts.length - 2];
  const year = parts[parts.length - 1];

  // Construir data no formato ISO
  const targetDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  // Buscar occurrence que corresponda à cidade e data
  const matchingOccurrence = occurrences.find(occurrence => {
    const occurrenceDate = new Date(occurrence.start_at).toISOString().split('T')[0];
    const occurrenceCity = occurrence.city?.toLowerCase().replace(/\s+/g, '-') || '';
    
    return occurrenceDate === targetDate && occurrenceCity === cityPart;
  });

  // Se não encontrar correspondência exata, tentar apenas por data
  if (!matchingOccurrence) {
    const dateOnlyMatch = occurrences.find(occurrence => {
      const occurrenceDate = new Date(occurrence.start_at).toISOString().split('T')[0];
      return occurrenceDate === targetDate;
    });
    
    if (dateOnlyMatch) {
      return dateOnlyMatch;
    }
  }

  // Se ainda não encontrar, retornar a primeira occurrence
  return matchingOccurrence || occurrences[0];
}

// Página de detalhes do evento - integrada com API real

export default function EventPage({ params }: { params: Promise<{ slug: string, "city-date": string }> }) {
  const { slug, "city-date": cityDate } = use(params)
  const [isDesktop, setIsDesktop] = useState(false)
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>({})

  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    // Set desktop state after client mount to avoid hydration mismatch
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
    
    const fetchEventAndOccurrence = async () => {
      try {
        setLoading(true);
        
        // Primeiro, buscar o evento com suas occurrences
        const apiEventWithOccurrences: ApiEventWithOccurrences = await eventsApi.getBySlug(slug);
        
        // Encontrar a occurrence específica baseada no city-date
        const targetOccurrence = findOccurrenceByCityDate(apiEventWithOccurrences.occurrences, cityDate);
        
        if (!targetOccurrence) {
          setNotFound(true);
          return;
        }
        
        // Buscar todos os tickets disponíveis (oficiais + individuais) ordenados por preço
        const allAvailableTickets = await occurrencesApi.getAllAvailableTickets(targetOccurrence.id);
        
        // Transformar dados da API para o formato esperado
        const transformedEvent: EventData = {
          id: apiEventWithOccurrences.id,
          slug: apiEventWithOccurrences.slug,
          title: apiEventWithOccurrences.name,
          date: new Date(targetOccurrence.start_at).toLocaleDateString('pt-BR'),
          time: new Date(targetOccurrence.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          location: `${targetOccurrence.city || ''}, ${targetOccurrence.state || apiEventWithOccurrences.location}`.trim(),
          attendance: targetOccurrence.max_capacity ? `${targetOccurrence.max_capacity} pessoas` : '1k+ pessoas',
          price: `A partir de R$ ${allAvailableTickets.min_price.toFixed(2).replace('.', ',')}`,
          startingPrice: allAvailableTickets.min_price,
          availableTickets: allAvailableTickets.total_available,
         ticketTypes: allAvailableTickets.tickets.map((ticket: any) => ({
           id: ticket.id,
           name: ticket.name,
           price: ticket.price,
           available: ticket.available,
           description: ticket.description,
           type: ticket.type,
           ticket_type_id: ticket.ticket_type_id,
           ticket_id: ticket.ticket_id,
           owner: ticket.owner,
           max_per_order: 1 // Todos os tickets individuais limitam a 1
         })),
          image: apiEventWithOccurrences.image || '/placeholder.svg',
          description: [apiEventWithOccurrences.description || 'Descrição não disponível'],
          gallery: [apiEventWithOccurrences.image || '/placeholder.svg'],
          occurrenceId: targetOccurrence.id
        };
        
        setEvent(transformedEvent);
        setNotFound(false);
        
        // Initialize ticket quantities
        const initialQuantities: TicketQuantities = {};
        transformedEvent.ticketTypes.forEach((ticket: TicketType) => {
          initialQuantities[ticket.id] = 1;
        });
        setTicketQuantities(initialQuantities);
      } catch (error) {
        console.error('Erro ao buscar evento:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventAndOccurrence();
  }, [slug, cityDate])



  const updateTicketQuantity = (ticketId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setTicketQuantities((prev: TicketQuantities) => ({
      ...prev,
      [ticketId]: newQuantity,
    }))
  }

  const addToCart = (ticketType: TicketType) => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      // Redirecionar para login com returnUrl como query parameter
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`
      return
    }

    if (!event) return
    
    const quantity = ticketQuantities[ticketType.id] || 1

    const ticket: CartTicket = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: event.id.toString(),
      eventName: event.title,
      ticketTypeName: ticketType.name,
      price: ticketType.price,
      quantity: quantity,
      date: event.date,
      location: event.location,
      image: event.image,
      description: event.description,
      time: event.time,
      attendance: event.attendance,
      gallery: event.gallery || [],
      occurrenceId: event.occurrenceId,  // ✅ ADICIONADO - ID da ocorrência
      ticketTypeId: ticketType.ticket_type_id || ticketType.id,  // ✅ ADICIONADO - ID do ticket type (template)
      ticketType: 'individual',  // ✅ TODOS são individuais agora
      individualTicketId: ticketType.ticket_id,  // ✅ ADICIONADO - ID do ticket individual
    }

    // Get existing cart or create new one
    let cart: CartTicket[] = []
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

  const handleSellTicket = () => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      // Redirecionar para login com returnUrl como query parameter
      const sellUrl = `/event/${event?.slug}/sell`
      window.location.href = `/login?returnUrl=${encodeURIComponent(sellUrl)}`
      return
    }

    // Se autenticado, navegar para a página de venda
    window.location.href = `/event/${event?.slug}/sell`
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

  if (!event) {
    return null
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
      {/* Header */}
      <Header />

      {/* Event Details */}
      <main
        style={{
          padding: "24px 16px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
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
            Eventos
          </a>
          <ChevronRight size={16} />
          <span style={{ color: "#D4D4D8", fontWeight: "500" }}>
            {event.title}
          </span>
        </nav>

        {/* Event Header */}
        <h1
          style={{
            fontSize: isDesktop ? "32px" : "24px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {event.title}
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
            <Calendar size={16} />
            <span>{event.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={16} />
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
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      {ticketType.available}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
                      {ticketType.name}
                      <span style={{ 
                        fontSize: "12px", 
                        fontWeight: "400", 
                        color: "#6B7280", 
                        marginLeft: "8px" 
                      }}>
                        (Revenda)
                      </span>
                    </h4>
                    <p style={{ fontSize: "18px", fontWeight: "bold", color: "#3B82F6" }}>
                      R$ {ticketType.price.toFixed(2).replace(".", ",")}
                    </p>
                    {ticketType.description && (
                      <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                        {ticketType.description}
                      </p>
                    )}
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
              onClick={handleSellTicket}
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
              Safe Pass é uma plataforma confiável para compra e venda de ingressos diretamente entre fãs.
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
            © 2023 Safe Pass. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}