"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AccountSidebar } from "@/components/account-sidebar"
import { Button } from "@/components/ui/button"
import { Shield, Upload, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function VerificationPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // State
  const [idFile, setIdFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // Estados para saldo
  const [realBalance, setRealBalance] = useState(0)
  const [realPendingBalance, setRealPendingBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

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

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!idFile || !selfieFile || !addressFile) {
      setError("Por favor, envie todos os documentos necessários")
      return
    }

    setIsSubmitting(true)

    try {
      // Simular envio de verificação
      console.log("Enviando documentos para verificação...")
      setSuccess(true)
    } catch (err) {
      setError("Ocorreu um erro ao enviar os documentos. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel verification
  const handleCancelVerification = async () => {
    setIsSubmitting(true)

    try {
      // Simular cancelamento de verificação
      console.log("Cancelando verificação...")
      setIdFile(null)
      setSelfieFile(null)
      setAddressFile(null)
      setSuccess(false)
    } catch (err) {
      setError("Ocorreu um erro ao cancelar a verificação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <AccountSidebar balance={realBalance} pendingBalance={realPendingBalance} />
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <h1 className="text-3xl font-bold text-foreground mb-6">Verificação de Vendedor</h1>

            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Status de Verificação
              </h2>

              <div className="bg-accent rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  {user?.verificationStatus === "verified" ? (
                    <div className="bg-green-900 bg-opacity-20 p-2 rounded-full mr-4">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  ) : user?.verificationStatus === "pending" ? (
                    <div className="bg-yellow-900 bg-opacity-20 p-2 rounded-full mr-4">
                      <Clock className="w-6 h-6 text-yellow-500" />
                    </div>
                  ) : (
                    <div className="bg-primary bg-opacity-20 p-2 rounded-full mr-4">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-foreground font-medium mb-1">
                      {user?.verificationStatus === "verified"
                        ? "Verificado"
                        : user?.verificationStatus === "pending"
                          ? "Verificação Pendente"
                          : "Não Verificado"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {user?.verificationStatus === "verified"
                        ? "Sua conta foi verificada. Você pode vender ingressos com confiança."
                        : user?.verificationStatus === "pending"
                          ? "Sua solicitação de verificação está sendo analisada. Isso pode levar até 48 horas."
                          : "Verifique sua identidade para se tornar um vendedor verificado."}
                    </p>
                    {user?.verificationStatus === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelVerification}
                        disabled={isSubmitting}
                        className="border-border text-foreground hover:bg-accent"
                      >
                        Cancelar Verificação
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {!user?.verificationStatus && !success && (
                <>
                  <p className="text-muted-foreground mb-6">
                    Para se tornar um vendedor verificado, precisamos confirmar sua identidade. Por favor, envie os
                    seguintes documentos:
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ID Document */}
                    <div className="bg-accent rounded-lg p-4">
                      <h3 className="text-foreground font-medium mb-2">Documento de Identidade</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Envie uma foto clara do seu RG, CNH ou Passaporte (frente e verso).
                      </p>
                      <div className="flex items-center">
                        <label
                          htmlFor="id-upload"
                          className="flex items-center justify-center px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-zinc-700 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-sm text-foreground">{idFile ? idFile.name : "Selecionar Arquivo"}</span>
                          <input
                            id="id-upload"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setIdFile)}
                          />
                        </label>
                        {idFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIdFile(null)}
                            className="ml-2 text-red-500 hover:text-red-400 hover:bg-transparent"
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Selfie */}
                    <div className="bg-accent rounded-lg p-4">
                      <h3 className="text-foreground font-medium mb-2">Selfie com Documento</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Envie uma selfie sua segurando o documento de identidade ao lado do rosto.
                      </p>
                      <div className="flex items-center">
                        <label
                          htmlFor="selfie-upload"
                          className="flex items-center justify-center px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-zinc-700 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-sm text-foreground">
                            {selfieFile ? selfieFile.name : "Selecionar Arquivo"}
                          </span>
                          <input
                            id="selfie-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setSelfieFile)}
                          />
                        </label>
                        {selfieFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelfieFile(null)}
                            className="ml-2 text-red-500 hover:text-red-400 hover:bg-transparent"
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Proof of Address */}
                    <div className="bg-accent rounded-lg p-4">
                      <h3 className="text-foreground font-medium mb-2">Comprovante de Residência</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Envie um comprovante de residência recente (conta de luz, água, telefone, etc.).
                      </p>
                      <div className="flex items-center">
                        <label
                          htmlFor="address-upload"
                          className="flex items-center justify-center px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-zinc-700 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-sm text-foreground">
                            {addressFile ? addressFile.name : "Selecionar Arquivo"}
                          </span>
                          <input
                            id="address-upload"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setAddressFile)}
                          />
                        </label>
                        {addressFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddressFile(null)}
                            className="ml-2 text-red-500 hover:text-red-400 hover:bg-transparent"
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-900 bg-opacity-20 text-red-500 p-3 rounded-lg border border-red-800">
                        {String(error)}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-blue-600 text-black"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Documentos"}
                    </Button>
                  </form>
                </>
              )}

              {success && (
                <div className="bg-green-900 bg-opacity-10 border border-green-800 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-green-900 bg-opacity-20 p-3 rounded-full mb-4">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Documentos Enviados com Sucesso</h3>
                    <p className="text-muted-foreground mb-4">
                      Seus documentos foram enviados e estão sendo analisados. Você receberá uma notificação quando a
                      verificação for concluída.
                    </p>
                    <div className="bg-accent p-4 rounded-lg w-full max-w-md">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-primary mr-2" />
                        <div>
                          <h4 className="text-foreground font-medium">Tempo Estimado</h4>
                          <p className="text-muted-foreground text-sm">A verificação pode levar até 48 horas.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user?.verificationStatus === "verified" && (
                <div className="bg-green-900 bg-opacity-10 border border-green-800 rounded-lg p-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-green-900 bg-opacity-20 p-3 rounded-full mb-4">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Conta Verificada</h3>
                    <p className="text-muted-foreground mb-4">
                      Parabéns! Sua conta foi verificada. Agora você pode vender ingressos com confiança.
                    </p>
                    <div className="bg-accent p-4 rounded-lg w-full max-w-md">
                      <h4 className="text-foreground font-medium mb-2">Benefícios de ser um Vendedor Verificado:</h4>
                      <ul className="text-muted-foreground text-sm space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span>Maior visibilidade nos resultados de busca</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span>Badge de verificação no seu perfil</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span>Taxas reduzidas em vendas</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                          <span>Prioridade no suporte ao cliente</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {user?.verificationStatus === "pending" && (
                <div className="bg-yellow-900 bg-opacity-10 border border-yellow-800 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-yellow-500 mr-4">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-yellow-500 font-medium mb-1">Verificação em Andamento</h3>
                      <p className="text-muted-foreground text-sm">
                        Sua solicitação de verificação está sendo analisada. Isso pode levar até 48 horas. Você receberá
                        uma notificação quando a verificação for concluída.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
