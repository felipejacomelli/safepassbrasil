"use client"

import { useState } from "react"
import { X, Link2, Mail, Clock, Users, Copy, CheckCircle, Share2, AlertCircle } from "lucide-react"

interface ShareTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  eventName: string
}

export function ShareTicketModal({ isOpen, onClose, ticketId, eventName }: ShareTicketModalProps) {
  const [linkType, setLinkType] = useState<"public" | "private">("public")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [message, setMessage] = useState("")
  const [expiresInHours, setExpiresInHours] = useState(24)
  const [maxAccesses, setMaxAccesses] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const authToken = localStorage.getItem("authToken")

      const payload = {
        ticket_id: ticketId,
        link_type: linkType,
        recipient_email: linkType === "private" ? recipientEmail : undefined,
        expires_in_hours: expiresInHours,
        max_accesses: maxAccesses,
        message: message || undefined
      }

      const response = await fetch(`${apiUrl}/api/v1/sharing/links/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${authToken}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao gerar link")
      }

      const data = await response.json()
      setGeneratedLink(data.shareable_url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async (platform: string) => {
    if (!generatedLink) return

    const shareText = message 
      ? `${message}\n\nEvento: ${eventName}\n${generatedLink}`
      : `Olá! Estou compartilhando um ingresso para ${eventName} com você.\n\n${generatedLink}`

    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(generatedLink)

    const urls: { [key: string]: string } = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`Ingresso: ${eventName}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`Ingresso: ${eventName}`)}`
    }

    window.open(urls[platform], "_blank", "width=600,height=400")
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#18181B",
        borderRadius: "16px",
        maxWidth: "600px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        border: "1px solid #27272A"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #27272A",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Share2 size={24} color="#3B82F6" />
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "white" }}>
              Compartilhar Ingresso
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#A1A1AA",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {!generatedLink ? (
            <>
              {/* Event Name */}
              <div style={{ marginBottom: "20px" }}>
                <p style={{ color: "#A1A1AA", fontSize: "14px" }}>Compartilhando ingresso para:</p>
                <p style={{ color: "white", fontSize: "18px", fontWeight: "600", marginTop: "4px" }}>
                  {eventName}
                </p>
              </div>

              {/* Link Type */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#D4D4D8" }}>
                  Tipo de Link
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setLinkType("public")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: linkType === "public" ? "#3B82F6" : "#27272A",
                      border: linkType === "public" ? "2px solid #3B82F6" : "2px solid transparent",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <Link2 size={18} />
                    Público
                  </button>
                  <button
                    onClick={() => setLinkType("private")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: linkType === "private" ? "#3B82F6" : "#27272A",
                      border: linkType === "private" ? "2px solid #3B82F6" : "2px solid transparent",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <Mail size={18} />
                    Privado
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "8px" }}>
                  {linkType === "public" 
                    ? "Qualquer pessoa com o link pode acessar"
                    : "Apenas o destinatário com email confirmado pode acessar"}
                </p>
              </div>

              {/* Recipient Email (if private) */}
              {linkType === "private" && (
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#D4D4D8" }}>
                    Email do Destinatário *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="destinatario@email.com"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#27272A",
                      border: "1px solid #3F3F46",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px"
                    }}
                  />
                </div>
              )}

              {/* Message */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#D4D4D8" }}>
                  Mensagem Personalizada (Opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Adicione uma mensagem para o destinatário..."
                  maxLength={500}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#27272A",
                    border: "1px solid #3F3F46",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px",
                    resize: "vertical"
                  }}
                />
                <p style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "4px" }}>
                  {message.length}/500 caracteres
                </p>
              </div>

              {/* Expires In */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#D4D4D8" }}>
                  <Clock size={16} style={{ display: "inline", marginRight: "6px" }} />
                  Validade do Link
                </label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#27272A",
                    border: "1px solid #3F3F46",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px"
                  }}
                >
                  <option value={1}>1 hora</option>
                  <option value={6}>6 horas</option>
                  <option value={12}>12 horas</option>
                  <option value={24}>24 horas (1 dia)</option>
                  <option value={48}>48 horas (2 dias)</option>
                  <option value={72}>72 horas (3 dias)</option>
                  <option value={168}>7 dias</option>
                </select>
              </div>

              {/* Max Accesses */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#D4D4D8" }}>
                  <Users size={16} style={{ display: "inline", marginRight: "6px" }} />
                  Máximo de Acessos
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxAccesses}
                  onChange={(e) => setMaxAccesses(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#27272A",
                    border: "1px solid #3F3F46",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px"
                  }}
                />
                <p style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "4px" }}>
                  Número de vezes que o link pode ser acessado (1-10)
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: "12px",
                  backgroundColor: "#7F1D1D33",
                  border: "1px solid #EF4444",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "start"
                }}>
                  <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "14px", color: "#FCA5A5" }}>{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || (linkType === "private" && !recipientEmail)}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: loading ? "#6B7280" : "#3B82F6",
                  border: "none",
                  borderRadius: "8px",
                  color: loading ? "#D4D4D8" : "black",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Gerando Link..." : "Gerar Link de Compartilhamento"}
              </button>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <CheckCircle size={64} color="#10B981" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>
                  Link Gerado com Sucesso!
                </h3>
                <p style={{ color: "#A1A1AA", fontSize: "14px" }}>
                  Compartilhe este link para transferir o ingresso
                </p>
              </div>

              {/* Generated Link */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#D4D4D8" }}>
                  Link Gerado
                </label>
                <div style={{
                  display: "flex",
                  gap: "8px"
                }}>
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "#27272A",
                      border: "1px solid #3F3F46",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px"
                    }}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: copied ? "#10B981" : "#3B82F6",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", color: "#D4D4D8", marginBottom: "12px" }}>
                  Compartilhar via:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  <button
                    onClick={() => handleShare("whatsapp")}
                    style={{
                      padding: "12px",
                      backgroundColor: "#25D366",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare("telegram")}
                    style={{
                      padding: "12px",
                      backgroundColor: "#0088CC",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Telegram
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    style={{
                      padding: "12px",
                      backgroundColor: "#1877F2",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    style={{
                      padding: "12px",
                      backgroundColor: "#1DA1F2",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Twitter
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#27272A",
                  border: "1px solid #3F3F46",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
