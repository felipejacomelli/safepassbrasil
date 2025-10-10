"use client"

// Interfaces para tipagem
interface Order {
  id: string
  total_amount: string
  status: number
  created_at: string
  updated_at: string
  transaction: string
  user: string
}

interface Transaction {
  id: string
  amount: string
  status: number
  created_at: string
  updated_at: string
  external_id: string
  payment_method?: string
  user: string
  transaction_type?: string
}

interface Ticket {
  id: string
  name: string
  quantity: number
  price: string
  status: string | number
  event: {
    id: string
    name: string
    slug: string
    status: string
  }
  occurrence?: {
    id: string
    start_at: string
    city: string
    state: string
  }
  order?: string
  created_at: string
  updated_at: string
  user: string
  buyer?: string
}

interface Sale {
  id: string
  name: string
  quantity: number
  price: string
  status: string | number
  event: {
    id: string
    name: string
    slug: string
    status: string
  }
  occurrence?: {
    id: string
    start_at: string
    city: string
    state: string
  }
  order?: string
  created_at: string
  updated_at: string
  user: string
  buyer?: string
}

interface PaymentMethod {
  method: "pix" | "bank" | "card"
  details: {
    pixKey?: string
    bankName?: string
  }
}

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AccountSidebar } from "@/components/AccountSidebar"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/utils/formatCurrency"
import { ShareTicketModal } from "@/components/ShareTicketModal"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  Download,
  ExternalLink,
  Filter,
  QrCode,
  Landmark,
  CreditCard,
  Share,
} from "lucide-react"

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("purchases")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("all")
  const [salesStatusFilter, setSalesStatusFilter] = useState("all")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    method: "pix",
    details: {}
  })

  // Estados para dados reais
  const [orders, setOrders] = useState<Order[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [soldTickets, setSoldTickets] = useState<Sale[]>([])
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para compartilhamento
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedTicketForShare, setSelectedTicketForShare] = useState<Ticket | null>(null)
  const [realBalance, setRealBalance] = useState(0)
  const [realPendingBalance, setRealPendingBalance] = useState(0)
  const [activeSalesTab, setActiveSalesTab] = useState("for-sale")

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Reset filters when switching tabs
  useEffect(() => {
    if (activeTab === "purchases") {
      setPurchaseStatusFilter("all")
    } else if (activeTab === "sales") {
      setSalesStatusFilter("all")
    }
  }, [activeTab])

  // Carregar dados reais da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Função auxiliar para fazer requisições autenticadas
        const apiRequest = async (endpoint: string) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          })
          return response
        }
        
        // Carregar pedidos do usuário
        const ordersResponse = await apiRequest(`/api/orders`)
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData.orders || [])
        }

        // Carregar vendas (tickets à venda pelo usuário - sem comprador)
        const salesResponse = await apiRequest(`/api/tickets/`)
        if (salesResponse.ok) {
          const salesData = await salesResponse.json()
          setSales(salesData.tickets || [])
          
          // Calcular saldo pendente baseado nos tickets à venda
          const totalPendingBalance = salesData.tickets?.reduce((sum: number, ticket: any) => {
            return sum + (parseFloat(ticket.price) * ticket.quantity)
          }, 0) || 0
          
          setRealPendingBalance(totalPendingBalance)
        }

        // Carregar tickets vendidos (com comprador)
        const soldResponse = await apiRequest(`/api/tickets/sold/`)
        if (soldResponse.ok) {
          const soldData = await soldResponse.json()
          setSoldTickets(soldData.tickets || [])
          
          // Calcular saldo disponível baseado nos tickets vendidos efetivamente
          const totalSoldBalance = soldData.tickets?.reduce((sum: number, ticket: any) => {
            return sum + (parseFloat(ticket.price) * ticket.quantity)
          }, 0) || 0
          
          setRealBalance(totalSoldBalance)
        }

        // ✅ FASE 6: Carregar tickets comprados pelo usuário
        const purchasedResponse = await apiRequest(`/api/tickets/purchased/`)
        if (purchasedResponse.ok) {
          const purchasedData = await purchasedResponse.json()
          setPurchasedTickets(purchasedData.tickets || [])
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadData()
    }
  }, [user])

  // Filter purchases based on selected filters
  const filteredPurchases = purchasedTickets.filter((ticket) => {
    if (purchaseStatusFilter === "all") return true
    
    // Mapear filtros para status do backend (tanto string quanto number)
    const statusMap: { [key: string]: string | number } = {
      "1": "USED",      // Usado
      "2": "ACTIVE",    // Ativo
      "3": "CANCELLED", // Cancelado
      "4": "EXPIRED",   // Expirado
      "5": "TRANSFERRED" // Transferido
    }
    
    // Mapear também para números (caso a API retorne números)
    const numberStatusMap: { [key: string]: number } = {
      "1": 1, // USED
      "2": 2, // ACTIVE
      "3": 3, // CANCELLED
      "4": 4, // EXPIRED
      "5": 5  // TRANSFERRED
    }
    
    const expectedStringStatus = statusMap[purchaseStatusFilter] as string
    const expectedNumberStatus = numberStatusMap[purchaseStatusFilter]
    
    // Verificar se o status corresponde (string ou number)
    return ticket.status === expectedStringStatus || ticket.status === expectedNumberStatus
  })

  const filteredOrders = orders.filter((order) => {
    if (purchaseStatusFilter !== "all" && order.status.toString() !== purchaseStatusFilter) return false
    return true
  })

  const filteredSales = sales.filter((sale) => {
    if (salesStatusFilter === "all") return true
    
    // Mapear filtros para status do backend (tanto string quanto number)
    const statusMap: { [key: string]: string | number } = {
      "1": "USED",      // Usado
      "2": "ACTIVE",    // Ativo
      "3": "CANCELLED", // Cancelado
      "4": "EXPIRED",   // Expirado
      "5": "TRANSFERRED" // Transferido
    }
    
    // Mapear também para números (caso a API retorne números)
    const numberStatusMap: { [key: string]: number } = {
      "1": 1, // USED
      "2": 2, // ACTIVE
      "3": 3, // CANCELLED
      "4": 4, // EXPIRED
      "5": 5  // TRANSFERRED
    }
    
    const expectedStringStatus = statusMap[salesStatusFilter] as string
    const expectedNumberStatus = numberStatusMap[salesStatusFilter]
    
    // Verificar se o status corresponde (string ou number)
    return sale.status === expectedStringStatus || sale.status === expectedNumberStatus
  })

  const filteredSoldTickets = soldTickets.filter((ticket) => {
    if (salesStatusFilter === "all") return true
    
    // Mapear filtros para status do backend (tanto string quanto number)
    const statusMap: { [key: string]: string | number } = {
      "1": "USED",      // Usado
      "2": "ACTIVE",    // Ativo
      "3": "CANCELLED", // Cancelado
      "4": "EXPIRED",   // Expirado
      "5": "TRANSFERRED" // Transferido
    }
    
    // Mapear também para números (caso a API retorne números)
    const numberStatusMap: { [key: string]: number } = {
      "1": 1, // USED
      "2": 2, // ACTIVE
      "3": 3, // CANCELLED
      "4": 4, // EXPIRED
      "5": 5  // TRANSFERRED
    }
    
    const expectedStringStatus = statusMap[salesStatusFilter] as string
    const expectedNumberStatus = numberStatusMap[salesStatusFilter]
    
    // Verificar se o status corresponde (string ou number)
    return ticket.status === expectedStringStatus || ticket.status === expectedNumberStatus
  })

  // Função para abrir modal de compartilhamento
  const handleShareTicket = (ticket: Ticket) => {
    setSelectedTicketForShare(ticket)
    setShareModalOpen(true)
  }

  // Calculate balance from real data
  const balance = realBalance
  const pendingBalance = realPendingBalance

  const handleWithdrawal = () => {
    setShowWithdrawalForm(false)
    setWithdrawalAmount("")
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="flex">
        <AccountSidebar balance={realBalance} pendingBalance={realPendingBalance} />
        
        <div className="flex-1 p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Meus Pedidos</h1>
            <p className="text-gray-400 mt-2">Gerencie seus pedidos, transações e saldo</p>
          </div>

          {/* Balance Section */}
          <div className="bg-blue-600 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Saldo Disponível</h2>
                <p className="text-3xl font-bold text-white">{formatCurrency(balance)}</p>
                <p className="text-gray-300 mt-1">
                  Pendente: {formatCurrency(pendingBalance)}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowWithdrawalForm(true)}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  Sacar
                </Button>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          {showWithdrawalForm && (
            <div className="bg-zinc-900 rounded-lg p-6 mb-8 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Solicitar Saque</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor do Saque
                  </label>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Método de Pagamento
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod({ method: "pix", details: {} })}
                      className={`w-full flex items-center p-3 rounded-lg border ${
                        paymentMethod.method === "pix"
                          ? "border-blue-500 bg-blue-900 bg-opacity-20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <QrCode className="w-5 h-5 mr-3" />
                      <span>PIX</span>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod({ method: "bank", details: {} })}
                      className={`w-full flex items-center p-3 rounded-lg border ${
                        paymentMethod.method === "bank"
                          ? "border-blue-500 bg-blue-900 bg-opacity-20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Landmark className="w-5 h-5 mr-3" />
                      <span>Transferência Bancária</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button onClick={handleWithdrawal} className="bg-blue-600 hover:bg-blue-700">
                  Confirmar Saque
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowWithdrawalForm(false)}
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="purchases" className="data-[state=active]:bg-zinc-700">
                  Compras
                </TabsTrigger>
                <TabsTrigger value="sales" className="data-[state=active]:bg-zinc-700">
                  Vendas
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <label className="text-sm text-gray-400 whitespace-nowrap">
                  Filtrar por status:
                </label>
                {activeTab === "purchases" ? (
                  <select
                    value={purchaseStatusFilter}
                    onChange={(e) => setPurchaseStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors hover:border-zinc-700 w-full sm:w-auto min-w-[160px]"
                    aria-label="Filtrar status das compras"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="1">Usado</option>
                    <option value="2">Ativo</option>
                    <option value="3">Cancelado</option>
                    <option value="4">Expirado</option>
                    <option value="5">Transferido</option>
                  </select>
                ) : (
                  <select
                    value={salesStatusFilter}
                    onChange={(e) => setSalesStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors hover:border-zinc-700 w-full sm:w-auto min-w-[160px]"
                    aria-label="Filtrar status das vendas"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="1">Usado</option>
                    <option value="2">Ativo</option>
                    <option value="3">Cancelado</option>
                    <option value="4">Expirado</option>
                    <option value="5">Transferido</option>
                  </select>
                )}
              </div>
            </div>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-4">
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowUpFromLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {purchaseStatusFilter === "all" 
                      ? "Nenhuma compra encontrada" 
                      : "Nenhuma compra encontrada com este status"}
                  </p>
                </div>
              ) : (
                filteredPurchases.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <ArrowUpFromLine className="w-5 h-5 text-red-500 mr-2" />
                          <h3 className="text-white font-medium">{ticket.name}</h3>
                        </div>
                        <p className="text-gray-300 mt-1">Quantidade: {ticket.quantity}</p>
                        <p className="text-gray-300">{ticket.event?.name || 'Evento'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-500 font-semibold text-lg">
                          -{formatCurrency(parseFloat(ticket.price))}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                            ticket.status === "ACTIVE" || ticket.status === 2
                              ? "bg-green-900 bg-opacity-20 text-green-500"
                              : ticket.status === "USED" || ticket.status === 1
                                ? "bg-blue-900 bg-opacity-20 text-blue-500"
                                : ticket.status === "EXPIRED" || ticket.status === 4
                                  ? "bg-red-900 bg-opacity-20 text-red-500"
                                  : ticket.status === "CANCELLED" || ticket.status === 3
                                    ? "bg-gray-900 bg-opacity-20 text-gray-500"
                                    : ticket.status === "TRANSFERRED" || ticket.status === 5
                                      ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                      : "bg-yellow-900 bg-opacity-20 text-yellow-500"
                          }`}
                        >
                          {ticket.status === "ACTIVE" || ticket.status === 2
                            ? "Ativo"
                            : ticket.status === "USED" || ticket.status === 1
                              ? "Usado"
                              : ticket.status === "EXPIRED" || ticket.status === 4
                                ? "Expirado"
                                : ticket.status === "CANCELLED" || ticket.status === 3
                                  ? "Cancelado"
                                  : ticket.status === "TRANSFERRED" || ticket.status === 5
                                    ? "Transferido"
                                    : "Desconhecido"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <p className="text-gray-400 text-xs">ID: {ticket.id}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Sales Tab */}
            <TabsContent value="sales" className="space-y-4">
              {/* Sub-tabs for Sales */}
              <Tabs value={activeSalesTab} onValueChange={setActiveSalesTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
                  <TabsTrigger value="for-sale" className="data-[state=active]:bg-zinc-800">
                    À Venda
                  </TabsTrigger>
                  <TabsTrigger value="sold" className="data-[state=active]:bg-zinc-800">
                    Vendas Efetivadas
                  </TabsTrigger>
                </TabsList>

                {/* Tickets à venda */}
                <TabsContent value="for-sale" className="space-y-4 mt-4">
                  {filteredSales.length === 0 ? (
                    <div className="text-center py-12">
                      <ArrowDownToLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhum ticket à venda encontrado</p>
                    </div>
                  ) : (
                    filteredSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <ArrowDownToLine className="w-5 h-5 text-blue-500 mr-2" />
                              <h3 className="text-white font-medium">{sale.name}</h3>
                            </div>
                            <p className="text-gray-300 mt-1">{sale.event?.name || 'Evento'}</p>
                            <p className="text-gray-400 text-sm">Quantidade: {sale.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-500">
                              {formatCurrency(parseFloat(sale.price))}
                            </p>
                            <div className="flex items-center justify-end mt-1">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-gray-400 text-xs">{new Date(sale.created_at).toLocaleDateString()}</p>
                            </div>
                            <span
                              className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                sale.status === "ACTIVE"
                                  ? "bg-green-900 bg-opacity-20 text-green-500"
                                  : sale.status === "USED"
                                    ? "bg-blue-900 bg-opacity-20 text-blue-500"
                                    : sale.status === "EXPIRED"
                                      ? "bg-red-900 bg-opacity-20 text-red-500"
                                      : sale.status === "CANCELLED"
                                        ? "bg-gray-900 bg-opacity-20 text-gray-500"
                                        : "bg-yellow-900 bg-opacity-20 text-yellow-500"
                              }`}
                            >
                              {sale.status === "ACTIVE"
                                ? "Ativo"
                                : sale.status === "USED"
                                  ? "Usado"
                                  : sale.status === "EXPIRED"
                                    ? "Expirado"
                                    : sale.status === "CANCELLED"
                                      ? "Cancelado"
                                      : sale.status === "TRANSFERRED"
                                        ? "Transferido"
                                        : "Desconhecido"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                          <p className="text-gray-400 text-xs">ID: {sale.id}</p>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-500 hover:text-green-400"
                              onClick={() => handleShareTicket(sale)}
                            >
                              <Share className="w-4 h-4 mr-1" />
                              Compartilhar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                {/* Vendas efetivadas */}
                 <TabsContent value="sold" className="space-y-4 mt-4">
                   {filteredSoldTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <ArrowDownToLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhuma venda efetivada encontrada</p>
                    </div>
                  ) : (
                     filteredSoldTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <ArrowDownToLine className="w-5 h-5 text-green-500 mr-2" />
                              <h3 className="text-white font-medium">{ticket.name}</h3>
                            </div>
                            <p className="text-gray-300 mt-1">{ticket.event?.name || 'Evento'}</p>
                            <p className="text-gray-400 text-sm">Quantidade: {ticket.quantity}</p>
                            <p className="text-gray-400 text-sm">Comprador: #{ticket.buyer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">
                              +{formatCurrency(parseFloat(ticket.price))}
                            </p>
                            <div className="flex items-center justify-end mt-1">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-gray-400 text-xs">{new Date(ticket.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs bg-green-900 bg-opacity-20 text-green-500">
                              Vendido
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                          <p className="text-gray-400 text-xs">ID: {ticket.id}</p>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Modal de Compartilhamento */}
      {selectedTicketForShare && (
        <ShareTicketModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false)
            setSelectedTicketForShare(null)
          }}
          ticketId={selectedTicketForShare.id}
          eventName={selectedTicketForShare.event?.name || 'Evento'}
        />
      )}
    </div>
  )
}
