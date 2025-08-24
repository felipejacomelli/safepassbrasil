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
import { request } from "@/lib/utils"
import Cookies from "js-cookie"

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/account")
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isLoginMode) {
      // Login logic
      if (!formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos")
        return
      }

      setIsLoading(true)

      try {
        const result = await request({
          method: "POST",
          url: 'user_app/user/login',
          body: {
            email: formData.email,
            password: formData.password, 
          }
        })
        Cookies.set('tokenauth', result.data.token, { expires: 7 })	
        if (result.success) {
          router.push("/account")
        } else {
          setError("Email ou senha inválidos")
        }
      } catch (err) {
        setError("Ocorreu um erro ao fazer login. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    } else {
      // Register logic
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Por favor, preencha todos os campos")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem")
        return
      }

      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres")
        return
      }

      setIsLoading(true)

      try {
        const result = await request({
          method: "POST",
          url: 'user_app/user/register',
          body: {
            username: formData.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
            name: formData.name,
            email: formData.email,
            password: formData.password, 
          }
        })

        if (result.success) {
          location.reload()
        } else {
          setError("Erro ao criar conta")
        }
      } catch (err) {
        setError("Ocorreu um erro ao criar a conta. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setError("")
    setFormData({
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-500">
            ReTicket
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            {isLoginMode ? "Entre na sua conta" : "Crie sua conta"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLoginMode ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              onClick={toggleMode}
              className="font-medium text-blue-500 hover:text-blue-400 underline bg-transparent border-none cursor-pointer"
            >
              {isLoginMode ? "Criar conta" : "Fazer login"}
            </button>
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
            {!isLoginMode && (
              <div>
                <Label htmlFor="name" className="text-white">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={!isLoginMode}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            )}

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
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
                {isLoginMode && (
                  <div className="text-sm">
                    <Link href="#" className="font-medium text-blue-500 hover:text-blue-400">
                      Esqueceu a senha?
                    </Link>
                  </div>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {!isLoginMode && (
              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirmar senha
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required={!isLoginMode}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            )}

            <div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading
                  ? isLoginMode
                    ? "Entrando..."
                    : "Criando conta..."
                  : isLoginMode
                    ? "Entrar"
                    : "Criar conta"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
