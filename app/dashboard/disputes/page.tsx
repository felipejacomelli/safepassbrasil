"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Plus,
  Eye,
  Send
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDisputes } from '@/hooks/use-disputes'
import { toast } from 'sonner'

interface Dispute {
  id: string
  dispute_type: string
  status: string
  disputed_amount: number
  created_at: string
  order_id: string
  description: string
  evidence: string[]
  seller_response?: string
  seller_evidence?: string[]
  resolution?: string
  resolution_notes?: string
  messages_count: number
}

interface DisputeMessage {
  id: string
  sender_name: string
  message_type: string
  content: string
  attachments: string[]
  created_at: string
}

interface EscrowTransaction {
  id: string
  order_id: string
  locked_amount: number
  status: string
  created_at: string
  expires_at: string
}

export default function DisputesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([])
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [messages, setMessages] = useState<DisputeMessage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showMessagesDialog, setShowMessagesDialog] = useState(false)
  
  // Hook para integração com API
  const { 
    loading, 
    error: hookError, 
    getUserDisputes, 
    createDispute,
    getEscrowByOrderId 
  } = useDisputes()

  // Form data for creating dispute
  const [createFormData, setCreateFormData] = useState({
    escrow_transaction: '',
    dispute_type: '',
    description: '',
    disputed_amount: '',
    evidence: [] as string[]
  })

  // Form data for seller response
  const [responseFormData, setResponseFormData] = useState({
    seller_response: '',
    seller_evidence: [] as string[]
  })

  // Form data for new message
  const [messageFormData, setMessageFormData] = useState({
    content: '',
    attachments: [] as string[]
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // ✅ OTIMIZAÇÃO: Só recarregar se necessário
  useEffect(() => {
    if (user) {
      const now = new Date()
      const lastFetch = localStorage.getItem(`disputes_fetch_${user.id}`)
      
      if (!lastFetch || (now.getTime() - parseInt(lastFetch) > 300000)) { // 5 minutos
        fetchData()
      }
    }
  }, [user])

  const fetchData = async () => {
    try {
      // Buscar disputas usando o hook
      const disputesData = await getUserDisputes()
      setDisputes(disputesData)

      // Buscar escrows manualmente (não temos hook para isso ainda)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (token) {
        const escrowsRes = await fetch(`${apiUrl}/api/escrow/transactions/`, {
          headers: { 'Authorization': `Token ${token}` }
        })

        if (escrowsRes.ok) {
          const escrowsData = await escrowsRes.json()
          setEscrows(escrowsData.escrows || [])
        }
      }

      // ✅ OTIMIZAÇÃO: Marcar timestamp da última busca
      if (user) {
        localStorage.setItem(`disputes_fetch_${user.id}`, Date.now().toString())
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados')
      toast.error('Erro ao carregar disputas')
    }
  }

  const fetchDisputeMessages = async (disputeId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado, pulando busca de dados de disputes')
        return
      }

      const response = await fetch(`${apiUrl}/api/escrow/disputes/${disputeId}/messages/`, {
        headers: { 'Authorization': `Token ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      // Usar o hook para criar disputa
      const disputeData = {
        escrow_transaction: createFormData.escrow_transaction,
        dispute_type: createFormData.dispute_type,
        description: createFormData.description,
        evidence: createFormData.evidence,
        disputed_amount: parseFloat(createFormData.disputed_amount)
      }

      await createDispute(disputeData)

      setSuccess('Disputa criada com sucesso!')
      setCreateFormData({
        escrow_transaction: '',
        dispute_type: '',
        description: '',
        disputed_amount: '',
        evidence: []
      })
      setShowCreateDialog(false)
      fetchData()
      toast.success('Disputa criada com sucesso!')

    } catch (error) {
      console.error('Erro ao criar disputa:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar disputa'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSellerResponse = async (disputeId: string) => {
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado, pulando busca de dados de disputes')
        return
      }

      const response = await fetch(`${apiUrl}/api/escrow/disputes/${disputeId}/seller-response/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          seller_response: responseFormData.seller_response,
          seller_evidence: responseFormData.seller_evidence
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Resposta enviada com sucesso!')
        setResponseFormData({
          seller_response: '',
          seller_evidence: []
        })
        fetchData()
      } else {
        setError(data.error || 'Erro ao enviar resposta')
      }

    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
      setError('Erro ao enviar resposta')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendMessage = async (disputeId: string) => {
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado, pulando busca de dados de disputes')
        return
      }

      const response = await fetch(`${apiUrl}/api/escrow/disputes/${disputeId}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          content: messageFormData.content,
          attachments: messageFormData.attachments
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Mensagem enviada com sucesso!')
        setMessageFormData({
          content: '',
          attachments: []
        })
        fetchDisputeMessages(disputeId)
      } else {
        setError(data.error || 'Erro ao enviar mensagem')
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setError('Erro ao enviar mensagem')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'destructive' | 'secondary' | 'default'; icon: any }> = {
      'open': { label: 'Aberta', variant: 'destructive', icon: AlertTriangle },
      'under_review': { label: 'Em Análise', variant: 'secondary', icon: Clock },
      'resolved': { label: 'Resolvida', variant: 'default', icon: CheckCircle },
      'closed': { label: 'Fechada', variant: 'secondary', icon: XCircle }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: Clock }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getDisputeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
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

  const getResolutionLabel = (resolution: string) => {
    const resolutions: Record<string, string> = {
      'refund_buyer': 'Reembolsar Comprador',
      'release_seller': 'Liberar para Vendedor',
      'partial_refund': 'Reembolso Parcial',
      'no_action': 'Nenhuma Ação'
    }
    return resolutions[resolution] || resolution
  }

  // Mostrar erro do hook se houver
  if (hookError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar disputas: {hookError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando disputas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Disputas</h1>
          <p className="text-muted-foreground">
            Gerencie suas disputas e resoluções
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Disputa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Disputa</DialogTitle>
                <DialogDescription>
                  Abra uma disputa sobre uma transação de escrow
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateDispute} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="escrow_transaction">Transação de Escrow *</Label>
                  <Select 
                    value={createFormData.escrow_transaction} 
                    onValueChange={(value) => setCreateFormData(prev => ({ ...prev, escrow_transaction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma transação" />
                    </SelectTrigger>
                    <SelectContent>
                      {escrows.filter(e => e.status === 'locked').map((escrow) => (
                        <SelectItem key={escrow.id} value={escrow.id}>
                          Pedido #{escrow.order_id.slice(-8)} - {formatCurrency(escrow.locked_amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dispute_type">Tipo de Disputa *</Label>
                  <Select 
                    value={createFormData.dispute_type} 
                    onValueChange={(value) => setCreateFormData(prev => ({ ...prev, dispute_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product_not_received">Produto não recebido</SelectItem>
                      <SelectItem value="product_not_as_described">Produto não conforme descrição</SelectItem>
                      <SelectItem value="product_defective">Produto com defeito</SelectItem>
                      <SelectItem value="seller_not_responding">Vendedor não responde</SelectItem>
                      <SelectItem value="unauthorized_transaction">Transação não autorizada</SelectItem>
                      <SelectItem value="duplicate_payment">Pagamento duplicado</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disputed_amount">Valor em Disputa *</Label>
                  <Input
                    id="disputed_amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={createFormData.disputed_amount}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, disputed_amount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o problema..."
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Criando...' : 'Criar Disputa'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => router.back()} variant="outline">
            Voltar
          </Button>
        </div>
      </div>

      {/* Lista de Disputas */}
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <Card key={dispute.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">Pedido #{dispute.order_id.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {getDisputeTypeLabel(dispute.dispute_type)} - {new Date(dispute.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(dispute.disputed_amount)}</p>
                  {getStatusBadge(dispute.status)}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Descrição:</p>
                <p className="text-sm">{dispute.description}</p>
              </div>

              {dispute.seller_response && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Resposta do Vendedor:</p>
                  <p className="text-sm text-blue-800">{dispute.seller_response}</p>
                </div>
              )}

              {dispute.resolution && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1">Resolução:</p>
                  <p className="text-sm text-green-800">{getResolutionLabel(dispute.resolution)}</p>
                  {dispute.resolution_notes && (
                    <p className="text-sm text-green-700 mt-1">{dispute.resolution_notes}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{dispute.messages_count} mensagens</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedDispute(dispute)
                      fetchDisputeMessages(dispute.id)
                      setShowMessagesDialog(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Mensagens
                  </Button>
                  
                  {dispute.status === 'open' && !dispute.seller_response && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedDispute(dispute)
                        setResponseFormData({ seller_response: '', seller_evidence: [] })
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Responder
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {disputes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma disputa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não possui disputas abertas
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Disputa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Mensagens */}
      <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mensagens da Disputa</DialogTitle>
            <DialogDescription>
              Pedido #{selectedDispute?.order_id.slice(-8)} - {getDisputeTypeLabel(selectedDispute?.dispute_type || '')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Lista de Mensagens */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className={`p-3 rounded-lg ${
                  message.message_type === 'buyer_message' ? 'bg-blue-50 border border-blue-200' :
                  message.message_type === 'seller_message' ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {message.sender_name} ({message.message_type === 'buyer_message' ? 'Comprador' : 
                        message.message_type === 'seller_message' ? 'Vendedor' : 'Sistema'})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString('pt-BR')} às {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>

            {/* Formulário de Nova Mensagem */}
            <div className="border-t pt-4">
              <form onSubmit={(e) => {
                e.preventDefault()
                if (selectedDispute) {
                  handleSendMessage(selectedDispute.id)
                }
              }} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="message_content">Nova Mensagem</Label>
                  <Textarea
                    id="message_content"
                    placeholder="Digite sua mensagem..."
                    value={messageFormData.content}
                    onChange={(e) => setMessageFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowMessagesDialog(false)}>
                    Fechar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Resposta do Vendedor */}
      {selectedDispute && (
        <Dialog open={!!selectedDispute && !showMessagesDialog} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Responder à Disputa</DialogTitle>
              <DialogDescription>
                Pedido #{selectedDispute.order_id.slice(-8)} - {getDisputeTypeLabel(selectedDispute.dispute_type)}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSellerResponse(selectedDispute.id)
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seller_response">Sua Resposta *</Label>
                <Textarea
                  id="seller_response"
                  placeholder="Responda à disputa de forma detalhada..."
                  value={responseFormData.seller_response}
                  onChange={(e) => setResponseFormData(prev => ({ ...prev, seller_response: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedDispute(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar Resposta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

