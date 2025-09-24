"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { validateCpfWithMessage } from "@/utils/cpf"

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    phone: "",
    country: "",
    cpf: "",
  })
  
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    country: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      // Se há um returnUrl, redireciona para lá, senão vai para /account
      const redirectTo = returnUrl || "/account"
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, returnUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    let formattedValue = value
    
    // Formatação automática do CPF
    if (name === 'cpf') {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 11) {
        if (numbers.length <= 3) {
          formattedValue = numbers
        } else if (numbers.length <= 6) {
          formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3)}`
        } else if (numbers.length <= 9) {
          formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
        } else {
          formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
        }
      }
    }
    
    // Formatação automática do celular
    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length === 0) {
        formattedValue = ''
      } else if (numbers.length <= 2) {
        formattedValue = numbers
      } else if (numbers.length <= 6) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      } else if (numbers.length <= 10) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
      } else {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    
    // Validação em tempo real
    validateField(name, formattedValue)
  }
  
  const validateField = (fieldName: string, value: string) => {
    let error = ""
    
    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          error = "Nome é obrigatório"
        } else {
          const names = value.trim().split(/\s+/)
          if (names.length < 2) {
            error = "Digite pelo menos nome e sobrenome"
          } else if (names.some(name => name.length < 2)) {
            error = "Cada nome deve ter pelo menos 2 caracteres"
          }
        }
        break
        
      case 'email':
        if (!value.trim()) {
          error = "Email é obrigatório"
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          if (!emailRegex.test(value)) {
            error = "Digite um email válido"
          }
        }
        break
        
      case 'phone':
        const phoneNumbers = value.replace(/\D/g, '')
        if (phoneNumbers.length > 0 && phoneNumbers.length < 10) {
          error = "Celular deve ter 10 ou 11 dígitos"
        }
        break
        
      case 'cpf':
        if (value.trim()) {
          const cpfValidation = validateCpfWithMessage(value)
          error = cpfValidation.message
        }
        break
        
      case 'country':
        if (!value.trim()) {
          error = "País é obrigatório"
        }
        break
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
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
        const result = await login(formData.email, formData.password)

        if (result.success) {
          if (result.requires2FA) {
            router.push(`/verify?email=${encodeURIComponent(formData.email)}`)
          } else if (result.isAdmin && !returnUrl) {
            // Só redireciona para admin se não há returnUrl específico
            router.push("/admin")
          } else {
            // Usa returnUrl se disponível, senão vai para /account
            const redirectTo = returnUrl || "/account"
            router.push(redirectTo)
          }
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
      // Validação completa antes do envio
      const validationErrors = {
        name: !formData.name.trim() ? "Nome é obrigatório" : "",
        email: !formData.email.trim() ? "Email é obrigatório" : "",
        country: !formData.country.trim() ? "País é obrigatório" : "",
        phone: formData.phone.replace(/\D/g, '').length < 10 ? "Celular deve ter 10 ou 11 dígitos" : "",
        cpf: formData.cpf.replace(/\D/g, '').length !== 11 ? "CPF deve ter 11 dígitos" : ""
      }
      
      // Validações específicas
      if (formData.name.trim()) {
        const names = formData.name.trim().split(/\s+/)
        if (names.length < 2) {
          validationErrors.name = "Digite pelo menos nome e sobrenome"
        } else if (names.some(name => name.length < 2)) {
          validationErrors.name = "Cada nome deve ter pelo menos 2 caracteres"
        }
      }
      
      if (formData.email.trim()) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(formData.email)) {
          validationErrors.email = "Digite um email válido"
        }
      }
      
      setFieldErrors(validationErrors)
      
      // Verifica se há algum erro
      const hasErrors = Object.values(validationErrors).some(error => error !== "")
      if (hasErrors) {
        setError("Por favor, corrija os erros no formulário")
        return
      }
      
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
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          country: formData.country,
          cpf: formData.cpf
        })

        if (result.success) {
          router.push("/account")
        } else {
          setError(result.message || "Erro ao criar conta")
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
      phone: "",
      country: "",
      cpf: "",
    })
    setFieldErrors({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      country: ""
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
              <>
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
                    className={`mt-1 bg-gray-800 border-gray-700 text-white ${fieldErrors.name ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">
                    Celular
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`mt-1 bg-gray-800 border-gray-700 text-white ${fieldErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="(11) 99999-9999"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cpf" className="text-white">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className={`mt-1 bg-gray-800 border-gray-700 text-white ${fieldErrors.cpf ? 'border-red-500' : ''}`}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {fieldErrors.cpf && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.cpf}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="country" className="text-white">
                    País
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`mt-1 bg-gray-800 border-gray-700 text-white ${fieldErrors.country ? 'border-red-500' : ''}`}
                    placeholder="Ex: Brasil"
                  />
                  {fieldErrors.country && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.country}</p>
                  )}
                </div>
              </>
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
                className={`mt-1 bg-gray-800 border-gray-700 text-white ${fieldErrors.email ? 'border-red-500' : ''}`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
              )}
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
