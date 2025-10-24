"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSimplePaymentPage() {
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testDirectFetch = async () => {
    setIsLoading(true)
    setResult("Iniciando teste...\n")

    try {
      const authToken = localStorage.getItem('authToken')
      setResult(prev => prev + `Token: ${authToken ? 'Presente' : 'Ausente'}\n`)

      if (!authToken) {
        setResult(prev => prev + "❌ Token não encontrado\n")
        return
      }

      const paymentData = {
        billing_type: "PIX",
        value: 33.00,
        description: "Teste simples",
        customer_cpf: "42719675059",
        customer_phone: "11987654322",
        customer_mobile_phone: "11987654322",
        external_reference: "test_payment_" + Date.now(),
        items: [
          {
            occurrence_id: "test_occurrence_1",
            ticket_type_id: "test_ticket_type_1",
            quantity: 1
          }
        ]
      }

      setResult(prev => prev + `📦 Dados: ${JSON.stringify(paymentData)}\n`)
      setResult(prev => prev + "📡 Enviando requisição...\n")

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/payment/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify(paymentData)
      })

      setResult(prev => prev + `📊 Status: ${response.status}\n`)

      const data = await response.json()
      setResult(prev => prev + `📦 Resposta: ${JSON.stringify(data)}\n`)

      if (response.ok) {
        setResult(prev => prev + "✅ Sucesso!\n")
      } else {
        setResult(prev => prev + "❌ Erro na resposta\n")
      }

    } catch (error: any) {
      setResult(prev => prev + `❌ Erro: ${error.message}\n`)
      setResult(prev => prev + `📊 Tipo: ${typeof error}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste Simples de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDirectFetch} disabled={isLoading}>
            {isLoading ? "Testando..." : "🚀 Testar Fetch Direto"}
          </Button>
          
          <div className="space-y-2">
            <Label>Resultado:</Label>
            <div className="bg-background text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
              {result || "Clique em 'Testar Fetch Direto' para ver o resultado..."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
