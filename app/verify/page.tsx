"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function VerifyPage() {
  const { verifyTwoFactor, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/account")
    }

    if (!email) {
      router.push("/login")
    }
  }, [isAuthenticated, router, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!code) {
      setError("Por favor, insira o código de verificação")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would verify with the server
      // For demo purposes, we'll accept any 6-digit code or backup code format
      const isValid = useBackupCode ? /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code) : /^\d{6}$/.test(code)

      if (isValid) {
        await verifyTwoFactor(email, code, useBackupCode)
        router.push("/account")
      } else {
        setError("Código inválido. Por favor, tente novamente.")
      }
    } catch (err) {
      setError("Falha na verificação. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o login
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>

          <h2 className="mt-2 text-center text-2xl font-bold leading-9 text-gray-900">Verificação em duas etapas</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {useBackupCode
              ? "Insira um dos seus códigos de backup"
              : "Insira o código de 6 dígitos do seu aplicativo autenticador"}
          </p>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="code" className="sr-only">
                {useBackupCode ? "Código de backup" : "Código de verificação"}
              </Label>
              <Input
                id="code"
                name="code"
                type="text"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={useBackupCode ? "XXXX-XXXX" : "123456"}
                className="text-center text-lg font-mono"
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Verificar"}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-sm text-primary hover:text-primary/80"
            >
              {useBackupCode ? "Usar código do aplicativo autenticador" : "Usar código de backup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
