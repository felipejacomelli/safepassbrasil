"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface GoogleAuthHook {
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  isGoogleLoaded: boolean
}

export function useGoogleAuth(): GoogleAuthHook {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    // Carregar o script do Google Identity Services
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsGoogleLoaded(true)
    }
    script.onerror = () => {
      setError('Erro ao carregar Google Identity Services')
    }
    
    document.head.appendChild(script)

    return () => {
      // Limpar o script quando o componente for desmontado
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const signInWithGoogle = async (): Promise<void> => {
    if (!isGoogleLoaded) {
      setError('Google Identity Services não está carregado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verificar se o client_id está configurado
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new Error('Google Client ID não configurado. Verifique a variável NEXT_PUBLIC_GOOGLE_CLIENT_ID')
      }

      // Configurar o Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      // Mostrar o popup de login
      window.google.accounts.id.prompt()

    } catch (error) {
      console.error('Erro na autenticação Google:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setLoading(false)
    }
  }

  const handleCredentialResponse = async (response: any) => {
    try {
      // Enviar o token para o backend
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/google-auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: response.credential
        })
      })

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json()
        throw new Error(errorData.error || 'Erro na autenticação')
      }

      const authData = await backendResponse.json()
      
      // Fazer login com os dados retornados
      const loginResult = await login(authData.email, '') // Senha vazia para login social
      
      if (!loginResult.success) {
        throw new Error('Erro ao fazer login')
      }

    } catch (error) {
      console.error('Erro na autenticação Google:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    signInWithGoogle,
    isGoogleLoaded
  }
}
