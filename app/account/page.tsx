"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AccountSidebar } from "@/components/account-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react"

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading, updateUser } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
  })

  const handleLogout = () => {
    setShowUserMenu(false)
    router.push("/")
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        birthDate: user.birthDate || "",
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        birthDate: user.birthDate || "",
      })
    }
    setIsEditing(false)
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
      {/* Header with User Dropdown */}
      <header className="bg-black sticky top-0 z-10 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-black rounded"></div>
            </div>
            <span className="text-white text-2xl font-bold ml-2">reticket</span>
          </div>

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
                  <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl min-w-[200px] z-50">
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
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Minha Conta</h1>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-blue-600 text-black">
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-primary hover:bg-blue-600 text-black">
                      Salvar
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="(11) 99999-9999"
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Rua, número, bairro, cidade, estado"
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Account Stats */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <h2 className="text-lg font-semibold text-white mb-4">Estatísticas da Conta</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-primary">R$ {user?.balance?.toFixed(2) || "0,00"}</p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Saldo Pendente</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      R$ {user?.pendingBalance?.toFixed(2) || "0,00"}
                    </p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Total de Transações</p>
                    <p className="text-2xl font-bold text-white">{user?.transactions?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
