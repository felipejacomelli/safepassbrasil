"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccountSidebar } from "@/components/AccountSidebar"
import { CheckCircle, Clock, Edit, Mail, Phone, MapPin, Shield, User, CreditCard, Bell, Lock, Upload, Trash2, Camera } from "lucide-react"
import { formatCpf } from "@/utils/cpf"
import { validateImageFile, uploadImage } from "@/lib/upload"

export default function AccountPage() {
  const { user, logout, updateUser, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [phoneError, setPhoneError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  
  // Estados para saldo
  const [realBalance, setRealBalance] = useState(0)
  const [realPendingBalance, setRealPendingBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // Estados para upload de foto
  const [profileImage, setProfileImage] = useState<string>("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, isLoading, router])

  // Atualizar formData quando o usuário for carregado
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
      setProfileImage(user.profileImage || "")
    }
  }, [user])

  // Carregar dados de saldo
  useEffect(() => {
    const loadBalanceData = async () => {
      if (!user?.id) return
      
      setLoading(true)
      
      try {
        const apiRequest = async (endpoint: string) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          })
          return response
        }

        // Carregar vendas (tickets à venda pelo usuário - sem comprador)
        const salesResponse = await apiRequest(`/api/tickets/`)
        if (salesResponse.ok) {
          const salesData = await salesResponse.json()
          
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
          
          // Calcular saldo disponível baseado nos tickets vendidos efetivamente
          const totalSoldBalance = soldData.tickets?.reduce((sum: number, ticket: any) => {
            return sum + (parseFloat(ticket.price) * ticket.quantity)
          }, 0) || 0
          
          setRealBalance(totalSoldBalance)
        }
      } catch (error) {
        console.error('Erro ao carregar dados de saldo:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBalanceData()
  }, [user])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, não renderiza nada (será redirecionado)
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    router.push("/") // Redireciona para página inicial após logout
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

  const validateEmail = (email: string) => {
    if (!email) return "Email é obrigatório"
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Email inválido"
    }
    
    return ""
  }

  const handleSave = async () => {
    // Limpar mensagens anteriores
    setSaveMessage("")
    setSaveError("")
    setPhoneError("")
    setEmailError("")
    
    // Validar email antes de salvar
    const emailValidationError = validateEmail(formData.email)
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }
    
    // Validar telefone antes de salvar
    const phoneValidationError = validatePhone(formData.phone)
    if (phoneValidationError) {
      setPhoneError(phoneValidationError)
      return
    }
    
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
    setEmailError("")
    
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

  // Função para abrir seletor de arquivo
  const handleChangePhotoClick = () => {
    fileInputRef.current?.click()
  }

  // Função para lidar com seleção de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limpar estados anteriores
    setPhotoError("")
    
    // Validar arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setPhotoError(validation.error || "Arquivo inválido")
      return
    }

    // Criar preview local
    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string)
      setShowPhotoDialog(true)
    }
    reader.readAsDataURL(file)
  }

  // Função para confirmar upload da foto
  const handleConfirmPhotoUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    setPhotoError("")

    try {
      // Fazer upload da imagem usando a mesma função de eventos
      const uploadResult = await uploadImage(file)
      
      if (!uploadResult.success) {
        setPhotoError(uploadResult.error || "Erro no upload")
        return
      }

      // Atualizar foto de perfil no backend
      const result = await updateUser({
        profileImage: uploadResult.url,
      })

      if (result.success) {
        setProfileImage(uploadResult.url || "")
        setShowPhotoDialog(false)
        setPhotoPreview("")
        setSaveMessage("Foto de perfil atualizada com sucesso!")
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setPhotoError(result.message || "Erro ao atualizar foto de perfil")
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      setPhotoError("Erro inesperado ao fazer upload")
    } finally {
      setIsUploadingPhoto(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Função para cancelar upload
  const handleCancelPhotoUpload = () => {
    setShowPhotoDialog(false)
    setPhotoPreview("")
    setPhotoError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Função para remover foto
  const handleRemovePhoto = async () => {
    try {
      const result = await updateUser({
        profileImage: "",
      })

      if (result.success) {
        setProfileImage("")
        setSaveMessage("Foto de perfil removida com sucesso!")
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setPhotoError(result.message || "Erro ao remover foto de perfil")
      }
    } catch (error) {
      console.error("Erro ao remover foto:", error)
      setPhotoError("Erro inesperado ao remover foto")
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
          <Link
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
          </Link>

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
              {/* Como Funciona */}
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

                    <Link
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
                    </Link>

                    <Link
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
                    </Link>

                    {user.isAdmin && (
                      <Link
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
                      </Link>
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
            <AccountSidebar balance={realBalance} pendingBalance={realPendingBalance} />
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <h1 className="text-3xl font-bold text-white mb-6">Minha Conta</h1>

            {/* Profile Card */}
            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-zinc-800 rounded-full overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  {profileImage && (
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  )}
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
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800"
                      onClick={handleChangePhotoClick}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Alterar foto
                    </Button>
                  </div>
                  {photoError && (
                    <p className="text-red-400 text-sm mt-2">{photoError}</p>
                  )}
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
                      <div>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            // Limpar erro quando o usuário começar a digitar
                            if (emailError) setEmailError("")
                          }}
                          className={`bg-zinc-800 border-zinc-700 text-white ${emailError ? 'border-red-500' : ''}`}
                          placeholder="seu@email.com"
                        />
                        {emailError && (
                          <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                      </div>
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
                      <span className="text-xs text-gray-500 ml-auto">Não editável</span>
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
                      <span className="text-xs text-gray-500 ml-auto">Não editável</span>
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

      {/* Modal de Confirmação de Upload de Foto */}
      {showPhotoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-zinc-700">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Nova Foto</h3>
            
            {/* Preview da foto */}
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-zinc-800 rounded-full overflow-hidden">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Mensagem de erro */}
            {photoError && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-md">
                <p className="text-red-400 text-sm">{photoError}</p>
              </div>
            )}

            {/* Informação */}
            <p className="text-gray-400 text-sm mb-6">
              Deseja atualizar sua foto de perfil com esta imagem?
            </p>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                onClick={handleCancelPhotoUpload}
                variant="outline"
                className="flex-1 border-zinc-700 text-white bg-transparent hover:bg-zinc-800"
                disabled={isUploadingPhoto}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPhotoUpload}
                className="flex-1 bg-primary hover:bg-blue-600 text-black"
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
