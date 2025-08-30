"use client"

import { useState } from "react"
import { Download, CheckCircle, Calendar, User, Clock, Edit, Mail, Phone, MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import { useAuth } from "@/hooks/useAuth"
import { AccountSidebar } from "@/components/AccountSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  QrCode,
  Landmark,
  CreditCard,
  Filter,
  ExternalLink,
  ArrowUpFromLine,
  ArrowDownToLine,
} from "lucide-react"
import { formatCurrency } from "@/utils/formatCurrency"

// Mock orders data
const mockOrders = [
  {
    id: "ORD123456",
    user: {
      id: "1",
      name: "João Silva",
      email: "joao.silva@example.com",
    },
    event: {
      id: "rock-in-rio-2025",
      name: "Rock in Rio 2025",
    },
    ticketType: "Pista Premium",
    quantity: 2,
    total: 1500.0,
    status: "completed",
    paymentMethod: "credit-card",
    date: "2025-04-22T14:30:00",
  },
  {
    id: "ORD123457",
    user: {
      id: "2",
      name: "Maria Oliveira",
      email: "maria.oliveira@example.com",
    },
    event: {
      id: "lollapalooza-2025",
      name: "Lollapalooza 2025",
    },
    ticketType: "Pista",
    quantity: 1,
    total: 450.0,
    status: "completed",
    paymentMethod: "pix",
    date: "2025-04-21T10:15:00",
  },
  {
    id: "ORD123458",
    user: {
      id: "3",
      name: "Pedro Santos",
      email: "pedro.santos@example.com",
    },
    event: {
      id: "festival-de-verao-2025",
      name: "Festival de Verão 2025",
    },
    ticketType: "VIP",
    quantity: 2,
    total: 700.0,
    status: "pending",
    paymentMethod: "bank-transfer",
    date: "2025-04-21T16:45:00",
  },
  {
    id: "ORD123459",
    user: {
      id: "4",
      name: "Ana Costa",
      email: "ana.costa@example.com",
    },
    event: {
      id: "show-metallica-2025",
      name: "Show Metallica",
    },
    ticketType: "Camarote",
    quantity: 1,
    total: 550.0,
    status: "completed",
    paymentMethod: "credit-card",
    date: "2025-04-20T09:30:00",
  },
  {
    id: "ORD123460",
    user: {
      id: "5",
      name: "Lucas Ferreira",
      email: "lucas.ferreira@example.com",
    },
    event: {
      id: "show-bruno-mars-2025",
      name: "Show Bruno Mars",
    },
    ticketType: "Pista",
    quantity: 3,
    total: 1950.0,
    status: "failed",
    paymentMethod: "credit-card",
    date: "2025-04-20T11:20:00",
  },
  {
    id: "ORD123461",
    user: {
      id: "6",
      name: "Juliana Almeida",
      email: "juliana.almeida@example.com",
    },
    event: {
      id: "rock-in-rio-2025",
      name: "Rock in Rio 2025",
    },
    ticketType: "Pista",
    quantity: 2,
    total: 1000.0,
    status: "pending",
    paymentMethod: "boleto",
    date: "2025-04-19T14:10:00",
  },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("transactions")
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const balance = 5000.0
  const pendingBalance = 1000.0
  const filteredTransactions = []
  const filteredSales = []

  const handleLogout = () => {
    // Add logout logic here if needed
    setShowUserMenu(false)
    router.push("/")
  }

  const handleWithdrawal = () => {
    // Add withdrawal logic here if needed
  }

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method)
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(
      (order) =>
        (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.event.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || order.status === statusFilter),
    )
    .sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a]
      const fieldB = b[sortField as keyof typeof b]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      } else if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA
      }
      return 0
    })

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header/Navigation */}
      <header
        style={{
          padding: "16px",
          borderBottom: "1px solid #333",
          position: "sticky",
          top: 0,
          backgroundColor: "black",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                backgroundColor: "#3B82F6",
                padding: "6px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: "black",
                  borderRadius: "4px",
                }}
              />
            </div>
            <span
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              reticket
            </span>
          </a>

          {/* Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <a
              href="#"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Como Funciona
            </a>
            <a
              href="#"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              WhatsApp
            </a>

            {user && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #3B82F6",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {user.name.split(" ")[0]}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                    }}
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
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "8px",
                      backgroundColor: "#18181B",
                      border: "1px solid #3F3F46",
                      borderRadius: "8px",
                      padding: "8px 0",
                      minWidth: "200px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #3F3F46",
                        marginBottom: "8px",
                      }}
                    >
                      <p style={{ fontWeight: "600", marginBottom: "4px", color: "white" }}>{user.name}</p>
                      <p style={{ fontSize: "14px", color: "#A1A1AA" }}>{user.email}</p>
                    </div>

                    <a
                      href="/account"
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent"
                      }}
                    >
                      Minha Conta
                    </a>

                    <a
                      href="/account/orders"
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent"
                      }}
                    >
                      Meus Pedidos
                    </a>

                    {user.isAdmin && (
                      <a
                        href="/admin"
                        style={{
                          display: "block",
                          padding: "12px 16px",
                          color: "#3B82F6",
                          textDecoration: "none",
                          fontSize: "14px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent"
                        }}
                      >
                        Painel Admin
                      </a>
                    )}

                    <div
                      style={{
                        borderTop: "1px solid #3F3F46",
                        marginTop: "8px",
                        paddingTop: "8px",
                      }}
                    >
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "12px 16px",
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#EF4444",
                          textAlign: "left",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent"
                        }}
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
            <h1 className="text-3xl font-bold text-white mb-6">Meu Perfil</h1>

            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-zinc-800 rounded-full overflow-hidden">
                  <img
                    src={
                      user?.profileImage ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                    {user?.verificationStatus === "verified" && (
                      <div className="bg-green-900 bg-opacity-20 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificado
                      </div>
                    )}
                    {user?.verificationStatus === "pending" && (
                      <div className="bg-yellow-900 bg-opacity-20 text-yellow-500 px-2 py-1 rounded-full text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Verificação Pendente
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400">Membro desde {user?.memberSince}</p>
                  <Button variant="outline" size="sm" className="mt-2 border-zinc-700 text-white bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Alterar foto
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-gray-400 text-sm">Nome Completo</p>
                    <p className="text-white">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-gray-400 text-sm">Telefone</p>
                    <p className="text-white">{user?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-gray-400 text-sm">Endereço</p>
                    <p className="text-white">{user?.address}</p>
                  </div>
                </div>

                {user?.verificationStatus !== "verified" && (
                  <div className="flex items-center gap-3 p-3 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-md">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-white font-medium">Verificação de Vendedor</p>
                      <p className="text-gray-300 text-sm">
                        {user?.verificationStatus === "pending"
                          ? "Sua verificação está em análise."
                          : "Verifique sua identidade para se tornar um vendedor verificado."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto border-primary text-primary hover:bg-blue-900 hover:bg-opacity-20 bg-transparent"
                      onClick={() => router.push("/account/verification")}
                    >
                      {user?.verificationStatus === "pending" ? "Ver Status" : "Verificar"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <Button className="bg-primary hover:bg-blue-600 text-black">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>

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
                            <h3 className="text-white font-medium">{order.event.name}</h3>
                            <p className="text-gray-400 text-sm">{order.ticketType}</p>
                            <p className="text-gray-400 text-sm mt-1">Quantidade: {order.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">R$ {order.total.toFixed(2).replace(".", ",")}</p>
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
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
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
                            <p className="font-bold text-green-500">+R$ {sale.total.toFixed(2).replace(".", ",")}</p>
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
