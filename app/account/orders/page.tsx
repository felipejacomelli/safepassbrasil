"use client"

import { useState, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/Header"
import { AccountSidebar } from "@/components/account-sidebar"
import { useOrders } from "@/hooks/use-orders"
import { useTickets } from "@/hooks/use-tickets"
import { useBalance } from "@/hooks/use-balance"
import { uploadImage } from "@/lib/upload"
import { 
  BalanceSection, 
  WithdrawalForm, 
  TicketCard, 
  ErrorBoundary, 
  LoadingSpinner, 
  ErrorMessage 
} from "./components"
import { ShareTicketModal } from "@/components/ShareTicketModal"
import { TabType, SalesTabType, StatusFilter } from "@/types/orders"
import TransferConfirmationModal from "@/components/transfer/TransferConfirmationModal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  
  // Custom hooks para dados
  const { orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useOrders()
  const { 
    purchasedTickets, 
    salesTickets, 
    soldTickets, 
    loading: ticketsLoading, 
    error: ticketsError,
    refetch: refetchTickets 
  } = useTickets()
  const { balance, loading: balanceLoading, error: balanceError } = useBalance({ salesTickets, soldTickets })

  // Estados locais
  const [activeTab, setActiveTab] = useState<TabType>('compras')
  const [salesTab, setSalesTab] = useState<SalesTabType>('anunciadas')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string>('')
  const [selectedEventName, setSelectedEventName] = useState<string>('')
  
  // Estados para o modal de transferência
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [transferAction, setTransferAction] = useState<'mark_transferred' | 'confirm_receipt'>('mark_transferred')
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  // Filtros memoizados
  const filteredPurchasedTickets = useMemo(() => {
    if (statusFilter === 'all') return purchasedTickets
    return purchasedTickets.filter(ticket => ticket.status === statusFilter)
  }, [purchasedTickets, statusFilter])

  const filteredSalesTickets = useMemo(() => {
    let tickets = salesTab === 'anunciadas' ? salesTickets : soldTickets
    
    // ✅ NOVO: Vendas efetivadas mostram apenas tickets transferred
    if (salesTab === 'efetivadas') {
      tickets = tickets.filter(ticket => ticket.status === 'transferred')
    }
    
    // Aplicar filtro de status se não for 'all'
    if (statusFilter === 'all') return tickets
    return tickets.filter(ticket => ticket.status === statusFilter)
  }, [salesTickets, soldTickets, salesTab, statusFilter])

  // Contadores memoizados
  const ticketCounts = useMemo(() => {
    const transferredCount = soldTickets.filter(t => t.status === 'transferred').length
    return {
      sales: salesTickets.length,
      sold: transferredCount,
      total: salesTickets.length + transferredCount
    }
  }, [salesTickets, soldTickets])

  // Handlers memoizados
  const handleShareTicket = useCallback((ticketId: string, eventName: string) => {
    setSelectedTicketId(ticketId)
    setSelectedEventName(eventName)
    setShareModalOpen(true)
  }, [])

  const handleWithdrawal = useCallback(() => {
    setShowWithdrawalForm(true)
  }, [])

  const handleWithdrawalSubmit = useCallback(async (data: any) => {
    try {
      // Implementar lógica de saque
      console.log('Withdrawal data:', data)
      setShowWithdrawalForm(false)
    } catch (error) {
      console.error('Erro no saque:', error)
    }
  }, [])

  const handleDeleteTicket = useCallback((ticketId: string) => {
    console.log('Delete ticket:', ticketId)
    // TODO: Implementar lógica de exclusão
  }, [])

  const handleRetry = useCallback(() => {
    refetchOrders()
    refetchTickets.all()
  }, [refetchOrders, refetchTickets])

  // Handlers para transferência
  const handleMarkTransferred = useCallback(async (ticketId: string) => {
    const ticket = [...salesTickets, ...soldTickets].find(t => t.id === ticketId)
    if (ticket) {
      setSelectedTicket(ticket)
      setTransferAction('mark_transferred')
      setTransferModalOpen(true)
    }
  }, [salesTickets, soldTickets])

  const handleConfirmReceipt = useCallback(async (ticketId: string) => {
    const ticket = purchasedTickets.find(t => t.id === ticketId)
    if (ticket) {
      setSelectedTicket(ticket)
      setTransferAction('confirm_receipt')
      setTransferModalOpen(true)
    }
  }, [purchasedTickets])

  // Handler para confirmar a ação no modal
  const handleTransferConfirm = useCallback(async (data: { notes?: string; evidenceFile?: File }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      
      if (!token || !selectedTicket) {
        toast.error('Token de autenticação não encontrado')
        return
      }

      // ✅ CORREÇÃO: Buscar transferência diretamente pelo order_id do ticket
      if (!selectedTicket.order) {
        toast.error('Este ingresso não possui um pedido associado')
        return
      }

      // Buscar a transferência usando o order_id do ticket
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const transferResponse = await fetch(`${apiUrl}/api/v1/transfers/?order=${selectedTicket.order}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      })

      if (!transferResponse.ok) {
        throw new Error('Erro ao buscar transferência do pedido')
      }

      const transferData = await transferResponse.json()
      
      // A API deve retornar a transferência associada ao pedido
      const ticketTransfer = transferData.results?.[0] || transferData

      if (!ticketTransfer || !ticketTransfer.id) {
        toast.error('Transferência não encontrada para este pedido')
        return
      }

      // ✅ CORREÇÃO: Usar endpoints corretos do backend
      const endpoint = transferAction === 'mark_transferred' 
        ? `${apiUrl}/api/v1/transfers/${ticketTransfer.id}/mark_transferred/`
        : `${apiUrl}/api/v1/transfers/${ticketTransfer.id}/confirm/`

      // ✅ PASSO 1: Fazer upload da evidência primeiro (se houver)
      let evidenceUrl = null
      if (data.evidenceFile) {
        // Upload direto para Vercel Blob Storage usando o padrão do projeto
        const uploadResult = await uploadImage(data.evidenceFile)
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Erro ao fazer upload da evidência')
        }
        
        evidenceUrl = uploadResult.url
        
        // Salvar evidência no backend
        const evidenceResponse = await fetch(`${apiUrl}/api/v1/transfers/upload-evidence/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            evidence_type: 'receipt',
            file_url: evidenceUrl,
            description: 'Comprovante de transferência'
          }),
        })
        
        if (!evidenceResponse.ok) {
          const errorData = await evidenceResponse.json()
          throw new Error(errorData.error || 'Erro ao salvar evidência')
        }
      }

      // ✅ PASSO 2: Marcar como transferido com URL da evidência
      // ✅ ENVIAR JSON (não FormData) com evidence_urls
      const requestBody = {
        transfer_reference: data.notes || '',
        evidence_urls: evidenceUrl ? [evidenceUrl] : []  // ✅ Array de URLs
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',  // ✅ JSON
        },
        body: JSON.stringify(requestBody),  // ✅ JSON stringify
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Erro ao ${transferAction === 'mark_transferred' ? 'marcar como transferido' : 'confirmar recebimento'}`)
      }

      const successMessage = transferAction === 'mark_transferred' 
        ? 'Ingresso marcado como transferido com sucesso!'
        : 'Recebimento do ingresso confirmado com sucesso!'
      
      toast.success(successMessage)
      
      // Fechar modal e recarregar dados
      setTransferModalOpen(false)
      setSelectedTicket(null)
      refetchTickets.all()
    } catch (error) {
      console.error('Erro na transferência:', error)
      const errorMessage = error instanceof Error ? error.message : 
        (transferAction === 'mark_transferred' 
          ? 'Erro ao marcar ingresso como transferido'
          : 'Erro ao confirmar recebimento do ingresso')
      toast.error(errorMessage)
    }
  }, [transferAction, selectedTicket, refetchTickets])

  // Estados de loading consolidados
  const isLoading = authLoading || ordersLoading || ticketsLoading.purchased || ticketsLoading.sales || ticketsLoading.sold || balanceLoading
  const hasError = ordersError || ticketsError.purchased || ticketsError.sales || ticketsError.sold || balanceError

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <AccountSidebar />
            <div className="flex-1 flex items-center justify-center">
               <LoadingSpinner size="lg" text="Carregando seus pedidos..." />
             </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <AccountSidebar />
            <div className="flex-1 flex items-center justify-center">
              <ErrorMessage
                 title="Erro ao carregar dados"
                 message={hasError?.toString() || "Erro desconhecido"}
                 onRetry={handleRetry}
                 retryText="Tentar novamente"
               />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <AccountSidebar 
              balance={balance?.available} 
              pendingBalance={balance?.pending} 
            />
            
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Meus Pedidos</h1>
                <p className="text-gray-400">Gerencie seus ingressos comprados e vendidos</p>
              </div>

              {/* Seção de Saldo */}
               <BalanceSection
                 availableBalance={balance?.available || 0}
                 pendingBalance={balance?.pending || 0}
                 onWithdrawClick={handleWithdrawal}
               />

               {/* Formulário de Saque */}
               {showWithdrawalForm && (
                 <WithdrawalForm
                   withdrawalAmount=""
                   onAmountChange={() => {}}
                   paymentMethod={{ method: "pix", details: {} }}
                   onPaymentMethodChange={() => {}}
                   availableBalance={balance?.available || 0}
                   onConfirm={() => Promise.resolve()}
                   onCancel={() => setShowWithdrawalForm(false)}
                 />
               )}

              {/* Tabs de Navegação */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
                  <TabsTrigger value="compras" className="data-[state=active]:bg-blue-600">
                    Compras ({purchasedTickets.length})
                  </TabsTrigger>
                  <TabsTrigger value="vendas" className="data-[state=active]:bg-blue-600">
                    Vendas ({ticketCounts.total})
                  </TabsTrigger>
                </TabsList>

                {/* Tab de Compras */}
                <TabsContent value="compras" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Ingressos Comprados</h2>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-md"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Ativo</option>
                      <option value="verified">Verificado</option>
                      <option value="pending_verification">Aguardando Verificação</option>
                      <option value="sold">Vendido</option>
                      <option value="pending_transfer">Transferência Pendente</option>
                      <option value="transferred">Transferido</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="expired">Expirado</option>
                    </select>
                  </div>

                  <div className="grid gap-4">
                    {filteredPurchasedTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        type="purchased"
                        onShare={handleShareTicket}
                        onDownload={(ticketId) => console.log('Download:', ticketId)}
                        onView={(ticketId) => console.log('View:', ticketId)}
                        onConfirmReceipt={handleConfirmReceipt}
                      />
                    ))}
                    {filteredPurchasedTickets.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">Nenhum ingresso comprado encontrado</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab de Vendas */}
                <TabsContent value="vendas" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Button
                        variant={salesTab === 'anunciadas' ? 'default' : 'outline'}
                        onClick={() => setSalesTab('anunciadas')}
                      >
                        Anunciadas ({ticketCounts.sales})
                      </Button>
                      <Button
                        variant={salesTab === 'efetivadas' ? 'default' : 'outline'}
                        onClick={() => setSalesTab('efetivadas')}
                      >
                        Efetivadas ({ticketCounts.sold})
                      </Button>
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-md"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Ativo</option>
                      <option value="verified">Verificado</option>
                      <option value="pending_verification">Aguardando Verificação</option>
                      <option value="sold">Vendido</option>
                      <option value="pending_transfer">Transferência Pendente</option>
                      <option value="transferred">Transferido</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="expired">Expirado</option>
                    </select>
                  </div>

                  <div className="grid gap-4">
                    {filteredSalesTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        type="sale"
                        onShare={handleShareTicket}
                        onDelete={handleDeleteTicket}
                        onMarkTransferred={handleMarkTransferred}
                      />
                    ))}
                    {filteredSalesTickets.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">
                          {salesTab === 'anunciadas' 
                            ? 'Nenhum ingresso anunciado encontrado' 
                            : 'Nenhuma venda efetivada encontrada'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Modal de Compartilhamento */}
        <ShareTicketModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          ticketId={selectedTicketId}
          eventName={selectedEventName}
        />

        {/* Modal de Confirmação de Transferência */}
        <TransferConfirmationModal
          isOpen={transferModalOpen}
          onClose={() => {
            setTransferModalOpen(false)
            setSelectedTicket(null)
          }}
          type={transferAction}
          ticketInfo={{
            eventName: selectedTicket?.eventName || '',
            ticketType: selectedTicket?.ticketType || '',
            price: selectedTicket?.price || ''
          }}
          onConfirm={handleTransferConfirm}
        />
      </div>
    </ErrorBoundary>
  )
}
