"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, AlertCircle } from "lucide-react"
import { eventsApi, transformEventForFrontend, Event } from "@/lib/api"

// Interface para eventos na página de venda
interface SellEvent {
  id: string
  title: string
  date: string
  location: string
  image: string
  ticket_count: number
}

// Ticket categories/types
const ticketCategories = [
  { id: "pista", name: "Pista", description: "Área em pé próxima ao palco" },
  { id: "pista-premium", name: "Pista Premium", description: "Área VIP em pé com bar exclusivo" },
  { id: "cadeira-inferior", name: "Cadeira Inferior", description: "Assentos numerados - setor inferior" },
  { id: "cadeira-superior", name: "Cadeira Superior", description: "Assentos numerados - setor superior" },
  { id: "camarote", name: "Camarote", description: "Área VIP com serviço completo" },
  { id: "backstage", name: "Backstage", description: "Acesso aos bastidores" },
]

// Contact validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '')
  // Brazilian phone: 10-11 digits (with area code)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

const validateWhatsApp = (whatsapp: string): boolean => {
  // Remove all non-numeric characters
  const cleanWhatsApp = whatsapp.replace(/\D/g, '')
  // WhatsApp: 10-13 digits (can include country code)
  return cleanWhatsApp.length >= 10 && cleanWhatsApp.length <= 13
}

const validateContactInfo = (contact: string): { isValid: boolean; message: string } => {
  const trimmedContact = contact.trim()
  
  if (!trimmedContact) {
    return { isValid: false, message: "Por favor, forneça informações de contato" }
  }
  
  // Check if it's an email
  if (trimmedContact.includes('@')) {
    if (validateEmail(trimmedContact)) {
      return { isValid: true, message: "" }
    } else {
      return { isValid: false, message: "Por favor, insira um email válido" }
    }
  }
  
  // Check if it's a phone/WhatsApp (contains only numbers, spaces, parentheses, hyphens, plus)
  const phonePattern = /^[\d\s\(\)\-\+]+$/
  if (phonePattern.test(trimmedContact)) {
    if (validatePhone(trimmedContact) || validateWhatsApp(trimmedContact)) {
      return { isValid: true, message: "" }
    } else {
      return { isValid: false, message: "Por favor, insira um telefone/WhatsApp válido (10-13 dígitos)" }
    }
  }
  
  return { isValid: false, message: "Por favor, insira um email, telefone ou WhatsApp válido" }
}

