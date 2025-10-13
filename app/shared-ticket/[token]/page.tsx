"use client"

import { useEffect, useState, use, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, Ticket, User, CheckCircle, AlertCircle, Shield, Share2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AsaasCheckout } from "@/components/asaas-checkout"

interface SharedTicketData {
  id: string
  link_type: string
  event_name: string
  event_image: string
  event_date: string
  event_location: string
  ticket_type: string
  ticket_price: string
  ticket_quantity: number
  ticket_name: string
  owner_name: string
  message: string | null
  expires_at: string
  status: string
  is_valid: boolean
}

export default function SharedTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { user, isAuthenticated } = useAuth()
  const [ticketData, setTicketData] = useState<SharedTicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [email, setEmail] = useState("")
  
  // Estados para checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const fetchSharedTicket = useCallback(async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const url = new URL(`${apiUrl}/api/v1/sharing/public/${token}/`)
      
      // Se for link privado e houver email, adiciona como query param
      if (email) {
        url.searchParams.append("email", email)
      }

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        let errorMessage = "Link não encontrado ou inválido"
        
        try {
          const errorData = await response.json()
          
          // Tratamento específico por código de status
          switch (response.status) {
            case 403:
              errorMessage = errorData.error || "Este link está expirado ou foi revogado."
              break
            case 404:
              errorMessage = "Link não encontrado. Verifique se o endereço está correto."
              break
            case 410:
              errorMessage = "Este link expirou e não está mais disponível."
              break
            default:
              errorMessage = errorData.error || "Erro ao carregar o link compartilhado."
          }
        } catch {
          // Se não conseguir parsear o JSON, usa mensagem padrão baseada no status
          switch (response.status) {
            case 403:
              errorMessage = "Este link está expirado ou foi revogado."
              break
            case 404:
              errorMessage = "Link não encontrado. Verifique se o endereço está correto."
              break
            case 410:
              errorMessage = "Este link expirou e não está mais disponível."
              break
            default:
              errorMessage = "Erro ao carregar o link compartilhado."
          }
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setTicketData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, email])

  useEffect(() => {
    fetchSharedTicket()
  }, [fetchSharedTicket])

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      // Redirecionar para login
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`
      return
    }
    setShowCheckoutModal(true)
  }

  const handlePaymentSuccess = (paymentId: string, paymentData: any) => {
    setAccepted(true)
    setShowCheckoutModal(false)
    
    // Redirecionar para página de ingressos após 3 segundos
    setTimeout(() => {
      window.location.href = "/account/tickets"
    }, 3000)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        textAlign: "center"
      }}>
        <AlertCircle size={64} color="#EF4444" style={{ marginBottom: "20px" }} />
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Link Inválido ou Expirado</h1>
        <p style={{ color: "#A1A1AA", marginBottom: "24px" }}>{error}</p>
        <Link href="/" style={{
          backgroundColor: "#3B82F6",
          color: "black",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold"
        }}>
          Voltar à Página Inicial
        </Link>
      </div>
    )
  }

  if (accepted) {
    return (
      <div style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        textAlign: "center"
      }}>
        <CheckCircle size={64} color="#10B981" style={{ marginBottom: "20px" }} />
        <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>Compra Realizada!</h1>
        <p style={{ color: "#D4D4D8", marginBottom: "8px" }}>
          O ingresso foi comprado e transferido para sua conta com sucesso.
        </p>
        <p style={{ color: "#A1A1AA", marginBottom: "24px" }}>
          Redirecionando para seus ingressos...
        </p>
      </div>
    )
  }

  if (!ticketData) return null

  return (
    <div style={{
      backgroundColor: "black",
      color: "white",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <header style={{
        padding: "20px",
        borderBottom: "1px solid #27272A",
        textAlign: "center"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "8px"
        }}>
          <Share2 size={24} color="#3B82F6" />
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Ingresso à Venda</h1>
        </div>
        <p style={{ color: "#A1A1AA", fontSize: "14px" }}>
          {ticketData.owner_name} está oferecendo este ingresso para venda
        </p>
      </header>

      {/* Content */}
      <main style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px"
      }}>
        {/* Event Image */}
        <div style={{
          position: "relative",
          height: "250px",
          backgroundColor: "#27272A",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "20px"
        }}>
          <Image
            src={ticketData.event_image || "/placeholder.svg"}
            alt={ticketData.event_name}
            width={400}
            height={300}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        </div>

        {/* Event Info Card */}
        <div style={{
          backgroundColor: "#18181B",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "20px"
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
            {ticketData.event_name}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#D4D4D8" }}>
              <Calendar size={20} />
              <span>{formatDate(ticketData.event_date)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#D4D4D8" }}>
              <MapPin size={20} />
              <span>{ticketData.event_location}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3B82F6" }}>
              <Ticket size={20} />
              <span style={{ fontWeight: "600" }}>{ticketData.ticket_type}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#D4D4D8" }}>
              <User size={20} />
              <span>Portador: {ticketData.ticket_name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#D4D4D8" }}>
              <Users size={20} />
              <span>Quantidade: {ticketData.ticket_quantity} ingresso{ticketData.ticket_quantity > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #27272A",
            paddingTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#A1A1AA", fontSize: "14px" }}>Valor do Ingresso:</span>
              <span style={{ color: "#D4D4D8", fontSize: "12px" }}>
                {ticketData.ticket_quantity > 1 ? `${ticketData.ticket_quantity} ingressos` : '1 ingresso'}
              </span>
            </div>
            <span style={{ fontSize: "24px", fontWeight: "bold", color: "#3B82F6" }}>
              {formatPrice(ticketData.ticket_price)}
            </span>
          </div>
        </div>

        {/* Personal Message */}
        {ticketData.message && (
          <div style={{
            backgroundColor: "#18181B",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            borderLeft: "4px solid #3B82F6"
          }}>
            <p style={{ fontSize: "14px", color: "#A1A1AA", marginBottom: "8px" }}>
              Mensagem de {ticketData.owner_name}:
            </p>
            <p style={{ color: "#D4D4D8", lineHeight: "1.6" }}>
              "{ticketData.message}"
            </p>
          </div>
        )}

        {/* Private Link Email Input */}
        {ticketData.link_type === "private" && !ticketData.is_valid && !loading && (
          <div style={{
            backgroundColor: "#18181B",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px"
          }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#D4D4D8" }}>
              Este é um link privado. Confirme seu email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#27272A",
                border: "1px solid #3F3F46",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px"
              }}
            />
            <button
              onClick={fetchSharedTicket}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "12px",
                backgroundColor: "#3B82F6",
                border: "none",
                borderRadius: "8px",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Validar Email
            </button>
          </div>
        )}

        {/* Security Info */}
        <div style={{
          backgroundColor: "#18181B",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Shield size={20} color="#3B82F6" />
            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Informações de Segurança</h3>
          </div>
          <div style={{ fontSize: "14px", color: "#A1A1AA", lineHeight: "1.6" }}>
            <p style={{ marginBottom: "8px" }}>
              • Este link expira em: <strong style={{ color: "#D4D4D8" }}>
                {formatDate(ticketData.expires_at)}
              </strong>
            </p>
            <p style={{ marginBottom: "8px" }}>
              • Tipo de link: <strong style={{ color: "#D4D4D8" }}>
                {ticketData.link_type === "private" ? "Privado" : "Público"}
              </strong>
            </p>
            <p>
              • Ao comprar, o ingresso será transferido para sua conta
            </p>
          </div>
        </div>

        {/* Buy Button */}
        {ticketData.is_valid && (
          <button
            onClick={handleBuyTicket}
            disabled={accepting}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: accepting ? "#6B7280" : "#10B981",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: accepting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {accepting ? (
              "Processando..."
            ) : (
              <>
                <CheckCircle size={24} />
                Comprar Ingresso
              </>
            )}
          </button>
        )}

        {/* Warning */}
        <div style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#713F1233",
          border: "1px solid #F59E0B",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#FCD34D",
          lineHeight: "1.5"
        }}>
          <strong>⚠️ Atenção:</strong> Ao comprar este ingresso, você concorda com os termos de uso da plataforma.
          Certifique-se de que confia no vendedor antes de realizar a compra.
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#18181B",
            borderRadius: "12px",
            padding: "24px",
            width: "100%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <AsaasCheckout
              amount={parseFloat(ticketData?.ticket_price || "0")}
              description={`Ingresso: ${ticketData?.event_name} - ${ticketData?.ticket_type}`}
              userEmail={user?.email}
              userName={user?.name}
              userPhone={user?.phone}
              userCpf={user?.cpf}
              sharedTicketToken={token}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      )}
    </div>
  )
}
