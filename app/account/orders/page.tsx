"use client"

// Interfaces para tipagem
interface Order {
  id: number
  total_amount: string
  status: number
  created_at: string
  updated_at: string
  transaction: number
  user: number
}

interface Transaction {
  id: number
  amount: string
  status: number
  created_at: string
  updated_at: string
  external_id: string
  payment_method?: number
  user: number
  transaction_type?: string
}

interface Ticket {
  id: number
  name: string
  quantity: number
  price: string
  status: number
  event: number
  event_name?: string
  order?: number
  created_at: string
  updated_at: string
  user: number
  buyer?: number
}

interface Sale {
  id: number
  name: string
  quantity: number
  price: string
  status: number
  event: number
  order?: number
  created_at: string
  updated_at: string
  user: number
  buyer?: number
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
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/utils/formatCurrency"
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
  Wallet,
  User,
} from "lucide-react"

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("transactions")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    method: "pix",
    details: {}
  })

  // Estados para dados reais
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [realBalance, setRealBalance] = useState(0)
  const [realPendingBalance, setRealPendingBalance] = useState(0)

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Carregar dados reais da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Função auxiliar para fazer requisições autenticadas
        const apiRequest = async (endpoint: string) => {
          const token = localStorage.getItem('authToken')
          const response = await fetch(`http://localhost:8000${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Token ${token}` })
            }
          })
          return response
        }
        
        // Carregar pedidos do usuário
        const orderFilter = encodeURIComponent(JSON.stringify({"user": parseInt(user?.id || '0')}))
        const ordersResponse = await apiRequest(`/order_app/orders/by/?filter_by=${orderFilter}`)
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData.orders || [])
        }

        // Carregar transações do usuário
        const transactionFilter = encodeURIComponent(JSON.stringify({"user": parseInt(user?.id || '0')}))
        const transactionsResponse = await apiRequest(`/transaction_app/transactions/by/?filter_by=${transactionFilter}`)
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json()
          setTransactions(transactionsData.Transaction || [])
          
          // Calcular saldo baseado APENAS nas transações de VENDA
          const completedSales = transactionsData.Transaction?.filter((t: any) => t.status === 2 && t.transaction_type === 'sale') || []
          const pendingSales = transactionsData.Transaction?.filter((t: any) => t.status === 1 && t.transaction_type === 'sale') || []
          
          // Saldo = apenas receita de vendas (valores positivos)
          const totalBalance = completedSales.reduce((sum: number, t: any) => {
            return sum + parseFloat(t.amount)
          }, 0)
          
          const totalPending = pendingSales.reduce((sum: number, t: any) => {
            return sum + parseFloat(t.amount)
          }, 0)
          
          setRealBalance(totalBalance)
          setRealPendingBalance(totalPending)
        }

        // Carregar vendas (tickets vendidos pelo usuário)
        const salesResponse = await apiRequest(`/ticket_app/tickets?user=${parseInt(user?.id || '0')}&buyer__isnull=false`)
        if (salesResponse.ok) {
          const salesData = await salesResponse.json()
          setSales(salesData.tickets || [])
        }

        // Carregar tickets comprados pelo usuário
        const purchasedFilter = encodeURIComponent(JSON.stringify({"buyer": parseInt(user?.id || '0')}))
        const purchasedResponse = await apiRequest(`/ticket_app/tickets/by/?filter_by=${purchasedFilter}`)
        if (purchasedResponse.ok) {
          const purchasedData = await purchasedResponse.json()
          setPurchasedTickets(purchasedData.Ticket || [])
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

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter((transaction) => {
    if (statusFilter !== "all" && transaction.status.toString() !== statusFilter) return false
    return true
  })

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status.toString() !== statusFilter) return false
    return true
  })

  const filteredSales = sales.filter((sale) => {
    if (statusFilter !== "all" && sale.status.toString() !== statusFilter) return false
    return true
  })

  // Calculate balance from real data
  const balance = realBalance
  const pendingBalance = realPendingBalance

  const handleWithdrawal = () => {
    console.log("Withdrawal requested:", withdrawalAmount, selectedPaymentMethod)
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
      <div className="flex">
        <AccountSidebar balance={realBalance} pendingBalance={realPendingBalance} />
        
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Meus Pedidos</h1>
              <p className="text-gray-400 mt-2">Gerencie seus pedidos, transações e saldo</p>
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white hover:bg-zinc-800"
              >
                <User className="w-5 h-5" />
                <span>{user.name}</span>
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-lg border border-zinc-800 z-10">
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full text-left text-red-400 hover:bg-zinc-800 hover:text-red-300"
                  >
                    Sair
                  </Button>
                </div>
              )}
            </div>
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
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="transactions" className="data-[state=active]:bg-zinc-700">
                  Transações
                </TabsTrigger>
                <TabsTrigger value="purchases" className="data-[state=active]:bg-zinc-700">
                  Compras
                </TabsTrigger>
                <TabsTrigger value="sales" className="data-[state=active]:bg-zinc-700">
                  Vendas
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="1">Pendente</option>
                  <option value="2">Concluído</option>
                  <option value="3">Cancelado</option>
                </select>
                
                <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                
                <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma transação encontrada</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          {transaction.transaction_type === 'purchase' && (
                            <ArrowUpFromLine className="w-5 h-5 text-red-500 mr-2" />
                          )}
                          {transaction.transaction_type === 'sale' && (
                            <ArrowDownToLine className="w-5 h-5 text-green-500 mr-2" />
                          )}
                          <h3 className="text-white font-medium">
                            {transaction.transaction_type === 'purchase' ? "Compra" : "Venda"}
                          </h3>
                        </div>
                        <p className="text-gray-300 mt-1">Transação #{transaction.external_id}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.transaction_type === 'sale' ? "text-green-500" : "text-red-500"}`}>
                          {transaction.transaction_type === 'sale' ? "+" : "-"}
                          {formatCurrency(parseFloat(transaction.amount))}
                        </p>
                        <div className="flex items-center justify-end mt-1">
                          <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                          <p className="text-gray-400 text-xs">{new Date(transaction.created_at).toLocaleDateString()}</p>
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                            transaction.status === 2
                              ? "bg-green-900 bg-opacity-20 text-green-500"
                              : transaction.status === 1
                                ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                : "bg-red-900 bg-opacity-20 text-red-500"
                          }`}
                        >
                          {transaction.status === 2
                            ? "Concluído"
                            : transaction.status === 1
                              ? "Pendente"
                              : "Cancelado"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <p className="text-gray-400 text-xs">ID: {transaction.id}</p>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-4">
              {purchasedTickets.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowUpFromLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma compra encontrada</p>
                </div>
              ) : (
                purchasedTickets.map((ticket) => (
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
                        <p className="text-gray-300">Evento ID: {ticket.event}</p>
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
                            ticket.status === 2
                              ? "bg-green-900 bg-opacity-20 text-green-500"
                              : ticket.status === 1
                                ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                : "bg-red-900 bg-opacity-20 text-red-500"
                          }`}
                        >
                          {ticket.status === 2
                            ? "Ativo"
                            : ticket.status === 1
                              ? "Pendente"
                              : "Cancelado"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <p className="text-gray-400 text-xs">ID: {ticket.id}</p>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Sales Tab */}
            <TabsContent value="sales" className="space-y-4">
              {filteredSales.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowDownToLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma venda encontrada</p>
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
                          <ArrowDownToLine className="w-5 h-5 text-green-500 mr-2" />
                          <h3 className="text-white font-medium">{sale.name}</h3>
                        </div>
                        <p className="text-gray-300 mt-1">Evento #{sale.event}</p>
                        <p className="text-gray-400 text-sm">Quantidade: {sale.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-500">
                          +{formatCurrency(parseFloat(sale.price))}
                        </p>
                        <div className="flex items-center justify-end mt-1">
                          <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                          <p className="text-gray-400 text-xs">{new Date(sale.created_at).toLocaleDateString()}</p>
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                            sale.status === 2
                              ? "bg-green-900 bg-opacity-20 text-green-500"
                              : sale.status === 1
                                ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                : "bg-red-900 bg-opacity-20 text-red-500"
                          }`}
                        >
                          {sale.status === 2
                            ? "Ativo"
                            : sale.status === 1
                              ? "Usado"
                              : "Expirado"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <p className="text-gray-400 text-xs">ID: {sale.id}</p>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
