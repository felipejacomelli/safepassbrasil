"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AccountSidebar } from "@/components/account-sidebar"
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

// Mock data
const mockOrders = [
  {
    id: "ORD123456",
    event: { name: "Rock in Rio 2025" },
    ticketType: "Pista Premium",
    quantity: 2,
    total: 1500.0,
    status: "completed",
    date: "2025-04-22T14:30:00",
  },
  {
    id: "ORD123457",
    event: { name: "Lollapalooza 2025" },
    ticketType: "Pista",
    quantity: 1,
    total: 450.0,
    status: "completed",
    date: "2025-04-21T10:15:00",
  },
]

const mockTransactions = [
  {
    id: "TXN001",
    type: "purchase",
    eventName: "Rock in Rio 2025",
    ticketType: "Pista Premium",
    amount: -1500.0,
    status: "completed",
    date: "22/04/2025",
  },
  {
    id: "TXN002",
    type: "sale",
    eventName: "Lollapalooza 2025",
    ticketType: "VIP",
    amount: 800.0,
    status: "completed",
    date: "21/04/2025",
  },
]

const mockSales = [
  {
    id: "SALE001",
    event: { name: "Festival de Verão 2025" },
    ticketType: "VIP",
    quantity: 1,
    total: 800.0,
    status: "completed",
    date: "2025-04-20T16:30:00",
    user: { name: "Maria Silva" },
  },
]

