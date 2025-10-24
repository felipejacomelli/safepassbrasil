"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QrCode, Copy, CheckCircle, Clock, RefreshCw } from "lucide-react"

export default function PixCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [copied, setCopied] = useState(false)
  const [pixCode, setPixCode] = useState("00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000520400005303986540510.005802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutos

  useEffect(() => {
    // TODO: Buscar dados do pedido e código PIX real da API
    // const fetchPixData = async () => {
    //   try {
    //     const response = await fetch(`/api/orders/${orderId}/pix`)
    //     const data = await response.json()
    //     setPixCode(data.pixCode)
    //     setQrCodeUrl(data.qrCodeUrl)
    //   } catch (error) {
    //     console.error('Erro ao carregar dados PIX:', error)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchPixData()

    setLoading(false)
  }, [orderId])

  useEffect(() => {
    // Timer de expiração
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Gerando código PIX...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-card rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Pagamento PIX</h1>
            <p className="text-muted-foreground">
              Escaneie o QR Code ou copie o código PIX para efetuar o pagamento
            </p>
          </div>

          {/* Timer */}
          <div className="bg-accent rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tempo para pagamento:</span>
              <span className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-500' : 'text-primary'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all ${timeRemaining < 60 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${(timeRemaining / 600) * 100}%` }}
              />
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-8 rounded-lg mb-6">
            <div className="flex items-center justify-center">
              <QrCode className="w-64 h-64 text-black" />
            </div>
            <p className="text-center text-gray-600 mt-4">
              Escaneie este QR Code com o app do seu banco
            </p>
          </div>

          {/* Código PIX */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Ou copie o código PIX:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pixCode}
                readOnly
                className="flex-1 bg-accent text-foreground p-3 rounded-lg border border-border font-mono text-sm"
              />
              <Button
                onClick={handleCopyPixCode}
                className="bg-primary hover:bg-primary/90 text-black"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-accent rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Como pagar:</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex">
                <span className="font-bold text-primary mr-3">1.</span>
                <span>Abra o app do seu banco e acesse a área PIX</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">2.</span>
                <span>Escolha a opção "Ler QR Code" ou "Pix Copia e Cola"</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">3.</span>
                <span>Escaneie o QR Code acima ou cole o código copiado</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">4.</span>
                <span>Confirme o pagamento no app do seu banco</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">5.</span>
                <span>Pronto! Você receberá a confirmação em instantes</span>
              </li>
            </ol>
          </div>

          {/* Informações do Pedido */}
          <div className="bg-accent rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Detalhes do Pedido</h3>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Número do Pedido:</span>
                <span className="font-mono">{orderId || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-yellow-500">Aguardando Pagamento</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/account/orders')}
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:bg-accent"
            >
              Ver Meus Pedidos
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="flex-1 bg-primary hover:bg-primary/90 text-black"
            >
              Voltar ao Início
            </Button>
          </div>

          {/* Aviso */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            O pagamento é confirmado automaticamente após a aprovação pelo banco.
            Você receberá um email com a confirmação e os ingressos.
          </p>
        </div>
      </div>
    </div>
  )
}
