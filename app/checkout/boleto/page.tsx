"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Banknote, Copy, CheckCircle, Download, Printer, Calendar } from "lucide-react"

export default function BoletoCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [copied, setCopied] = useState(false)
  const [boletoCode, setBoletoCode] = useState("34191.79001 01043.510047 91020.150008 1 84750000002000")
  const [boletoUrl, setBoletoUrl] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Buscar dados do pedido e boleto real da API
    // const fetchBoletoData = async () => {
    //   try {
    //     const response = await fetch(`/api/orders/${orderId}/boleto`)
    //     const data = await response.json()
    //     setBoletoCode(data.boletoCode)
    //     setBoletoUrl(data.boletoUrl)
    //     setDueDate(data.dueDate)
    //   } catch (error) {
    //     console.error('Erro ao carregar dados do boleto:', error)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchBoletoData()

    // Definir data de vencimento (3 dias a partir de hoje)
    const due = new Date()
    due.setDate(due.getDate() + 3)
    setDueDate(due.toLocaleDateString('pt-BR'))
    setLoading(false)
  }, [orderId])

  const handleCopyBoletoCode = () => {
    navigator.clipboard.writeText(boletoCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadBoleto = () => {
    // TODO: Implementar download real do boleto
    alert('Download do boleto será implementado')
  }

  const handlePrintBoleto = () => {
    // TODO: Implementar impressão real do boleto
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Banknote className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Gerando boleto...</p>
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
              <Banknote className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Boleto Bancário</h1>
            <p className="text-muted-foreground">
              Seu boleto foi gerado com sucesso
            </p>
          </div>

          {/* Data de Vencimento */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Vencimento em:</p>
                <p className="text-2xl font-bold text-primary">{dueDate}</p>
              </div>
            </div>
          </div>

          {/* Código de Barras */}
          <div className="bg-accent rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Código de Barras:</h3>
            <div className="bg-white p-4 rounded mb-4">
              {/* Simulação de código de barras */}
              <div className="flex justify-center gap-px">
                {Array.from({ length: 44 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-background"
                    style={{
                      width: Math.random() > 0.5 ? '2px' : '4px',
                      height: '60px',
                    }}
                  />
                ))}
              </div>
            </div>
            
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Linha digitável:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={boletoCode}
                readOnly
                className="flex-1 bg-zinc-700 text-foreground p-3 rounded-lg border border-zinc-600 font-mono text-sm"
              />
              <Button
                onClick={handleCopyBoletoCode}
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
                <span>Copie a linha digitável acima ou faça o download do boleto</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">2.</span>
                <span>Acesse o internet banking ou app do seu banco</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">3.</span>
                <span>Escolha a opção "Pagar Boleto" ou "Ler Código de Barras"</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">4.</span>
                <span>Cole a linha digitável ou escaneie o código de barras</span>
              </li>
              <li className="flex">
                <span className="font-bold text-primary mr-3">5.</span>
                <span>Confirme o pagamento</span>
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
              <div className="flex justify-between">
                <span>Vencimento:</span>
                <span>{dueDate}</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              onClick={handleDownloadBoleto}
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent"
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar PDF
            </Button>
            <Button
              onClick={handlePrintBoleto}
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent"
            >
              <Printer className="w-5 h-5 mr-2" />
              Imprimir
            </Button>
          </div>

          {/* Botões de Navegação */}
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
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-200">
              ⚠️ <strong>Importante:</strong> O pagamento do boleto pode levar até 2 dias úteis para ser confirmado.
              Você receberá um email assim que o pagamento for aprovado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
