"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AccountSidebar } from "@/components/account-sidebar"
import { PaymentMethodSelector } from "@/components/payment-method-selector"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
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
} from "lucide-react"

export default function OrdersPage() {
  const router = useRouter()
  const { user, transactions = [], orders = [], sales = [], isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("transactions")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

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
  const balance = user?.balance || 0
  const pendingBalance = user?.pendingBalance || 0

  const handleWithdrawal = () => {
    alert(`Solicitação de saque de R$ ${withdrawalAmount} enviada com sucesso!`)
    setWithdrawalAmount("")
    setShowWithdrawalForm(false)
  }

  const handlePaymentMethodSelect = (method, details) => {
    setSelectedPaymentMethod({ method, details })
  }

  // Format currency
  const formatCurrency = (value) => {
    return `R$ ${Math.abs(value).toFixed(2).replace(".", ",")}`
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <AccountSidebar />
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
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
                          <PaymentMethodSelector
                            onSelect={handlePaymentMethodSelect}
                            buttonText="Selecionar método de pagamento"
                            buttonVariant="outline"
                            buttonClassName="w-full border-zinc-700 text-white"
                          />
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
            <Tabs defaultValue="transactions" className="mb-6" onValueChange={setActiveTab}>
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
                  <Button variant="outline" size="sm" className="border-zinc-700 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </div>

              <TabsContent value="transactions" className="pt-4">
                <div className="space-y-4">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
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
                              {transaction.type === "withdrawal" && (
                                <Download className="w-5 h-5 text-yellow-500 mr-2" />
                              )}
                              <h3 className="text-white font-medium">
                                {transaction.type === "purchase"
                                  ? "Compra"
                                  : transaction.type === "sale"
                                    ? "Venda"
                                    : "Saque"}
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
                              {formatCurrency(transaction.amount)}
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
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">{order.eventName}</h3>
                            <p className="text-gray-400 text-sm">{order.ticketType}</p>
                            <p className="text-gray-400 text-sm mt-1">Quantidade: {order.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{formatCurrency(order.amount)}</p>
                            <div className="flex items-center justify-end mt-1">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-gray-400 text-xs">{order.date}</p>
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
                                  : "Cancelado"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                          <p className="text-gray-400 text-xs">Pedido: {order.id}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-zinc-700 text-white">
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
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">{sale.eventName}</h3>
                            <p className="text-gray-400 text-sm">{sale.ticketType}</p>
                            <p className="text-gray-400 text-sm mt-1">Quantidade: {sale.quantity}</p>
                            <p className="text-gray-400 text-sm">Comprador: {sale.buyerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">+{formatCurrency(sale.amount)}</p>
                            <div className="flex items-center justify-end mt-1">
                              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-gray-400 text-xs">{sale.date}</p>
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
