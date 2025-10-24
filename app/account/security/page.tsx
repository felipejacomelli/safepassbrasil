"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { AccountSidebar } from "@/components/AccountSidebar"
import { Shield, AlertTriangle, CheckCircle, Copy, RefreshCw } from "lucide-react"

export default function SecurityPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [setupStep, setSetupStep] = useState(1)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activities, setActivities] = useState<any[]>([])
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  
  // Estados para saldo
  const [realBalance, setRealBalance] = useState(0)
  const [realPendingBalance, setRealPendingBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const status = await authApi.get2FAStatus()
        setIs2FAEnabled(status.is_2fa_enabled)
      } catch (error) {
        console.error("Erro ao buscar status de 2FA:", error)
      }
    }
    fetchData()
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await authApi.getLoginHistory()
        setActivities(data.map(item => ({
          date: new Date(item.login_time).toLocaleString("pt-BR"),
          device: item.device || "Desconhecido",
          location: item.location || "Desconhecida",
          current: false,
        })))
      } catch (error) {
        console.error("Erro ao buscar histórico de atividades:", error)
      }
    }
    fetchActivities()
  }, [])

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

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
      try {
        const response = await authApi.disable2FA()
        if (response.success) {
          setIs2FAEnabled(false)
          setShowSetup(false)
          setSuccess("Autenticação em duas etapas desativada com sucesso.")
        }
      } catch (error) {
        setError("Erro ao desativar 2FA.")
        console.error("Error disabling 2FA:", error)
      }
    } else {
      setShowSetup(true)
      setSetupStep(1)
      setError("")
      setSuccess("")
    }
  }

  const verifyAndEnable2FA = async () => {
    if (verificationCode.length !== 6) {
      setError("O código deve ter 6 dígitos")
      return
    }

    try {
      const response = await authApi.verify2FA(verificationCode)
      if (response.success) {
        setIs2FAEnabled(true)
        setBackupCodes(response.backup_codes || [])
        setShowSetup(false)
        setSuccess("Autenticação em duas etapas ativada com sucesso!")
        setError("")
        setVerificationCode("")
      } else {
        setError("Código inválido. Tente novamente.")
      }
    } catch (error) {
      setError("Código inválido. Tente novamente.")
      console.error("Error verifying 2FA:", error)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    setSuccess("Códigos de backup copiados para a área de transferência")
  }

  const regenerateBackupCodes = async () => {
    try {
      const response = await authApi.regenerateBackupCodes()
      setBackupCodes(response.backup_codes)
      setSuccess("Novos códigos de backup gerados")
    } catch (error) {
      setError("Erro ao regenerar códigos de backup.")
      console.error("Error regenerating backup codes:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
              Safe Pass
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
                </button>
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
            <h1 className="text-3xl font-bold text-foreground mb-6">Segurança da Conta</h1>

            {/* 2FA Configuration Card */}
            <div className="bg-card rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold text-foreground">Verificação em Duas Etapas</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Adicione uma camada extra de segurança à sua conta exigindo um código de verificação além da senha.
              </p>

              {success && (
                <Alert className="mb-4 bg-green-900 bg-opacity-20 border border-green-800 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-400">Sucesso</AlertTitle>
                  <AlertDescription className="text-green-300">{success}</AlertDescription>
                </Alert>
              )}

              {!showSetup ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Autenticação em duas etapas</p>
                    <p className="text-sm text-muted-foreground">
                      {is2FAEnabled
                        ? "Ativada. Sua conta está protegida com autenticação em duas etapas."
                        : "Desativada. Sua conta está vulnerável a ataques."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{is2FAEnabled ? "Ativado" : "Desativado"}</span>
                    <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">Configurar autenticação em duas etapas</h3>

                    {setupStep === 1 && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Passo 1: Escaneie o código QR com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
                        </p>

                        {qrCode ? (
                          <div className="flex justify-center p-4 bg-accent rounded-lg">
                            <img
                              src={`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(qrCode)}`}
                              alt="QR Code para configuração 2FA"
                              className="w-48 h-48"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center p-4 bg-accent rounded-lg">
                            <div className="w-48 h-48 bg-card border border-border flex items-center justify-center">
                              <p className="text-muted-foreground">Clique em "Gerar QR Code" para começar</p>
                            </div>
                          </div>
                        )}

                        {secret && (
                          <p className="text-sm text-muted-foreground">
                            Não consegue escanear? Use este código secreto no seu aplicativo:{" "}
                            <span className="font-mono bg-accent text-foreground px-2 py-1 rounded">{secret}</span>
                          </p>
                        )}

                        <Button 
                          onClick={async () => {
                            try {
                              const response = await authApi.setup2FA()
                              setSecret(response.secret)
                              setQrCode(response.otpauth_url)
                              setSetupStep(2)
                            } catch (error) {
                              setError("Erro ao configurar 2FA.")
                              console.error("Error setting up 2FA:", error)
                            }
                          }}
                          disabled={!!qrCode}
                          className="bg-primary hover:bg-blue-600 text-black"
                        >
                          {qrCode ? "Continuar" : "Gerar QR Code"}
                        </Button>
                        
                        {qrCode && (
                          <Button onClick={() => setSetupStep(2)} className="bg-primary hover:bg-blue-600 text-black">
                            Continuar
                          </Button>
                        )}
                      </div>
                    )}

                    {setupStep === 2 && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">Passo 2: Digite o código de 6 dígitos do seu aplicativo autenticador</p>

                        {error && (
                          <Alert className="mb-4 bg-red-900 bg-opacity-20 border border-red-800 rounded-md">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <AlertTitle className="text-red-400">Erro</AlertTitle>
                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="grid gap-2">
                          <Label htmlFor="verificationCode" className="text-muted-foreground">Código de verificação</Label>
                          <Input
                            id="verificationCode"
                            placeholder="123456"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            className="font-mono text-center text-lg bg-accent border-border text-foreground"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setSetupStep(1)} className="border-border text-foreground bg-transparent">
                            Voltar
                          </Button>
                          <Button onClick={verifyAndEnable2FA} className="bg-primary hover:bg-blue-600 text-black">Verificar e ativar</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Backup Codes Card */}
            {backupCodes.length > 0 && (
              <div className="bg-card rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-foreground mb-2">Códigos de backup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Guarde estes códigos em um lugar seguro. Você pode usá-los para acessar sua conta caso perca acesso
                  ao seu dispositivo autenticador.
                </p>

                <div className="bg-accent p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm bg-card text-foreground p-2 rounded border border-border">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyBackupCodes} className="border-border text-foreground bg-transparent">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar códigos
                  </Button>
                  <Button variant="outline" size="sm" onClick={regenerateBackupCodes} className="border-border text-foreground bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Gerar novos códigos
                  </Button>
                </div>
              </div>
            )}

            {/* Activity History Card */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Histórico de atividades</h3>
              <p className="text-muted-foreground mb-4">Monitore os acessos recentes à sua conta.</p>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{activity.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.device} • {activity.location}
                      </p>
                    </div>
                    {activity.current && (
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">Sessão atual</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
