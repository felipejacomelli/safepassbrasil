"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign,
  Eye,
  MessageSquare
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface EscrowStatusProps {
  orderId: string
  showDetails?: boolean
  className?: string
}

interface EscrowTransaction {
  id: string
  order_id: string
  locked_amount: number
  status: 'locked' | 'released' | 'refunded' | 'disputed'
  created_at: string
  expires_at: string
  dispute?: {
    id: string
    status: string
    dispute_type: string
    disputed_amount: number
  }
}

export default function EscrowStatus({ orderId, showDetails = false, className = '' }: EscrowStatusProps) {
  const [escrow, setEscrow] = useState<EscrowTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEscrowStatus()
  }, [orderId])

  const fetchEscrowStatus = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/escrow/order/${orderId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setEscrow(data)
      } else if (response.status === 404) {
        // Pedido não possui escrow
        setEscrow(null)
      } else {
        setError('Erro ao carregar status do escrow')
      }
    } catch (error) {
      console.error('Erro ao carregar escrow:', error)
      setError('Erro ao carregar status do escrow')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      'locked': {
        label: 'Em Escrow',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'released': {
        label: 'Liberado',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      'refunded': {
        label: 'Reembolsado',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'disputed': {
        label: 'Em Disputa',
        variant: 'destructive' as const,
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    }
    return configs[status] || configs['locked']
  }

  const getDisputeTypeLabel = (type: string) => {
    const types = {
      'product_not_received': 'Produto não recebido',
      'product_not_as_described': 'Produto não conforme descrição',
      'product_defective': 'Produto com defeito',
      'seller_not_responding': 'Vendedor não responde',
      'unauthorized_transaction': 'Transação não autorizada',
      'duplicate_payment': 'Pagamento duplicado',
      'other': 'Outro'
    }
    return types[type] || type
  }

  const getDisputeStatusLabel = (status: string) => {
    const statuses = {
      'open': 'Aberta',
      'under_review': 'Em Análise',
      'resolved': 'Resolvida',
      'closed': 'Fechada'
    }
    return statuses[status] || status
  }

  const isExpired = escrow && new Date(escrow.expires_at) < new Date()
  const daysUntilExpiry = escrow ? Math.ceil((new Date(escrow.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        {error}
      </div>
    )
  }

  if (!escrow) {
    return (
      <div className={`text-muted-foreground text-sm ${className}`}>
        Sem escrow
      </div>
    )
  }

  const statusConfig = getStatusConfig(escrow.status)
  const Icon = statusConfig.icon

  if (!showDetails) {
    // Versão compacta - apenas badge
    return (
      <Badge variant={statusConfig.variant} className={`flex items-center gap-1 ${className}`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
        {escrow.status === 'locked' && isExpired && (
          <span className="ml-1 text-xs">(Expirado)</span>
        )}
      </Badge>
    )
  }

  // Versão detalhada - card completo
  return (
    <Card className={`${statusConfig.borderColor} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <Icon className={`h-4 w-4 ${statusConfig.color}`} />
            </div>
            Status do Escrow
          </CardTitle>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
        <CardDescription>
          Proteção de pagamento para este pedido
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valor Bloqueado</p>
            <p className="text-lg font-bold">{formatCurrency(escrow.locked_amount, 'BRL')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Criado em</p>
            <p className="text-sm">{new Date(escrow.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Status específico */}
        {escrow.status === 'locked' && (
          <div className={`p-3 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Dinheiro em Proteção</p>
                <p className="text-sm text-muted-foreground">
                  {isExpired 
                    ? 'Período de proteção expirado - será liberado automaticamente'
                    : `Expira em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {new Date(escrow.expires_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(escrow.expires_at).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {escrow.status === 'released' && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium text-sm text-green-800">Dinheiro Liberado</p>
                <p className="text-sm text-green-700">
                  O valor foi liberado para o vendedor
                </p>
              </div>
            </div>
          </div>
        )}

        {escrow.status === 'refunded' && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="font-medium text-sm text-red-800">Dinheiro Reembolsado</p>
                <p className="text-sm text-red-700">
                  O valor foi reembolsado para o comprador
                </p>
              </div>
            </div>
          </div>
        )}

        {escrow.status === 'disputed' && escrow.dispute && (
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="font-medium text-sm text-orange-800">Disputa Aberta</p>
                <p className="text-sm text-orange-700">
                  {getDisputeTypeLabel(escrow.dispute.dispute_type)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-orange-600">Status:</p>
                <p className="font-medium">{getDisputeStatusLabel(escrow.dispute.status)}</p>
              </div>
              <div>
                <p className="text-orange-600">Valor em Disputa:</p>
                <p className="font-medium">{formatCurrency(escrow.dispute.disputed_amount, 'BRL')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalhes
          </Button>
          {escrow.status === 'disputed' && (
            <Button size="sm" variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Ver Disputa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

