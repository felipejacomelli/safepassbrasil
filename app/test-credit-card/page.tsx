"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { paymentClient } from "@/lib/payment-api-client"

export default function TestCreditCardPage() {
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testCreditCard = async () => {
    setIsLoading(true)
    setResult("Iniciando teste de cartão de crédito...\n")

    try {
      const authToken = localStorage.getItem('authToken')
      setResult(prev => prev + `Token: ${authToken ? 'Presente' : 'Ausente'}\n`)

      if (!authToken) {
        setResult(prev => prev + "❌ Token não encontrado\n")
        return
      }

      const paymentData = {
        billing_type: "CREDIT_CARD",
        value: 33.00,
        description: "Teste cartão de crédito",
        customer_cpf: "42719675059",
        customer_phone: "11987654322",
        customer_mobile_phone: "11987654322",
        credit_card: {
          holder_name: "Usuario Teste",
          number: "5555555555555555",
          expiry_month: "05",
          expiry_year: "2030",
          ccv: "123",
          holderName: "Usuario Teste",
          expiryMonth: "05",
          expiryYear: "2030",
          cardNumber: "5555555555555555",
          cardNumberMasked: "5555555555555555"
        },
        credit_card_holder_info: {
          name: "Usuario Teste",
          email: "usuario@teste.com",
          cpf_cnpj: "42719675059",
          phone: "11987654322",
          mobile_phone: "11987654322",
          postal_code: "01310-100",
          address_number: "123",
          address_complement: "Apto 45"
        },
        installment_count: 1
      }

      setResult(prev => prev + `📦 Dados: ${JSON.stringify(paymentData, null, 2)}\n`)
      setResult(prev => prev + "📡 Enviando requisição...\n")

      const response = await paymentClient.createPayment(paymentData, authToken)

      setResult(prev => prev + `✅ Sucesso: ${JSON.stringify(response, null, 2)}\n`)

    } catch (error: any) {
      setResult(prev => prev + `❌ Erro: ${error.message}\n`)
      setResult(prev => prev + `📊 Tipo: ${typeof error}\n`)
      setResult(prev => prev + `📊 Status: ${error.status}\n`)
      setResult(prev => prev + `📊 Data: ${JSON.stringify(error.data, null, 2)}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>💳 Teste Cartão de Crédito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testCreditCard} disabled={isLoading}>
            {isLoading ? "Testando..." : "🚀 Testar Cartão de Crédito"}
          </Button>
          
          <div className="space-y-2">
            <Label>Resultado:</Label>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
              {result || "Clique em 'Testar Cartão de Crédito' para ver o resultado..."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
