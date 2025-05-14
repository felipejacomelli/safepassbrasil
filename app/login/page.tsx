"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/account")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        if (result.requires2FA) {
          // Redirect to 2FA verification page
          router.push(`/verify?email=${encodeURIComponent(email)}`)
        } else if (result.isAdmin) {
          // Redirect admin users to the admin area
          router.push("/admin")
        } else {
          // Redirect regular users to their account
          router.push("/account")
        }
      } else {
        setError("Email ou senha inválidos")
      }
    } catch (err) {
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-500">
            ReTicket
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Entre na sua conta</h2>
          <p className="mt-2 text-sm text-gray-400">
            Ou{" "}
            <Link href="/register" className="font-medium text-blue-500 hover:text-blue-400">
              crie uma conta
            </Link>
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900 border-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-white">Erro</AlertTitle>
            <AlertDescription className="text-gray-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-900 shadow rounded-lg p-6 border border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
                <div className="text-sm">
                  <Link href="#" className="font-medium text-blue-500 hover:text-blue-400">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
