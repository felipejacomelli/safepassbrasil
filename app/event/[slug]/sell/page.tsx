"use client"

import { useState, useEffect, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  LogOut,
  User
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { eventsApi, type ApiEvent, type ApiOccurrence } from "@/lib/api"
import { cn } from "@/lib/utils"

import useSWR from "swr"

// Fetcher function for API calls
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar dados")
    return res.json()
  })

export default function SellTicketPage({ params }: { params: Promise<{ slug: string }> }) {
  return <SellTicketPageClient params={params} />
}

function SellTicketPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [isDesktop, setIsDesktop] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  // Fetch event data from API based on slug
  const { data: eventData, error: fetchError, isLoading } = useSWR(
    `${baseUrl}/api/events/events/${resolvedParams.slug}/`,
    fetcher
  )

  // Find the event data based on the slug
  const event = eventData || null

  // State for form
  const [selectedOccurrence, setSelectedOccurrence] = useState("")
  const [ticketType, setTicketType] = useState("")
  const [price, setPrice] = useState("")

  // Get the selected occurrence object
  const currentOccurrence = event?.occurrences?.find((occ: any) => occ.id === selectedOccurrence)

  // Initialize form values from URL params after hydration
  useEffect(() => {
    // Set desktop state after client mount to avoid hydration mismatch
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
    
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get("type")
    const priceParam = urlParams.get("price")
    const occurrenceParam = urlParams.get("occurrence")
    
    if (typeParam) setTicketType(typeParam)
    if (priceParam) setPrice(priceParam)
    if (occurrenceParam) setSelectedOccurrence(occurrenceParam)
    
    // Auto-populate with first occurrence if not already set
    if (event && event.occurrences && event.occurrences.length > 0 && !selectedOccurrence && !occurrenceParam) {
      const firstOccurrence = event.occurrences[0]
      setSelectedOccurrence(firstOccurrence.id)
    }
  }, [event, selectedOccurrence])

  // Reset ticket type and price when occurrence changes
  useEffect(() => {
    if (currentOccurrence && currentOccurrence.ticket_types && currentOccurrence.ticket_types.length > 0) {
      // Reset ticket type selection when occurrence changes
      setTicketType("")
      setPrice("")
    }
  }, [selectedOccurrence])

  const [quantity, setQuantity] = useState("1")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState(false)

  // Handle logout with redirect to home page
  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError("")

    // Validate occurrence selection
    if (!selectedOccurrence) {
      setFormError("Por favor, selecione uma data/local do evento")
      return
    }

    // Validate ticket type
    if (!ticketType) {
      setFormError("Por favor, selecione um tipo de ingresso")
      return
    }

    // Validate price
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setFormError("Por favor, insira um preço válido")
      return
    }

    // Validate quantity
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setFormError("Por favor, insira uma quantidade válida")
      return
    }

    setIsSubmitting(true)

    try {
      // Check if event data is available
      if (!event) {
        setFormError("Evento não encontrado")
        setIsSubmitting(false)
        return
      }

      // Use the selected ticket type ID
      const selectedTicketTypeId = ticketType
      
      if (!selectedTicketTypeId) {
        setFormError("Nenhum tipo de ingresso selecionado")
        setIsSubmitting(false)
        return
      }

      // Call the create ticket API using the correct endpoint
       const response = await fetch(`${baseUrl}/api/tickets/`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
             'Authorization': `Token ${localStorage.getItem('authToken')}`
           })
         },
         body: JSON.stringify({
          ticket_type: selectedTicketTypeId,
          name: user?.name || 'Vendedor',
          quantity: Number(quantity),
          price: Number(price),
          owner: user?.id
        })
       })

       if (!response.ok) {
         // Try to parse as JSON first, fallback to text if it fails
         let errorData;
         const contentType = response.headers.get('content-type');
         
         if (contentType && contentType.includes('application/json')) {
           errorData = await response.json();
         } else {
           // If response is HTML or other format, create a generic error
           const textResponse = await response.text();
           console.error('Non-JSON response:', textResponse);
           errorData = { error: 'Erro de comunicação com o servidor' };
         }
         
         throw new Error(errorData.error || 'Erro ao anunciar ingresso')
       }

       // Parse response safely
       let result;
       try {
         result = await response.json();
         console.log('Ticket created successfully:', result);
       } catch (parseError) {
         console.error('Error parsing success response:', parseError);
         // Even if we can't parse the response, if response.ok is true, consider it successful
         result = { success: true };
       }

       // Se chegou até aqui e response.ok é true, significa que foi criado com sucesso
       setSuccess(true)
       // Redirect after success
       setTimeout(() => {
         router.push(`/event/${resolvedParams.slug}`)
       }, 3000)
     } catch (err) {
       console.error('Erro ao vender ingressos:', err)
       setFormError("Erro ao conectar com o servidor. Tente novamente.")
     } finally {
       setIsSubmitting(false)
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
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2 text-decoration-none"
            >
              <div className="bg-blue-600 p-1.5 rounded flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded" />
              </div>
              <span className="text-white text-xl font-bold">
                reticket
              </span>
            </a>

            {/* User Menu with Avatar and Logout */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-zinc-800">
                    <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-medium">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-zinc-800 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "24px 16px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            color: "#A1A1AA",
            fontSize: "14px",
          }}
        >
          <a
            href="/"
            style={{
              color: "#A1A1AA",
              textDecoration: "none",
            }}
          >
            Início
          </a>
          <span>›</span>
          <a
            href={`/event/${event?.slug || resolvedParams.slug}`}
            style={{
              color: "#A1A1AA",
              textDecoration: "none",
            }}
          >
            {event?.name || "Carregando..."}
          </a>
          <span>›</span>
          <span style={{ color: "#3B82F6" }}>Vender Ingressos</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1.5fr" : "1fr",
            gap: "32px",
          }}
        >
          {/* Event Info */}
          <div>
            <h1
              style={{
                fontSize: isDesktop ? "28px" : "24px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Vender Ingressos: {event?.name || "Carregando..."}
            </h1>

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
                src={event?.image || "/placeholder.svg"}
                alt={event?.name || "Evento"}
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

            {/* Event Details */}
            <div
              style={{
                backgroundColor: "#18181B",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  color: "#D4D4D8",
                }}
              >
                <span style={{ marginRight: "8px" }}>📅</span>
                <span>
                  {currentOccurrence?.start_at 
                    ? new Date(currentOccurrence.start_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      })
                    : selectedOccurrence 
                      ? "Data a definir"
                      : "Selecione uma data"
                  }
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  color: "#D4D4D8",
                }}
              >
                <span style={{ marginRight: "8px" }}>📍</span>
                <span>
                  {currentOccurrence 
                    ? `${currentOccurrence.city}, ${currentOccurrence.state} - ${currentOccurrence.uf}${currentOccurrence.venue ? ` - ${currentOccurrence.venue}` : ''}`
                    : selectedOccurrence 
                      ? "Local a definir"
                      : "Selecione um local"
                  }
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#D4D4D8",
                }}
              >
                <span style={{ marginRight: "8px" }}>⏰</span>
                <span>
                  {currentOccurrence?.start_at 
                    ? new Date(currentOccurrence.start_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : selectedOccurrence 
                      ? "Horário a definir"
                      : "Selecione um horário"
                  }
                  {currentOccurrence?.end_at 
                    ? ` - ${new Date(currentOccurrence.end_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`
                    : ""
                  }
                </span>
              </div>
            </div>

            {/* Seller Guidelines */}
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#3B82F6",
                }}
              >
                Dicas para vendedores
              </h3>
              <ul
                style={{
                  color: "#D4D4D8",
                  paddingLeft: "20px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                <li>Defina um preço justo para aumentar suas chances de venda</li>
                <li>Descreva detalhes importantes sobre o ingresso (setor, fileira, etc.)</li>
                <li>Responda rapidamente às perguntas dos compradores</li>
                <li>Você receberá o pagamento após a validação do ingresso</li>
              </ul>
            </div>
          </div>

          {/* Sell Form */}
          <div>
            {success ? (
              <div
                style={{
                  backgroundColor: "#18181B",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
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
                    margin: "0 auto 16px auto",
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
                  Ingresso publicado com sucesso!
                </h2>
                <p
                  style={{
                    color: "#A1A1AA",
                    marginBottom: "24px",
                  }}
                >
                  Seu ingresso para {event?.name || "este evento"} foi publicado e já está disponível para compradores.
                </p>
                <a
                  href={`/event/${event?.slug || resolvedParams.slug}`}
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
                  Voltar para o evento
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div
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
                      marginBottom: "24px",
                    }}
                  >
                    Detalhes do Ingresso
                  </h2>

                  {/* Occurrence Selection */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="occurrence"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Data e Local do Evento
                    </label>
                    <select
                      id="occurrence"
                      value={selectedOccurrence}
                      onChange={(e) => setSelectedOccurrence(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    >
                      <option value="">Selecione uma data e local</option>
                      {event?.occurrences?.map((occurrence: any) => (
                        <option key={occurrence.id} value={occurrence.id}>
                          {new Date(occurrence.start_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })} - {occurrence.city}, {occurrence.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ticket Type */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="ticket-type"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Tipo de Ingresso
                    </label>
                    <select
                      id="ticket-type"
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                      disabled={!selectedOccurrence}
                      style={{
                        width: "100%",
                        backgroundColor: selectedOccurrence ? "#27272A" : "#1A1A1A",
                        color: selectedOccurrence ? "white" : "#6B7280",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3F3F46",
                        fontSize: "16px",
                        cursor: selectedOccurrence ? "pointer" : "not-allowed",
                      }}
                    >
                      <option value="">
                        {selectedOccurrence ? "Selecione um tipo de ingresso" : "Primeiro selecione uma data e local"}
                      </option>
                      {currentOccurrence?.ticket_types?.map((ticketTypeOption: any) => (
                        <option key={ticketTypeOption.id} value={ticketTypeOption.id}>
                          {ticketTypeOption.name} - R$ {ticketTypeOption.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="price"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Preço (R$)
                    </label>
                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <input
                        id="price"
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0,00"
                        style={{
                          width: "100%",
                          backgroundColor: "#27272A",
                          color: "white",
                          padding: "12px 12px 12px 40px",
                          borderRadius: "8px",
                          border: "1px solid #3F3F46",
                          fontSize: "16px",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#A1A1AA",
                        }}
                      >
                        R$
                      </span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="quantity"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Quantidade
                    </label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Descrição (opcional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Adicione informações relevantes sobre o ingresso (setor, fileira, assento, etc.)"
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #3F3F46",
                        fontSize: "16px",
                        minHeight: "120px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>

                {/* Upload Section */}
                <div
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
                    Comprovante do Ingresso
                  </h2>
                  <p
                    style={{
                      color: "#A1A1AA",
                      marginBottom: "16px",
                      fontSize: "14px",
                    }}
                  >
                    Faça upload de uma foto ou PDF do seu ingresso para verificação. Não se preocupe, ocultaremos
                    informações sensíveis como códigos de barras e QR codes.
                  </p>
                  <div
                    style={{
                      border: "2px dashed #3F3F46",
                      borderRadius: "8px",
                      padding: "32px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ margin: "0 auto 16px auto" }}
                    >
                      <path d="M7 16.2V14.2H17V16.2H7ZM7 11.5V9.5H17V11.5H7ZM7 6.8V4.8H17V6.8H7Z" fill="#A1A1AA" />
                      <path
                        d="M3 20.5V3.5C3 2.4 3.9 1.5 5 1.5H19C20.1 1.5 21 2.4 21 3.5V20.5C21 21.6 20.1 22.5 19 22.5H5C3.9 22.5 3 21.6 3 20.5ZM5 20.5H19V3.5H5V20.5Z"
                        fill="#A1A1AA"
                      />
                    </svg>
                    <p
                      style={{
                        color: "#A1A1AA",
                        marginBottom: "8px",
                      }}
                    >
                      Arraste e solte arquivos aqui ou
                    </p>
                    <button
                      type="button"
                      style={{
                        backgroundColor: "#27272A",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Selecionar Arquivo
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      style={{
                        marginTop: "4px",
                      }}
                      required
                    />
                    <label
                      htmlFor="terms"
                      style={{
                        color: "#D4D4D8",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      Eu confirmo que sou o proprietário legítimo deste ingresso e concordo com os{" "}
                      <a
                        href="#"
                        style={{
                          color: "#3B82F6",
                          textDecoration: "none",
                        }}
                      >
                        Termos e Condições
                      </a>{" "}
                      e{" "}
                      <a
                        href="#"
                        style={{
                          color: "#3B82F6",
                          textDecoration: "none",
                        }}
                      >
                        Política de Privacidade
                      </a>{" "}
                      da ReTicket.
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {formError && (
                  <div
                    style={{
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      color: "#EF4444",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                    }}
                  >
                    {formError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "black",
                    border: "none",
                    borderRadius: "8px",
                    padding: "16px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    width: "100%",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Publicando..." : "Publicar Ingresso"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#18181B",
          borderTop: "1px solid #27272A",
          padding: "32px 16px",
          marginTop: "auto",
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

// Mock event data (same as in other files) - moved to avoid duplication
