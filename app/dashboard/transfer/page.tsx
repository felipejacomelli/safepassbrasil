"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowUpRight, 
  Wallet, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Info
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'

interface UserBalance {
  available_balance: number
  locked_balance: number
  total_balance: number
  pending_transfers: number
}

interface TransferRequest {
  id: string
  amount: number
  status: string
  created_at: string
  processed_at?: string
  rejection_reason?: string
}

export default function TransferPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    amount: '',
    bank_name: '',
    bank_code: '',
    account_type: '',
    account_number: '',
    agency: '',
    account_holder_name: '',
    account_holder_document: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // ✅ OTIMIZAÇÃO: Só recarregar se necessário
  useEffect(() => {
    if (user) {
      const now = new Date()
      const lastFetch = localStorage.getItem(`transfers_fetch_${user.id}`)
      
      if (!lastFetch || (now.getTime() - parseInt(lastFetch) > 300000)) { // 5 minutos
        fetchData()
      }
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado, pulando busca de dados de transfer')
        return
      }

      const [balanceRes, transfersRes] = await Promise.all([
        fetch(`${apiUrl}/api/escrow/balance/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${apiUrl}/api/escrow/transfers/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ])

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData)
      }

      if (transfersRes.ok) {
        const transfersData = await transfersRes.json()
        setTransfers(transfersData.transfers || [])
      }

      // ✅ OTIMIZAÇÃO: Marcar timestamp da última busca
      if (user) {
        localStorage.setItem(`transfers_fetch_${user.id}`, Date.now().toString())
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!balance || parseFloat(formData.amount) > balance.available_balance) {
      setError('Valor solicitado é maior que o saldo disponível')
      return
    }

    if (parseFloat(formData.amount) < 10) {
      setError('Valor mínimo para saque é R$ 10,00')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado, pulando busca de dados de transfer')
        return
      }

      const response = await fetch(`${apiUrl}/api/escrow/transfers/requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          bank_name: formData.bank_name,
          bank_code: formData.bank_code,
          account_type: formData.account_type,
          account_number: formData.account_number,
          agency: formData.agency,
          account_holder_name: formData.account_holder_name,
          account_holder_document: formData.account_holder_document,
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Solicitação de saque enviada com sucesso!')
        setFormData({
          amount: '',
          bank_name: '',
          bank_code: '',
          account_type: '',
          account_number: '',
          agency: '',
          account_holder_name: '',
          account_holder_document: '',
          notes: ''
        })
        fetchData() // Atualizar dados
      } else {
        setError(data.error || 'Erro ao enviar solicitação')
      }

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
      setError('Erro ao enviar solicitação')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      'approved': { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      'rejected': { label: 'Rejeitado', variant: 'destructive' as const, icon: AlertTriangle },
      'processing': { label: 'Processando', variant: 'secondary' as const, icon: Clock },
      'completed': { label: 'Concluído', variant: 'default' as const, icon: CheckCircle }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: Clock }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solicitar Saque</h1>
          <p className="text-muted-foreground">
            Transfira seu saldo disponível para sua conta bancária
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Saque */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                Nova Solicitação de Saque
              </CardTitle>
              <CardDescription>
                Preencha os dados bancários para solicitar o saque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Valor */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor do Saque *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="10"
                      max={balance?.available_balance || 0}
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Saldo disponível: {formatCurrency(balance?.available_balance || 0, 'BRL')}
                  </p>
                </div>

                {/* Dados Bancários */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Nome do Banco *</Label>
                    <Input
                      id="bank_name"
                      placeholder="Ex: Banco do Brasil"
                      value={formData.bank_name}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_code">Código do Banco *</Label>
                    <Input
                      id="bank_code"
                      placeholder="Ex: 001"
                      value={formData.bank_code}
                      onChange={(e) => handleInputChange('bank_code', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Tipo de Conta *</Label>
                    <Select value={formData.account_type} onValueChange={(value) => handleInputChange('account_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Conta Corrente</SelectItem>
                        <SelectItem value="savings">Conta Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agency">Agência *</Label>
                    <Input
                      id="agency"
                      placeholder="Ex: 1234"
                      value={formData.agency}
                      onChange={(e) => handleInputChange('agency', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_number">Número da Conta *</Label>
                  <Input
                    id="account_number"
                    placeholder="Ex: 12345-6"
                    value={formData.account_number}
                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_holder_name">Nome do Titular *</Label>
                    <Input
                      id="account_holder_name"
                      placeholder="Nome completo"
                      value={formData.account_holder_name}
                      onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_holder_document">CPF/CNPJ do Titular *</Label>
                    <Input
                      id="account_holder_document"
                      placeholder="000.000.000-00"
                      value={formData.account_holder_document}
                      onChange={(e) => handleInputChange('account_holder_document', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informações adicionais..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Alertas */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Botão de Envio */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting || !balance || balance.available_balance < 10}
                >
                  {submitting ? 'Enviando...' : 'Solicitar Saque'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Saldo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Seu Saldo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(balance?.available_balance || 0, 'BRL')}
                </p>
                <p className="text-sm text-muted-foreground">Disponível para saque</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Em escrow:</span>
                  <span>{formatCurrency(balance?.locked_balance || 0, 'BRL')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendente:</span>
                  <span>{formatCurrency(balance?.pending_transfers || 0, 'BRL')}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(balance?.total_balance || 0, 'BRL')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Valor mínimo para saque: R$ 10,00</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>Processamento em até 2 dias úteis</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <p>Taxa de transferência: R$ 2,50</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Horário de processamento: 9h às 17h</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Histórico de Transferências */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
          <CardDescription>Suas solicitações de saque anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Saque #{transfer.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transfer.created_at).toLocaleDateString('pt-BR')} às {new Date(transfer.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(transfer.amount, 'BRL')}</p>
                    {getStatusBadge(transfer.status)}
                  </div>
                </div>
                
                {transfer.processed_at && (
                  <p className="text-sm text-muted-foreground">
                    Processado em: {new Date(transfer.processed_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
                
                {transfer.rejection_reason && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Motivo da rejeição: {transfer.rejection_reason}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
            
            {transfers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transferência encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

