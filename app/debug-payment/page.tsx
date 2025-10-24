"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { paymentClient } from "@/lib/payment-api-client"
import { PaymentErrorHandler } from "@/lib/payment-error-handler"

export default function DebugPaymentPage() {
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testValidation = () => {
    addLog("🧪 Testando validação de dados...")
    
    const testData = {
      cpf: "42719675059",
      phone: "11987654322",
      cardNumber: "5555555555555555",
      expiryMonth: "05",
      expiryYear: "2030",
      cvv: "123"
    }

    addLog(`📦 Dados de teste: ${JSON.stringify(testData)}`)
    
    const validation = PaymentErrorHandler.validatePaymentData(testData)
    addLog(`✅ Validação: ${validation.valid ? 'PASSOU' : 'FALHOU'}`)
    
    if (!validation.valid) {
      addLog(`❌ Erros: ${validation.errors.join(', ')}`)
    }
    
    return validation
  }

  const testPayment = async () => {
    setIsLoading(true)
    addLog("🚀 Iniciando teste de pagamento...")
    
    try {
      // Teste 1: Validação
      const validation = testValidation()
      if (!validation.valid) {
        addLog("❌ Validação falhou - parando teste")
        return
      }
      
      // Teste 2: Dados do pagamento
      const paymentData = {
        billing_type: "PIX",
        value: 33.00,
        description: "Teste de pagamento",
        customer_cpf: "42719675059",
        customer_phone: "11987654322",
        customer_mobile_phone: "11987654322"
      }
      
      addLog(`📦 Dados do pagamento: ${JSON.stringify(paymentData)}`)
      
      // Teste 3: Token
      const authToken = localStorage.getItem('authToken')
      addLog(`🔑 Token: ${authToken ? 'Presente' : 'Ausente'}`)
      
      if (!authToken) {
        addLog("❌ Token não encontrado")
        return
      }
      
      // Teste 4: Sanitização
      addLog("🧹 Testando sanitização...")
      const sanitizedData = PaymentErrorHandler.sanitizePaymentData(paymentData)
      addLog(`✅ Dados sanitizados: ${JSON.stringify(sanitizedData)}`)
      
      // Teste 5: Health check
      addLog("🏥 Verificando saúde do backend...")
      const isHealthy = await paymentClient.healthCheck()
      addLog(`✅ Backend: ${isHealthy ? 'Online' : 'Offline'}`)
      
      if (!isHealthy) {
        addLog("❌ Backend offline - parando teste")
        return
      }
      
      // Teste 6: Pagamento real
      addLog("💳 Enviando pagamento...")
      const result = await paymentClient.createPayment(paymentData, authToken)
      addLog(`✅ Resultado: ${JSON.stringify(result)}`)
      
    } catch (error: any) {
      addLog(`❌ Erro capturado: ${error.message}`)
      addLog(`📊 Tipo do erro: ${typeof error}`)
      addLog(`📊 Stack: ${error.stack}`)
      
      const errorInfo = PaymentErrorHandler.handlePaymentError(error)
      addLog(`🔍 Código do erro: ${errorInfo.code}`)
      addLog(`💬 Mensagem: ${errorInfo.userMessage}`)
      addLog(`🔄 Deve retentar: ${errorInfo.shouldRetry}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setDebugLogs([])
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testPayment} disabled={isLoading}>
              {isLoading ? "Testando..." : "🧪 Testar Pagamento"}
            </Button>
            <Button onClick={clearLogs} variant="outline">
              🗑️ Limpar Logs
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Logs de Debug:</Label>
            <div className="bg-background text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <div className="text-muted-foreground">Clique em "Testar Pagamento" para ver os logs...</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