export default function SellTicketsPage() {
  const [isDesktop, setIsDesktop] = useState(false)
  const router = useRouter()

  // Events state
  const [availableEvents, setAvailableEvents] = useState<SellEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState("")

  // Form state
  const [selectedEvent, setSelectedEvent] = useState("")
  const [ticketCategory, setTicketCategory] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [description, setDescription] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [contactError, setContactError] = useState("")

  // Load events from API
  useEffect(() => {
    // Set desktop state after client mount to avoid hydration mismatch
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
    
    const loadEvents = async () => {
      try {
        setEventsLoading(true)
        setEventsError("")
        
        const apiEvents = await eventsApi.getAll()
        
        // Transform API events to SellEvent format
        const transformedEvents: SellEvent[] = apiEvents.map((event) => ({
          id: event.id.toString(),
          title: event.name,
          date: event.date,
          location: event.location,
          image: event.image || "/placeholder.svg",
          ticket_count: event.ticket_count
        }))
        
        setAvailableEvents(transformedEvents)
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
        setEventsError('Erro ao carregar eventos. Tente novamente.')
        setAvailableEvents([])
      } finally {
        setEventsLoading(false)
      }
    }
    
    loadEvents()
  }, [])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!selectedEvent) {
      setError("Por favor, selecione um evento")
      return
    }

    if (!ticketCategory) {
      setError("Por favor, selecione o tipo de ingresso")
      return
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Por favor, insira um preço válido")
      return
    }

    // Validate contact info with new validator
    const contactValidation = validateContactInfo(contactInfo)
    if (!contactValidation.isValid) {
      setError(contactValidation.message)
      return
    }

    // Simulate form submission
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push("/")
      }, 3000)
    }, 1500)
  }

  const selectedEventData = availableEvents.find((event) => event.id === selectedEvent)
  const selectedCategoryData = ticketCategories.find((cat) => cat.id === ticketCategory)

  if (success) {
    return (
      <div
        style={{
          backgroundColor: "black",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#18181B",
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Check size={40} color="#22C55E" />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#22C55E",
            }}
          >
            Ingresso Publicado com Sucesso!
          </h1>
          <p
            style={{
              color: "#A1A1AA",
              marginBottom: "24px",
              lineHeight: "1.6",
            }}
          >
            Seu ingresso foi publicado na plataforma. Você será redirecionado para a página inicial em alguns segundos.
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              backgroundColor: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px",
          borderBottom: "1px solid #333",
          backgroundColor: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #3B82F6",
              color: "#3B82F6",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Vender Ingressos
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "32px 16px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            backgroundColor: "#18181B",
            borderRadius: "12px",
            padding: "32px",
            border: "1px solid #27272A",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Publique seu ingresso
          </h2>
          <p
            style={{
              color: "#A1A1AA",
              marginBottom: "32px",
              lineHeight: "1.6",
            }}
          >
            Preencha as informações abaixo para publicar seu ingresso na plataforma ReTicket.
          </p>

          {error && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <AlertCircle size={20} color="#EF4444" />
              <span style={{ color: "#EF4444" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Events Loading/Error State */}
            {eventsLoading && (
              <div
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                <span style={{ color: "#3B82F6" }}>Carregando eventos...</span>
              </div>
            )}

            {eventsError && (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <AlertCircle size={20} color="#EF4444" />
                <span style={{ color: "#EF4444" }}>{eventsError}</span>
              </div>
            )}

            {/* Event Selection */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Selecione o Evento *
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={eventsLoading || availableEvents.length === 0}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: eventsLoading || availableEvents.length === 0 ? "#1F1F23" : "#27272A",
                  border: "1px solid #3F3F46",
                  borderRadius: "8px",
                  color: eventsLoading || availableEvents.length === 0 ? "#71717A" : "white",
                  fontSize: "16px",
                  outline: "none",
                  cursor: eventsLoading || availableEvents.length === 0 ? "not-allowed" : "pointer",
                }}
                required
              >
                <option value="">
                  {eventsLoading ? "Carregando..." : availableEvents.length === 0 ? "Nenhum evento disponível" : "Escolha um evento..."}
                </option>
                {availableEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {event.date} ({event.ticket_count} ingressos disponíveis)
                  </option>
                ))}
              </select>
            </div>

            {/* Event Preview */}
            {selectedEventData && (
              <div
                style={{
                  backgroundColor: "#27272A",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <img
                  src={selectedEventData.image || "/placeholder.svg"}
                  alt={selectedEventData.title}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    {selectedEventData.title}
                  </h3>
                  <p
                    style={{
                      color: "#A1A1AA",
                      fontSize: "14px",
                      marginBottom: "2px",
                    }}
                  >
                    {selectedEventData.date}
                  </p>
                  <p
                    style={{
                      color: "#A1A1AA",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    {selectedEventData.location}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: selectedEventData.ticket_count > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: selectedEventData.ticket_count > 0 ? "#22C55E" : "#EF4444",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {selectedEventData.ticket_count > 0 
                        ? `${selectedEventData.ticket_count} ingressos disponíveis`
                        : "Esgotado"
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket Category */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Tipo de Ingresso *
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#27272A",
                  border: "1px solid #3F3F46",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                }}
                required
              >
                <option value="">Escolha o tipo de ingresso...</option>
                {ticketCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} - {category.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Quantity */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "2fr 1fr" : "1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#27272A",
                    border: "1px solid #3F3F46",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                  }}
                  required
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Quantidade
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#27272A",
                    border: "1px solid #3F3F46",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} ingresso{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Descrição Adicional
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informações adicionais sobre o ingresso (setor, fila, observações, etc.)"
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#27272A",
                  border: "1px solid #3F3F46",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Contact Info */}
            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Informações de Contato *
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => {
                  const value = e.target.value
                  setContactInfo(value)
                  
                  // Real-time validation
                  if (value.trim()) {
                    const validation = validateContactInfo(value)
                    setContactError(validation.isValid ? "" : validation.message)
                  } else {
                    setContactError("")
                  }
                }}
                placeholder="WhatsApp, email ou telefone para contato"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#27272A",
                  border: "1px solid #3F3F46",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                }}
                required
              />
              <p
                style={{
                  color: "#A1A1AA",
                  fontSize: "14px",
                  marginTop: "8px",
                }}
              >
                Essas informações serão compartilhadas com compradores interessados.
              </p>
              {contactError && (
                <p
                  style={{
                    color: "#EF4444",
                    fontSize: "14px",
                    marginTop: "8px",
                  }}
                >
                  {contactError}
                </p>
              )}
            </div>

            {/* Summary */}
            {selectedEventData && selectedCategoryData && price && (
              <div
                style={{
                  backgroundColor: "#27272A",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "24px",
                  border: "1px solid #3B82F6",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    color: "#3B82F6",
                  }}
                >
                  Resumo da Publicação
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A1A1AA" }}>Evento:</span>
                    <span>{selectedEventData.title}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A1A1AA" }}>Tipo:</span>
                    <span>{selectedCategoryData.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A1A1AA" }}>Quantidade:</span>
                    <span>
                      {quantity} ingresso{Number(quantity) > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A1A1AA" }}>Preço unitário:</span>
                    <span style={{ color: "#3B82F6", fontWeight: "600" }}>R$ {Number(price).toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "8px",
                      borderTop: "1px solid #3F3F46",
                      marginTop: "8px",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>Total:</span>
                    <span style={{ color: "#3B82F6", fontWeight: "600", fontSize: "18px" }}>
                      R$ {(Number(price) * Number(quantity)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                backgroundColor: isSubmitting ? "#6B7280" : "#3B82F6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "16px",
                fontSize: "18px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {isSubmitting ? "Publicando..." : "Publicar Ingresso"}
            </button>
          </form>

          {/* Terms */}
          <p
            style={{
              color: "#71717A",
              fontSize: "14px",
              textAlign: "center",
              marginTop: "24px",
              lineHeight: "1.6",
            }}
          >
            Ao publicar seu ingresso, você concorda com nossos{" "}
            <a href="#" style={{ color: "#3B82F6", textDecoration: "none" }}>
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" style={{ color: "#3B82F6", textDecoration: "none" }}>
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
