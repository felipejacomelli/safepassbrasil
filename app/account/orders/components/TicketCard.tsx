"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/formatCurrency"
import { PurchasedTicket, SaleTicket, TicketStatus } from "@/lib/types/orders"
import { Share2, Download, Eye, Trash2, MapPin, Calendar, Clock, Tag, Send, CheckCircle, AlertTriangle } from "lucide-react"

interface TicketCardProps {
  ticket: PurchasedTicket | SaleTicket
  type: "purchased" | "sale"
  onShare?: (ticketId: string, eventName: string) => void
  onDownload?: (ticketId: string) => void
  onView?: (ticketId: string) => void
  onDelete?: (ticketId: string) => void
  onMarkTransferred?: (ticketId: string) => void
  onConfirmReceipt?: (ticketId: string) => void
  onOpenDispute?: (ticketData: { id: string; orderNumber: string; eventName: string; ticketType: string }) => void
}

export function TicketCard({ 
  ticket, 
  type, 
  onShare, 
  onDownload, 
  onView, 
  onDelete,
  onMarkTransferred,
  onConfirmReceipt,
  onOpenDispute
}: TicketCardProps) {
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "active":
        return "text-green-400"
      case "verified":
        return "text-green-500"
      case "pending_verification":
        return "text-yellow-400"
      case "used":
        return "text-muted-foreground"
      case "cancelled":
        return "text-red-400"
      case "expired":
        return "text-orange-400"
      case "pending_transfer":
        return "text-yellow-400"
      case "transferred":
        return "text-purple-400"
      case "invalid":
        return "text-red-500"
      case "revoked":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusText = (status: TicketStatus) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "verified":
        return "Verificado"
      case "pending_verification":
        return "Aguardando Verificação"
      case "used":
        return "Usado"
      case "cancelled":
        return "Cancelado"
      case "expired":
        return "Expirado"
      case "pending_transfer":
        return "Transferência Pendente"
      case "transferred":
        return "Transferido"
      case "invalid":
        return "Inválido"
      case "revoked":
        return "Revogado"
      default:
        return "Desconhecido"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-zinc-800">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-2">
            {ticket.event.name}
          </h3>
          
          {/* Informações do evento */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {/* Local do evento */}
            {ticket.occurrence && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{ticket.occurrence.city}, {ticket.occurrence.state}</span>
              </div>
            )}
            
            {/* Data e horário */}
            {ticket.occurrence?.start_at && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(ticket.occurrence.start_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(ticket.occurrence.start_at)}</span>
                </div>
              </div>
            )}
            
            {/* Tipo de ingresso */}
            {ticket.name && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{ticket.name}</span>
              </div>
            )}
            
            {/* Quantidade */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Quantidade:</span>
              <span>{ticket.quantity}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <p className="text-xl font-bold text-foreground mb-1">
            {formatCurrency(Number(ticket.price))}
          </p>
          <p className={`text-sm ${getStatusColor(ticket.status)}`}>
            {getStatusText(ticket.status)}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {type === "purchased" && (
          <>
            {onShare && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShare(ticket.id, ticket.event.name)}
                className="border-border text-foreground hover:bg-accent"
                aria-label={`Compartilhar ingresso ${ticket.event.name}`}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
            )}
            
            {onDownload && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(ticket.id)}
                className="border-border text-foreground hover:bg-accent"
                aria-label={`Baixar ingresso ${ticket.event.name}`}
              >
                <Download className="w-4 h-4 mr-1" />
                Baixar
              </Button>
            )}

            {/* Botão para confirmar recebimento (comprador) */}
            {onConfirmReceipt && ticket.status === "pending_transfer" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onConfirmReceipt(ticket.id)}
                className="border-green-700 text-green-400 hover:bg-green-900 hover:bg-opacity-20"
                aria-label={`Confirmar recebimento do ingresso ${ticket.event.name}`}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirmar Recebimento
              </Button>
            )}

            {/* Botão para abrir disputa/reclamação */}
            {onOpenDispute && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenDispute({
                  id: ticket.id,
                  orderNumber: 'order' in ticket && ticket.order 
                    ? (typeof ticket.order === 'string' ? ticket.order : ticket.order.id)
                    : ticket.id,
                  eventName: ticket.event.name,
                  ticketType: ticket.name
                })}
                className="border-orange-700 text-orange-400 hover:bg-orange-900 hover:bg-opacity-20"
                aria-label={`Abrir disputa para o ingresso ${ticket.event.name}`}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Abrir Disputa
              </Button>
            )}
          </>
        )}
        
        {type === "sale" && (
          <>
            {onShare && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShare(ticket.id, ticket.event.name)}
                className="border-border text-foreground hover:bg-accent"
                aria-label={`Compartilhar anúncio ${ticket.event.name}`}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
            )}
            
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(ticket.id)}
                className="border-border text-foreground hover:bg-accent"
                aria-label={`Ver detalhes do anúncio ${ticket.event.name}`}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
            )}

            {/* Botão para marcar como transferido (vendedor) */}
            {onMarkTransferred && ticket.status === "pending_transfer" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkTransferred(ticket.id)}
                className="border-blue-700 text-blue-400 hover:bg-blue-900 hover:bg-opacity-20"
                aria-label={`Transferir ingresso ${ticket.event.name}`}
              >
                <Send className="w-4 h-4 mr-1" />
                Transferir Ingresso
              </Button>
            )}
            
            {onDelete && ticket.status !== "pending_transfer" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(ticket.id)}
                className="border-red-700 text-red-400 hover:bg-red-900 hover:bg-opacity-20"
                aria-label={`Remover anúncio ${ticket.event.name}`}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remover
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}