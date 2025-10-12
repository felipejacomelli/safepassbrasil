"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Settings,
  Save,
  RefreshCw,
  Shield,
  Mail,
  CreditCard,
  Globe,
  Bell,
  Database,
  Key,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Server,
  Smartphone,
  Monitor
} from "lucide-react"
import { adminApi } from "@/lib/api"

// Tipos para configurações
interface SystemSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  supportEmail: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxFileUploadSize: number
  allowedFileTypes: string[]
  defaultLanguage: string
  timezone: string
  currency: string
  commissionRate: number
  maxTicketsPerUser: number
  refundPolicy: string
}

interface EmailSettings {
  smtpHost: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  smtpEncryption: string
  fromEmail: string
  fromName: string
  emailEnabled: boolean
}

interface PaymentSettings {
  stripeEnabled: boolean
  stripePublicKey: string
  stripeSecretKey: string
  paypalEnabled: boolean
  paypalClientId: string
  paypalClientSecret: string
  pixEnabled: boolean
  pixKey: string
  minimumAmount: number
  maximumAmount: number
  processingFee: number
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  passwordRequireNumbers: boolean
  passwordRequireUppercase: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  lockoutDuration: number
  ipWhitelist: string[]
  apiRateLimit: number
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [showPasswords, setShowPasswords] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Estados para diferentes configurações
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: "Safe Pass",
    siteDescription: "Plataforma de venda de ingressos online",
    siteUrl: "https://safepass.com.br",
    adminEmail: "admin@safepass.com.br",
    supportEmail: "suporte@safepass.com.br",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: 10,
    allowedFileTypes: ["jpg", "jpeg", "png", "pdf"],
    defaultLanguage: "pt-BR",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    commissionRate: 5.0,
    maxTicketsPerUser: 10,
    refundPolicy: "Reembolso integral até 24h antes do evento"
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpEncryption: "tls",
    fromEmail: "noreply@safepass.com.br",
    fromName: "Safe Pass",
    emailEnabled: true
  })

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: true,
    stripePublicKey: "",
    stripeSecretKey: "",
    paypalEnabled: false,
    paypalClientId: "",
    paypalClientSecret: "",
    pixEnabled: true,
    pixKey: "",
    minimumAmount: 10,
    maximumAmount: 10000,
    processingFee: 2.5
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelist: [],
    apiRateLimit: 100
  })

  // Carregar configurações da API
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await adminApi.settings.get()
      const data = await response.json()
      
      if (data.system) {
        setSystemSettings(data.system)
      }
      if (data.email) {
        setEmailSettings(data.email)
      }
      if (data.payment) {
        setPaymentSettings(data.payment)
      }
      if (data.security) {
        setSecuritySettings(data.security)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (settingsType: string) => {
    setSaving(true)
    setMessage(null)
    
    try {
      let data
      switch (settingsType) {
        case 'system':
          data = systemSettings
          break
        case 'email':
          data = emailSettings
          break
        case 'payment':
          data = paymentSettings
          break
        case 'security':
          data = securitySettings
          break
        default:
          throw new Error('Tipo de configuração inválido')
      }

      await adminApi.settings.update(settingsType, data)
      setMessage({ type: 'success', text: `Configurações ${settingsType} salvas com sucesso!` })
    } catch (error) {
      console.error(`Erro ao salvar configurações ${settingsType}:`, error)
      setMessage({ type: 'error', text: `Erro ao salvar configurações ${settingsType}` })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      await adminApi.settings.testEmail()
      setMessage({ type: 'success', text: 'Email de teste enviado com sucesso!' })
    } catch (error) {
      console.error('Erro ao testar email:', error)
      setMessage({ type: 'error', text: 'Erro ao enviar email de teste' })
    }
  }

  const handleBackupSettings = async () => {
    try {
      const backupData = await adminApi.settings.backup()
      
      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `safepass-settings-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      setMessage({ type: 'success', text: 'Backup criado com sucesso!' })
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      setMessage({ type: 'error', text: 'Erro ao criar backup' })
    }
  }

  const handleRestoreSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string)
          if (settings.system) setSystemSettings(settings.system)
          if (settings.email) setEmailSettings(settings.email)
          if (settings.payment) setPaymentSettings(settings.payment)
          if (settings.security) setSecuritySettings(settings.security)
          setMessage({ type: 'success', text: 'Configurações restauradas com sucesso!' })
        } catch (error) {
          console.error("Erro ao restaurar configurações:", error)
          setMessage({ type: 'error', text: 'Erro ao restaurar configurações' })
        }
      }
      reader.readAsText(file)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações do Sistema</h1>
          <p className="text-gray-400">Gerencie as configurações da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleBackupSettings}>
            <Download className="w-4 h-4 mr-2" />
            Backup
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Restaurar
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/20 border border-green-500 text-green-400' 
            : 'bg-red-900/20 border border-red-500 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs for different settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-900">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>Configure informações básicas da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-white">Nome do Site</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl" className="text-white">URL do Site</Label>
                  <Input
                    id="siteUrl"
                    value={systemSettings.siteUrl}
                    onChange={(e) => setSystemSettings({...systemSettings, siteUrl: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-white">Descrição do Site</Label>
                <Textarea
                  id="siteDescription"
                  value={systemSettings.siteDescription}
                  onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-white">Email do Administrador</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={systemSettings.adminEmail}
                    onChange={(e) => setSystemSettings({...systemSettings, adminEmail: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail" className="text-white">Email de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={systemSettings.supportEmail}
                    onChange={(e) => setSystemSettings({...systemSettings, supportEmail: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage" className="text-white">Idioma Padrão</Label>
                  <Select value={systemSettings.defaultLanguage} onValueChange={(value) => setSystemSettings({...systemSettings, defaultLanguage: value})}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">Fuso Horário</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-white">Moeda</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({...systemSettings, currency: value})}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Modo de Manutenção</Label>
                    <p className="text-sm text-gray-400">Desabilita o acesso público à plataforma</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Registro de Usuários</Label>
                    <p className="text-sm text-gray-400">Permite novos cadastros na plataforma</p>
                  </div>
                  <Switch
                    checked={systemSettings.registrationEnabled}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, registrationEnabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Verificação de Email</Label>
                    <p className="text-sm text-gray-400">Exige verificação de email para novos usuários</p>
                  </div>
                  <Switch
                    checked={systemSettings.emailVerificationRequired}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailVerificationRequired: checked})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('system')} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Configurações Gerais
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Configurações de Email
              </CardTitle>
              <CardDescription>Configure o servidor SMTP para envio de emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost" className="text-white">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="text-white">Porta SMTP</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: parseInt(e.target.value)})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername" className="text-white">Usuário SMTP</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="seu-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword" className="text-white">Senha SMTP</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showPasswords ? "text" : "password"}
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                      className="bg-zinc-800 border-zinc-700 text-white pr-10"
                      placeholder="sua-senha-de-app"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail" className="text-white">Email Remetente</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="noreply@safepass.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName" className="text-white">Nome Remetente</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="ReTicket"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Email Habilitado</Label>
                  <p className="text-sm text-gray-400">Permite o envio de emails pela plataforma</p>
                </div>
                <Switch
                  checked={emailSettings.emailEnabled}
                  onCheckedChange={(checked) => setEmailSettings({...emailSettings, emailEnabled: checked})}
                />
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleTestEmail}
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Testar Email
                </Button>
                <Button 
                  onClick={() => handleSaveSettings('email')} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Configurações de Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Configurações de Pagamento
              </CardTitle>
              <CardDescription>Configure os métodos de pagamento disponíveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Stripe</Label>
                    <p className="text-sm text-gray-400">Pagamentos com cartão de crédito</p>
                  </div>
                  <Switch
                    checked={paymentSettings.stripeEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, stripeEnabled: checked})}
                  />
                </div>
                
                {paymentSettings.stripeEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublicKey" className="text-white">Chave Pública</Label>
                      <Input
                        id="stripePublicKey"
                        value={paymentSettings.stripePublicKey}
                        onChange={(e) => setPaymentSettings({...paymentSettings, stripePublicKey: e.target.value})}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="pk_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey" className="text-white">Chave Secreta</Label>
                      <Input
                        id="stripeSecretKey"
                        type={showPasswords ? "text" : "password"}
                        value={paymentSettings.stripeSecretKey}
                        onChange={(e) => setPaymentSettings({...paymentSettings, stripeSecretKey: e.target.value})}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="sk_..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PIX */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">PIX</Label>
                    <p className="text-sm text-gray-400">Pagamentos via PIX</p>
                  </div>
                  <Switch
                    checked={paymentSettings.pixEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, pixEnabled: checked})}
                  />
                </div>
                
                {paymentSettings.pixEnabled && (
                  <div className="ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="pixKey" className="text-white">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        value={paymentSettings.pixKey}
                        onChange={(e) => setPaymentSettings({...paymentSettings, pixKey: e.target.value})}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="sua-chave-pix"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Limites */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Limites de Transação</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumAmount" className="text-white">Valor Mínimo (R$)</Label>
                    <Input
                      id="minimumAmount"
                      type="number"
                      step="0.01"
                      value={paymentSettings.minimumAmount}
                      onChange={(e) => setPaymentSettings({...paymentSettings, minimumAmount: parseFloat(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximumAmount" className="text-white">Valor Máximo (R$)</Label>
                    <Input
                      id="maximumAmount"
                      type="number"
                      step="0.01"
                      value={paymentSettings.maximumAmount}
                      onChange={(e) => setPaymentSettings({...paymentSettings, maximumAmount: parseFloat(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processingFee" className="text-white">Taxa de Processamento (%)</Label>
                    <Input
                      id="processingFee"
                      type="number"
                      step="0.1"
                      value={paymentSettings.processingFee}
                      onChange={(e) => setPaymentSettings({...paymentSettings, processingFee: parseFloat(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('payment')} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Configurações de Pagamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>Configure políticas de segurança da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Policy */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Política de Senhas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength" className="text-white">Comprimento Mínimo</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="32"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Exigir Caracteres Especiais</Label>
                    <Switch
                      checked={securitySettings.passwordRequireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireSpecialChars: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Exigir Números</Label>
                    <Switch
                      checked={securitySettings.passwordRequireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireNumbers: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Exigir Maiúsculas</Label>
                    <Switch
                      checked={securitySettings.passwordRequireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireUppercase: checked})}
                    />
                  </div>
                </div>
              </div>

              {/* Session & Login */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Sessão e Login</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout" className="text-white">Timeout da Sessão (min)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts" className="text-white">Máx. Tentativas de Login</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration" className="text-white">Duração do Bloqueio (min)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={securitySettings.lockoutDuration}
                      onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* API Rate Limiting */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Limitação de API</h4>
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit" className="text-white">Limite de Requisições por Minuto</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={securitySettings.apiRateLimit}
                    onChange={(e) => setSecuritySettings({...securitySettings, apiRateLimit: parseInt(e.target.value)})}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('security')} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Configurações de Segurança
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}