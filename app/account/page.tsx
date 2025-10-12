"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccountSidebar } from "@/components/AccountSidebar"
import Header from "@/components/Header"
import { CheckCircle, Clock, Edit, Mail, Phone, MapPin, Shield, User, CreditCard, Bell, Lock, Upload, Trash2, Camera } from "lucide-react"
import { validateImageFile, uploadImage } from "@/lib/upload"

export default function AccountPage() {
  const { user, updateUser, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
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
  const [imageLoading, setImageLoading] = useState(false)
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
      
      // Garantir que a imagem de perfil seja carregada corretamente
      if (user.profileImage && user.profileImage.trim() !== "") {
        // Verificar se é uma URL válida
        try {
          new URL(user.profileImage)
          setProfileImage(user.profileImage)
        } catch (error) {
          console.error('URL de imagem inválida:', user.profileImage)
          setProfileImage("")
        }
      } else {
        setProfileImage("")
      }
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
          <div className="animate-spin rounded h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, não renderiza nada (será redirecionado)
  if (!isAuthenticated) {
    return null
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
      <Header />

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
            <div className="bg-zinc-900 rounded p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-zinc-800 rounded overflow-hidden relative">
                    {profileImage ? (
                      <>
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                            <div className="animate-spin rounded h-6 w-6 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onLoadStart={() => {
                            setImageLoading(true)
                          }}
                          onError={(e) => {
                            console.error('Erro ao carregar imagem de perfil:', profileImage)
                            setImageLoading(false)
                            setProfileImage("")
                          }}
                          onLoad={() => {
                            setImageLoading(false)
                          }}
                          crossOrigin="anonymous"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  {profileImage && (
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center transition-colors"
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
                      <div className="bg-green-900 bg-opacity-20 text-green-500 px-2 py-1 rounded text-xs flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificado
                      </div>
                    )}
                    {user?.verificationStatus === "pending" && (
                      <div className="bg-yellow-900 bg-opacity-20 text-yellow-500 px-2 py-1 rounded text-xs flex items-center">
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
                      className="border-zinc-700 rounded text-white bg-transparent hover:bg-zinc-800"
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
                      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded">
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
                      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="text-white">{user?.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-gray-300">
                      CPF
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-white">{user?.cpfFormatted || "Não informado"}</span>
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
                      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded">
                        <Phone className="w-5 h-5 text-primary" />
                        <span className="text-white">{user?.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-gray-300">
                      País
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-white">{user?.country || "Não informado"}</span>
                      <span className="text-xs text-gray-500 ml-auto">Não editável</span>
                    </div>
                  </div>
                </div>

                {user?.verificationStatus !== "verified" && (
                  <div className="flex items-center gap-3 p-3 bg-blue-900 bg-opacity-20 border border-blue-800 rounded">
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
                  <div className="mb-4 p-3 bg-green-900 bg-opacity-20 border border-green-800 rounded">
                    <p className="text-green-400 text-sm">{saveMessage}</p>
                  </div>
                )}
                
                {saveError && (
                  <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-zinc-900 rounded p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-900 bg-opacity-20 rounded">
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

              <div className="bg-zinc-900 rounded p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-900 bg-opacity-20 rounded">
                    <CreditCard className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Tipo de Conta</h3>
                    <p className="text-gray-400 text-sm">{user?.isAdmin ? "Administrador" : "Usuário"}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Upload de Foto */}
      {showPhotoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded p-6 max-w-md w-full border border-zinc-700">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Nova Foto</h3>
            
            {/* Preview da foto */}
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-zinc-800 rounded overflow-hidden">
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
              <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded">
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
