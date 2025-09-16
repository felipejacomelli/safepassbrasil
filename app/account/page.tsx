"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccountSidebar } from "@/components/AccountSidebar"
import { CheckCircle, Clock, Edit, Mail, Phone, MapPin, Shield, User, CreditCard, Bell, Lock } from "lucide-react"
import { formatCpf } from "@/utils/formatCpf"

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [phoneError, setPhoneError] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")

  // Atualizar formData quando o usuário for carregado
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const validatePhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Verifica se tem 10 ou 11 dígitos (formato brasileiro)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return "Telefone deve ter 10 ou 11 dígitos"
    }
    
    // Verifica se é um número válido (não pode ser todos os dígitos iguais)
    if (/^(\d)\1{9,10}$/.test(cleanPhone)) {
      return "Número de telefone inválido"
    }
    
    return ""
  }

  const handleSave = async () => {
    // Limpar mensagens anteriores
    setSaveMessage("")
    setSaveError("")
    
    // Validar telefone antes de salvar
    const phoneValidationError = validatePhone(formData.phone)
    if (phoneValidationError) {
      setPhoneError(phoneValidationError)
      return
    }
    
    setPhoneError("")
    
    // Atualizar perfil usando a API
    try {
      const result = await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      })
      
      if (result.success) {
        setIsEditing(false)
        setSaveMessage(result.message || 'Perfil atualizado com sucesso!')
        // Limpar mensagem após 3 segundos
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setSaveError(result.message || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setSaveError('Erro inesperado ao salvar. Tente novamente.')
    }
  }

  const handleCancel = () => {
    // Limpar mensagens de erro/sucesso
    setSaveMessage("")
    setSaveError("")
    setPhoneError("")
    
    // Restaurar dados originais do usuário
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
    setIsEditing(false)
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
                        ;(e.target as HTMLElement).style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        ;(e.target as HTMLElement).style.backgroundColor = "transparent"
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
                        ;(e.target as HTMLElement).style.backgroundColor = "#27272A"
                      }}
                      onMouseLeave={(e) => {
                        ;(e.target as HTMLElement).style.backgroundColor = "transparent"
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
                          ;(e.target as HTMLElement).style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          ;(e.target as HTMLElement).style.backgroundColor = "transparent"
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
                          ;(e.target as HTMLElement).style.backgroundColor = "#27272A"
                        }}
                        onMouseLeave={(e) => {
                          ;(e.target as HTMLElement).style.backgroundColor = "transparent"
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
            <h1 className="text-3xl font-bold text-white mb-6">Minha Conta</h1>

            {/* Profile Card */}
            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-zinc-800 rounded-full overflow-hidden">
                  <img
                    src={user?.profileImage || "/placeholder.svg?height=100&width=100"}
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

              {/* Account Information Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Nome Completo
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                        <User className="w-5 h-5 text-primary" />
                        <span className="text-white">{user?.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="text-white">{user?.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-gray-300">
                      CPF
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-white">{formatCpf(user?.cpf) || "Não informado"}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-300">
                      Telefone
                    </Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value })
                            // Limpar erro quando o usuário começar a digitar
                            if (phoneError) setPhoneError("")
                          }}
                          className={`bg-zinc-800 border-zinc-700 text-white ${phoneError ? 'border-red-500' : ''}`}
                          placeholder="(11) 99999-9999"
                        />
                        {phoneError && (
                          <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                        <Phone className="w-5 h-5 text-primary" />
                        <span className="text-white">{user?.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-gray-300">
                      País
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-white">{user?.country || "Não informado"}</span>
                    </div>
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
                    >
                      {user?.verificationStatus === "pending" ? "Ver Status" : "Verificar"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                {/* Mensagens de feedback */}
                {saveMessage && (
                  <div className="mb-4 p-3 bg-green-900 bg-opacity-20 border border-green-800 rounded-md">
                    <p className="text-green-400 text-sm">{saveMessage}</p>
                  </div>
                )}
                
                {saveError && (
                  <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-md">
                    <p className="text-red-400 text-sm">{saveError}</p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} className="bg-primary hover:bg-blue-600 text-black">
                        Salvar Alterações
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-zinc-700 text-white bg-transparent"
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary hover:bg-blue-600 text-black"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-900 bg-opacity-20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Conta Verificada</h3>
                    <p className="text-gray-400 text-sm">
                      {user?.verificationStatus === "verified" ? "Verificado" : "Pendente"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900 bg-opacity-20 rounded-lg">
                    <Lock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Autenticação 2FA</h3>
                    <p className="text-gray-400 text-sm">{user?.twoFactorEnabled ? "Ativado" : "Desativado"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-900 bg-opacity-20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Tipo de Conta</h3>
                    <p className="text-gray-400 text-sm">{user?.isAdmin ? "Administrador" : "Usuário"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800 justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Configurações de Segurança
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800 justify-start"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Preferências de Notificação
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800 justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Métodos de Pagamento
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800 justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Verificação de Identidade
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
