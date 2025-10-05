"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, AlertCircle, Plus, Minus } from "lucide-react"
import { eventsApi, transformEventForFrontend, Event } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/Header"

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
  const { user, isAuthenticated, isLoading } = useAuth()

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
  
  // Proof upload state
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Se o usuário não está autenticado e não está carregando,
      // redireciona para a página inicial (logout) ou login (acesso direto)
      const wasAuthenticated = localStorage.getItem('user') !== null
      
      if (wasAuthenticated) {
        // Se havia dados de usuário mas agora não está autenticado, foi logout
        router.push('/')
      } else {
        // Se nunca houve dados de usuário, é acesso direto - vai para login
        router.push('/login?redirect=/sell')
      }
      return
    }
  }, [isAuthenticated, isLoading, router])

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
  const handleSubmit = async (e: React.FormEvent) => {
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

    // Submit to API
    setIsSubmitting(true)

    try {
      const selectedCategoryData = ticketCategories.find((cat) => cat.id === ticketCategory)
      
      const result = await eventsApi.sellTickets(selectedEvent, {
        quantity: parseInt(quantity),
        price: parseFloat(price),
        ticket_type: selectedCategoryData?.name || 'Geral',
        description: description || ''
      })

      if (result.success) {
        setSuccess(true)
        
        // Update the event's ticket count in local state
        setAvailableEvents(prev => 
          prev.map(event => 
            event.id === selectedEvent 
              ? { ...event, ticket_count: result.total_tickets || event.ticket_count + parseInt(quantity) }
              : event
          )
        )

        // Success - let user decide when to navigate
      } else {
        setError(result.message || "Erro ao publicar ingresso")
      }
    } catch (err) {
      console.error('Erro ao publicar ingresso:', err)
      setError("Erro ao conectar com o servidor. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
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
            Seu ingresso foi publicado na plataforma e já está disponível para compra pelos usuários.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setSuccess(false)
                setSelectedEvent("")
                setTicketCategory("")
                setPrice("")
                setQuantity("1")
                setDescription("")
                setContactInfo("")
              }}
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
              Publicar Outro Ingresso
            </button>
            <button
              onClick={() => router.push("/")}
              style={{
                backgroundColor: "#6B7280",
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
      </div>
    )
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "black",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid #3B82F6",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          ></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, não renderiza nada (será redirecionado)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <Header />

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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "#27272A",
                    border: "1px solid #3F3F46",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                       const newQuantity = Math.max(1, parseInt(quantity) - 1).toString()
                       setQuantity(newQuantity)
                     }}
                    disabled={parseInt(quantity) <= 1}
                    style={{
                      backgroundColor: parseInt(quantity) <= 1 ? "#1F1F23" : "#3F3F46",
                      border: "none",
                      color: parseInt(quantity) <= 1 ? "#71717A" : "white",
                      width: "32px",
                      height: "32px",
                      borderRadius: "4px",
                      cursor: parseInt(quantity) <= 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span
                    style={{
                      minWidth: "40px",
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "white",
                    }}
                  >
                    {quantity} ingresso{parseInt(quantity) > 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                       const newQuantity = Math.min(8, parseInt(quantity) + 1).toString()
                       setQuantity(newQuantity)
                     }}
                    disabled={parseInt(quantity) >= 8}
                    style={{
                      backgroundColor: parseInt(quantity) >= 8 ? "#1F1F23" : "#3F3F46",
                      border: "none",
                      color: parseInt(quantity) >= 8 ? "#71717A" : "white",
                      width: "32px",
                      height: "32px",
                      borderRadius: "4px",
                      cursor: parseInt(quantity) >= 8 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
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
                onClick={() => document.getElementById("proof-upload")?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = "#3B82F6"
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = "#3F3F46"
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = "#3F3F46"
                  const files = e.dataTransfer.files
                  if (files.length > 0) {
                    const file = files[0]
                    if (file.type.startsWith("image/") || file.type === "application/pdf") {
                      setProofFile(file)
                      if (file.type.startsWith("image/")) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setProofPreview(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      } else {
                        setProofPreview(null)
                      }
                    }
                  }
                }}
              >
                {proofFile ? (
                  <div style={{ position: "relative" }}>
                    {proofPreview ? (
                      <img
                        src={proofPreview}
                        alt="Preview do comprovante"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          margin: "0 auto",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 16.2V14.2H17V16.2H7ZM7 11.5V9.5H17V11.5H7ZM7 6.8V4.8H17V6.8H7Z" fill="#A1A1AA" />
                          <path
                            d="M3 20.5V3.5C3 2.4 3.9 1.5 5 1.5H19C20.1 1.5 21 2.4 21 3.5V20.5C21 21.6 20.1 22.5 19 22.5H5C3.9 22.5 3 21.6 3 20.5ZM5 20.5H19V3.5H5V20.5Z"
                            fill="#A1A1AA"
                          />
                        </svg>
                        <p style={{ color: "#A1A1AA", margin: 0 }}>
                          {proofFile.name}
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setProofFile(null)
                        setProofPreview(null)
                      }}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
              
              <input
                id="proof-upload"
                type="file"
                accept="image/*,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setProofFile(file)
                    if (file.type.startsWith("image/")) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setProofPreview(e.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    } else {
                      setProofPreview(null)
                    }
                  }
                }}
              />
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
