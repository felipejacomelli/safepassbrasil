"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AccountSidebar } from "@/components/account-sidebar"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, MapPin, Edit, Shield, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

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
            <h1 className="text-3xl font-bold text-white mb-6">Meu Perfil</h1>

            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-zinc-800 rounded-full overflow-hidden">
                  <img
                    src={
                      user?.profileImage ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
                  <Button variant="outline" size="sm" className="mt-2 border-zinc-700 text-white">
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
                      className="ml-auto border-primary text-primary hover:bg-blue-900 hover:bg-opacity-20"
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
          </div>
        </div>
      </div>
    </div>
  )
}
