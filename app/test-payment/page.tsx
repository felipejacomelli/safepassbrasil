"use client"

import { useState } from 'react'

export default function TestPaymentPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectFetch = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🧪 Iniciando teste de pagamento direto...')
      
      const authToken = localStorage.getItem('authToken')
      console.log('🔑 Token encontrado:', authToken ? 'Sim' : 'Não')
      
      if (!authToken) {
        setResult({ error: 'Token não encontrado. Faça login primeiro.' })
        setLoading(false)
        return
      }

      const url = 'http://localhost:8000/api/payment/create/'
      console.log('🔗 URL:', url)

      const paymentData = {
        billing_type: 'CREDIT_CARD',
        value: 33.00,
        description: 'Teste direto',
        customer_cpf: '12345678900',
        customer_phone: '11999999999',
        customer_mobile_phone: '11999999999',
        credit_card: {
          holder_name: 'Usuario Teste',
          number: '5555555555555555',
          expiry_month: '05',
          expiry_year: '2030',
          ccv: '123'
        }
      }

      console.log('📦 Dados:', paymentData)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify(paymentData),
        cache: 'no-store'
      })

      console.log('📊 Status:', response.status)
      
      const data = await response.json()
      console.log('📨 Resposta:', data)

      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error: any) {
      console.error('❌ Erro:', error)
      setResult({ 
        error: error.message,
        stack: error.stack
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '20px' }}>🧪 Teste de Pagamento Direto</h1>
      
      <button 
        onClick={testDirectFetch}
        disabled={loading}
        style={{
          padding: '12px 24px',
          background: '#3B82F6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testando...' : 'Testar Pagamento Direto'}
      </button>

      {result && (
        <div style={{ 
          background: '#18181B', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #3F3F46'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Resultado:</h2>
          <pre style={{ 
            background: '#27272A', 
            padding: '16px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#18181B', borderRadius: '8px' }}>
        <h3>📋 Instruções:</h3>
        <ol>
          <li>Certifique-se de estar logado</li>
          <li>Abra o DevTools (F12)</li>
          <li>Vá para a aba Console</li>
          <li>Clique no botão acima</li>
          <li>Verifique os logs no console</li>
        </ol>
      </div>
    </div>
  )
}
