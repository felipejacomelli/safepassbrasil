"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }

    // Check if user has 2FA enabled
    if (user) {
      setIs2FAEnabled(user.has2FA || false)
    }
  }, [isAuthenticated, router, user])

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      // Disable 2FA flow
      setShowSetup(false)
      setIs2FAEnabled(false)
      setSuccess("Autenticação em duas etapas desativada com sucesso.")
    } else {
      // Enable 2FA flow
      setShowSetup(true)
      generateBackupCodes()
    }
  }

  const generateBackupCodes = () => {
    // In a real app, these would be generated securely on the server
    const codes = Array(10)
      .fill(0)
      .map(
        () =>
          Math.random().toString(36).substring(2, 6).toUpperCase() +
          "-" +
          Math.random().toString(36).substring(2, 6).toUpperCase(),
      )
    setBackupCodes(codes)
  }

  const verifyAndEnable2FA = () => {
    if (verificationCode.length !== 6) {
      setError("O código deve ter 6 dígitos")
      return
    }

    // In a real app, this would verify the code against the TOTP algorithm
    if (verificationCode === "123456") {
      setIs2FAEnabled(true)
      setShowSetup(false)
      setSuccess("Autenticação em duas etapas ativada com sucesso!")
      setError("")
    } else {
      setError("Código inválido. Tente novamente.")
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    setSuccess("Códigos de backup copiados para a área de transferência")
  }

  const regenerateBackupCodes = () => {
    generateBackupCodes()
    setSuccess("Novos códigos de backup gerados")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Segurança da Conta</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verificação em Duas Etapas
            </CardTitle>
            <CardDescription>
              Adicione uma camada extra de segurança à sua conta exigindo um código de verificação além da senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!showSetup ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação em duas etapas</p>
                  <p className="text-sm text-gray-500">
                    {is2FAEnabled
                      ? "Ativada. Sua conta está protegida com autenticação em duas etapas."
                      : "Desativada. Sua conta está vulnerável a ataques."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{is2FAEnabled ? "Ativado" : "Desativado"}</span>
                  <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Configurar autenticação em duas etapas</h3>

                  {setupStep === 1 && (
                    <div className="space-y-4">
                      <p>
                        Passo 1: Escaneie o código QR com seu aplicativo autenticador (Google Authenticator, Authy,
                        etc.)
                      </p>

                      <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                        {/* This would be a real QR code in production */}
                        <div className="w-48 h-48 bg-white border flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=180&width=180"
                            alt="QR Code para configuração 2FA"
                            className="w-full h-full"
                          />
                        </div>
                      </div>

                      <p className="text-sm text-gray-500">
                        Não consegue escanear? Use este código secreto no seu aplicativo:{" "}
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">ABCDEF123456</span>
                      </p>

                      <Button onClick={() => setSetupStep(2)}>Continuar</Button>
                    </div>
                  )}

                  {setupStep === 2 && (
                    <div className="space-y-4">
                      <p>Passo 2: Digite o código de 6 dígitos do seu aplicativo autenticador</p>

                      {error && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Erro</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="verificationCode">Código de verificação</Label>
                        <Input
                          id="verificationCode"
                          placeholder="123456"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                          className="font-mono text-center text-lg"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSetupStep(1)}>
                          Voltar
                        </Button>
                        <Button onClick={verifyAndEnable2FA}>Verificar e ativar</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Códigos de backup</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Guarde estes códigos em um lugar seguro. Você pode usá-los para acessar sua conta caso perca acesso
                    ao seu dispositivo autenticador.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-sm bg-white p-2 rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar códigos
                    </Button>
                    <Button variant="outline" size="sm" onClick={regenerateBackupCodes}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Gerar novos códigos
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de atividades</CardTitle>
            <CardDescription>Monitore os acessos recentes à sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: "24 de abril, 2025 - 20:15",
                  device: "Chrome em Windows",
                  location: "São Paulo, Brasil",
                  current: true,
                },
                {
                  date: "22 de abril, 2025 - 14:30",
                  device: "Safari em iPhone",
                  location: "São Paulo, Brasil",
                  current: false,
                },
                {
                  date: "20 de abril, 2025 - 09:45",
                  device: "Firefox em MacOS",
                  location: "Rio de Janeiro, Brasil",
                  current: false,
                },
              ].map((activity, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.date}</p>
                    <p className="text-sm text-gray-500">
                      {activity.device} • {activity.location}
                    </p>
                  </div>
                  {activity.current && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Sessão atual</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
