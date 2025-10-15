"use client"

import { useState, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/Header"
import { AccountSidebar } from "@/components/account-sidebar"
import { formatCurrency } from "@/utils/formatCurrency"
import { useOrders } from "@/hooks/use-orders"
import { useTickets } from "@/hooks/use-tickets"
import { useBalance } from "@/hooks/use-balance"
import { 
  BalanceSection, 
  WithdrawalForm, 
  TicketCard, 
  ErrorBoundary, 
  LoadingSpinner, 
  ErrorMessage 
} from "./components"
import { ShareTicketModal } from "@/components/ShareTicketModal"
import { TicketStatus, TicketType, TabType, SalesTabType, StatusFilter, PaymentMethod } from "@/types/orders"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // Filtros memoizados
  const filteredPurchasedTickets = useMemo(() => {
    if (statusFilter === 'all') return purchasedTickets
    return purchasedTickets.filter(ticket => ticket.status === statusFilter)
  }, [purchasedTickets, statusFilter])

  const filteredSalesTickets = useMemo(() => {
    const tickets = salesTab === 'anunciadas' ? salesTickets : soldTickets
    if (statusFilter === 'all') return tickets
    return tickets.filter(ticket => ticket.status === statusFilter)
  }, [salesTickets, soldTickets, salesTab, statusFilter])

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
                    Vendas ({salesTickets.length + soldTickets.length})
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
                      <option value="available">Disponível</option>
                      <option value="sold">Vendido</option>
                      <option value="pending">Pendente</option>
                      <option value="cancelled">Cancelado</option>
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
                        Anunciadas ({salesTickets.length})
                      </Button>
                      <Button
                        variant={salesTab === 'efetivadas' ? 'default' : 'outline'}
                        onClick={() => setSalesTab('efetivadas')}
                      >
                        Efetivadas ({soldTickets.length})
                      </Button>
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-md"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="available">Disponível</option>
                      <option value="sold">Vendido</option>
                      <option value="pending">Pendente</option>
                      <option value="cancelled">Cancelado</option>
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
      </div>
    </ErrorBoundary>
  )
}