export default function OrdersPage() {
  const router = useRouter()
  const { user, transactions = [], orders = [], sales = [], isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("transactions")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Filter transactions based on selected filters
  const filteredTransactions =
    transactions?.filter((transaction) => {
      if (statusFilter !== "all" && transaction.status !== statusFilter) return false
      return true
    }) || []

  const filteredOrders =
    orders?.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false
      return true
    }) || []

  const filteredSales =
    sales?.filter((sale) => {
      if (statusFilter !== "all" && sale.status !== statusFilter) return false
      return true
    }) || []

  // Calculate balance
  const balance = user?.balance || 2500.0
  const pendingBalance = user?.pendingBalance || 500.0

  const handleWithdrawal = () => {
    // Add withdrawal logic here
    setShowWithdrawalForm(false)
    setWithdrawalAmount("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header/Navigation */}
      <header className="bg-black sticky top-0 z-10 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-black rounded"></div>
            </div>
            <span className="text-white text-2xl font-bold">reticket</span>
          </a>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <a href="#" className="text-white text-sm">
              Como Funciona
            </a>
            <a href="#" className="text-white text-sm">
              WhatsApp
            </a>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-transparent border border-primary text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold"
                >
                  <User className="w-4 h-4" />
                  {user.name.split(" ")[0]}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={showUserMenu ? "transform rotate-180" : ""}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg min-w-[200px] z-50">
                    <div className="p-3 border-b border-zinc-700">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>

                    <a href="/account" className="block px-3 py-2 text-white hover:bg-zinc-800 text-sm">
                      Minha Conta
                    </a>

                    <a href="/account/orders" className="block px-3 py-2 text-white hover:bg-zinc-800 text-sm">
                      Meus Pedidos
                    </a>

                    {user.isAdmin && (
                      <a href="/admin" className="block px-3 py-2 text-blue-500 hover:bg-zinc-800 text-sm">
                        Painel Admin
                      </a>
                    )}

                    <div className="border-t border-zinc-700 mt-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full px-3 py-2 text-red-500 hover:bg-zinc-800 text-left text-sm"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <AccountSidebar />
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <h1 className="text-3xl font-bold text-white mb-6">Meus Pedidos</h1>

            {/* Balance Card */}
            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Saldo Disponível</h2>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(balance)}</p>
                  {pendingBalance > 0 && (
                    <p className="text-gray-400 text-sm mt-1">+ {formatCurrency(pendingBalance)} pendente</p>
                  )}
                </div>

                {balance > 0 && (
                  <div className="mt-4 md:mt-0">
                    {!showWithdrawalForm ? (
                      <Button
                        onClick={() => setShowWithdrawalForm(true)}
                        className="bg-primary hover:bg-blue-600 text-black"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Sacar Saldo
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            placeholder="Valor do saque"
                            className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white"
                          />
                          <Button
                            onClick={handleWithdrawal}
                            className="bg-primary hover:bg-blue-600 text-black"
                            disabled={!withdrawalAmount || !selectedPaymentMethod}
                          >
                            Sacar
                          </Button>
                        </div>

                        {!selectedPaymentMethod ? (
                          <div className="flex justify-between items-center p-2 bg-zinc-800 rounded-md">
                            <span className="text-sm text-white">Nenhum método de pagamento selecionado</span>
                            <Button variant="outline" size="sm" className="border-zinc-700 text-white bg-transparent">
                              Selecionar Método
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center p-2 bg-zinc-800 rounded-md">
                            <div className="flex items-center">
                              {selectedPaymentMethod.method === "pix" && (
                                <QrCode className="w-4 h-4 mr-2 text-primary" />
                              )}
                              {selectedPaymentMethod.method === "bank" && (
                                <Landmark className="w-4 h-4 mr-2 text-primary" />
                              )}
                              {selectedPaymentMethod.method === "card" && (
                                <CreditCard className="w-4 h-4 mr-2 text-primary" />
                              )}
                              <span className="text-sm text-white">
                                {selectedPaymentMethod.method === "pix"
                                  ? `PIX: ${selectedPaymentMethod.details.pixKey}`
                                  : selectedPaymentMethod.method === "bank"
                                    ? `Banco: ${selectedPaymentMethod.details.bankName}`
                                    : "Cartão de Crédito"}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="text-gray-400 hover:text-white"
                            >
                              Alterar
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="purchases" className="mb-6" onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <TabsList className="bg-zinc-900 border-b border-zinc-800 rounded-none p-0">
                  <TabsTrigger
                    value="transactions"
                    className={`rounded-none border-b-2 px-4 py-2 ${
                      activeTab === "transactions" ? "border-primary text-primary" : "border-transparent text-gray-400"
                    }`}
                  >
                    Transações
                  </TabsTrigger>
                  <TabsTrigger
                    value="purchases"
                    className={`rounded-none border-b-2 px-4 py-2 ${
                      activeTab === "purchases" ? "border-primary text-primary" : "border-transparent text-gray-400"
                    }`}
                  >
                    Compras
                  </TabsTrigger>
                  <TabsTrigger
                    value="sales"
                    className={`rounded-none border-b-2 px-4 py-2 ${
                      activeTab === "sales" ? "border-primary text-primary" : "border-transparent text-gray-400"
                    }`}
                  >
                    Vendas
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 md:mt-0 flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </div>

              <TabsContent value="transactions" className="pt-4">
                <div className="space-y-4">
                  {mockTransactions.length > 0 ? (
                    mockTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              {transaction.type === "purchase" && (
                                <ArrowUpFromLine className="w-5 h-5 text-red-500 mr-2" />
                              )}
                              {transaction.type === "sale" && (
                                <ArrowDownToLine className="w-5 h-5 text-green-500 mr-2" />
                              )}
                              <h3 className="text-white font-medium">
                                {transaction.type === "purchase" ? "Compra" : "Venda"}
                              </h3>
                            </div>
                            {transaction.eventName && <p className="text-gray-300 mt-1">{transaction.eventName}</p>}
                            {transaction.ticketType && (
                              <p className="text-gray-400 text-sm">{transaction.ticketType}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                              {transaction.amount > 0 ? "+" : ""}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </p>
                            <div className="flex items-center justify-end mt-1">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-gray-400 text-xs">{transaction.date}</p>
                            </div>
                            <span
                              className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                transaction.status === "completed"
                                  ? "bg-green-900 bg-opacity-20 text-green-500"
                                  : transaction.status === "pending"
                                    ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                    : "bg-red-900 bg-opacity-20 text-red-500"
                              }`}
                            >
                              {transaction.status === "completed"
                                ? "Concluído"
                                : transaction.status === "pending"
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
                  ) : (
                    <div className="bg-zinc-900 rounded-lg p-8 text-center">
                      <p className="text-gray-400">Nenhuma transação encontrada.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="purchases" className="pt-4">
                <div className="space-y-4">
                  {mockOrders.length > 0 ? (
                    mockOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">{order.event.name}</h3>
                            <p className="text-gray-400 text-sm">{order.ticketType}</p>
                            <p className="text-gray-400 text-sm mt-1">Quantidade: {order.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{formatCurrency(order.total)}</p>
                            <div className="flex items-center justify-end mt-1">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-gray-400 text-xs">
                                {new Date(order.date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <span
                              className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                order.status === "completed"
                                  ? "bg-green-900 bg-opacity-20 text-green-500"
                                  : order.status === "pending"
                                    ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                    : "bg-red-900 bg-opacity-20 text-red-500"
                              }`}
                            >
                              {order.status === "completed"
                                ? "Concluído"
                                : order.status === "pending"
                                  ? "Pendente"
                                  : "Falha"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                          <p className="text-gray-400 text-xs">Pedido: {order.id}</p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Baixar Ingresso
                            </Button>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-zinc-900 rounded-lg p-8 text-center">
                      <p className="text-gray-400">Nenhuma compra encontrada.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sales" className="pt-4">
                <div className="space-y-4">
                  {mockSales.length > 0 ? (
                    mockSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">{sale.event.name}</h3>
                            <p className="text-gray-400 text-sm">{sale.ticketType}</p>
                            <p className="text-gray-400 text-sm mt-1">Quantidade: {sale.quantity}</p>
                            <p className="text-gray-400 text-sm">Comprador: {sale.user.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">+{formatCurrency(sale.total)}</p>
                            <div className="flex items-center justify-end mt-1">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-gray-400 text-xs">{new Date(sale.date).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <span
                              className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                sale.status === "completed"
                                  ? "bg-green-900 bg-opacity-20 text-green-500"
                                  : sale.status === "pending"
                                    ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                    : "bg-red-900 bg-opacity-20 text-red-500"
                              }`}
                            >
                              {sale.status === "completed"
                                ? "Concluído"
                                : sale.status === "pending"
                                  ? "Pendente"
                                  : "Cancelado"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                          <p className="text-gray-400 text-xs">Venda: {sale.id}</p>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-zinc-900 rounded-lg p-8 text-center">
                      <p className="text-gray-400">Nenhuma venda encontrada.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
