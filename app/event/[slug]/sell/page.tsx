"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { eventsApi } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

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

export default function SellTicketPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [isDesktop, setIsDesktop] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  // State for form
  const [ticketType, setTicketType] = useState("pista-premium")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [description, setDescription] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [contactError, setContactError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // Proof upload state
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)

  // Verificar autenticação
  useEffect(() => {
    console.log('🔍 Verificação de autenticação:', {
      isLoading,
      isAuthenticated,
      user: !!user,
      userName: user?.name
    })
    
    // Aguardar o loading terminar antes de tomar qualquer decisão
    if (isLoading) {
      console.log('⏳ Ainda carregando contexto de autenticação...')
      return
    }
    
    // Só redireciona se não está carregando E não está autenticado
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, redirecionando para login')
      router.push(`/login?redirect=/event/${resolvedParams.slug}/sell`)
      return
    }
    
    console.log('✅ Usuário autenticado:', user?.name)
  }, [isAuthenticated, isLoading, router, resolvedParams.slug, user])

  // Initialize form values from URL params after hydration
  useEffect(() => {
    // Set desktop state after client mount to avoid hydration mismatch
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
    
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get("type")
    const priceParam = urlParams.get("price")
    
    if (typeParam) setTicketType(typeParam)
    if (priceParam) setPrice(priceParam)

    // Fetch event data from API
    const fetchEvent = async () => {
      try {
        const eventData = await eventsApi.getBySlug(resolvedParams.slug)
        setEvent(eventData)
      } catch (error) {
        console.error("Error fetching event:", error)
        // If event not found, redirect to 404 or events page
        router.push("/events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [resolvedParams.slug, router])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    // Validate price
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Por favor, insira um preço válido")
      return
    }

    // Validate quantity
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError("Por favor, insira uma quantidade válida")
      return
    }

    // Validate contact info with new validator
    const contactValidation = validateContactInfo(contactInfo)
    if (!contactValidation.isValid) {
      setError(contactValidation.message)
      return
    }

    if (!event) {
      setError("Evento não encontrado")
      return
    }

    setIsSubmitting(true)

    try {
      // Call the sell tickets API using the event ID from the API
      const result = await eventsApi.sellTickets(event.id, {
        quantity: Number(quantity),
        price: Number(price),
        ticket_type: ticketType,
        description: description
      })

      if (result.success) {
        setSuccess(true)
        // Success - let user decide when to navigate
      } else {
        setError(result.message || "Erro ao publicar ingresso")
      }
    } catch (err) {
      console.error('Erro ao vender ingressos:', err)
      setError("Erro ao conectar com o servidor. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (loading) {
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
          <div style={{ fontSize: "18px", marginBottom: "16px" }}>
            Carregando evento...
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #333",
              borderTop: "3px solid #fff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
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

  // Show error if event not found
  if (!event) {
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
          <div style={{ fontSize: "18px", marginBottom: "16px" }}>
            Evento não encontrado
          </div>
          <button
            onClick={() => router.push("/events")}
            style={{
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Voltar aos eventos
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
            
            {/* Renderização condicional baseada no estado de autenticação */}
            {isAuthenticated && user ? (
              // Usuário logado - mostrar menu do usuário
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => router.push("/account")}
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
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#3B82F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </button>
              </div>
            ) : (
              // Usuário não logado - mostrar botões de Cadastrar/Acessar
              <>
                <button
                  onClick={() => router.push("/register")}
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
                  onClick={() => router.push("/login")}
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
            href={`/event/${event.slug}`}
            style={{
              color: "#A1A1AA",
              textDecoration: "none",
            }}
          >
            {event.title}
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
              Vender Ingressos: {event.title}
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
                <span>{event.date}</span>
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
                <span>{event.location}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#D4D4D8",
                }}
              >
                <span style={{ marginRight: "8px" }}>⏰</span>
                <span>{event.time || "19:00 - 23:00"}</span>
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
                  padding: "48px",
                  textAlign: "center",
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
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                      setTicketType("pista-premium")
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
                    onClick={() => router.push(`/event/${resolvedParams.slug}`)}
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
                    Voltar ao Evento
                  </button>
                </div>
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
                      <option value="pista-premium">Pista Premium</option>
                      <option value="pista">Pista</option>
                      <option value="cadeira-inferior">Cadeira Inferior</option>
                      <option value="cadeira-superior">Cadeira Superior</option>
                      <option value="camarote">Camarote</option>
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
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
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

                  {/* Contact Information */}
                  <div>
                    <label
                      htmlFor="contact"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Informações de Contato *
                    </label>
                    <input
                      id="contact"
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
                      placeholder="Email, telefone ou WhatsApp para contato"
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: `1px solid ${contactError ? "#EF4444" : "#3F3F46"}`,
                        fontSize: "16px",
                      }}
                      required
                    />
                    {contactError && (
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {contactError}
                      </p>
                    )}
                    <p
                      style={{
                        color: "#A1A1AA",
                        fontSize: "14px",
                        marginTop: "4px",
                      }}
                    >
                      Essas informações serão compartilhadas apenas com compradores interessados
                    </p>
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
                {error && (
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
                    {error}
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

// Remove the static events array as we're now using the API
