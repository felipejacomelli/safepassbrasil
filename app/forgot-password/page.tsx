"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { authApi, PasswordResetRequest } from "@/lib/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState("")
  const [rateLimitError, setRateLimitError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setRateLimitError(false)
    setIsLoading(true)

    try {
      // Validação básica de email
      if (!email || !email.includes("@")) {
        setError("Por favor, insira um email válido")
        return
      }

      const requestData: PasswordResetRequest = { email }
      const response = await authApi.requestPasswordReset(requestData)
      
      if (response.success) {
        setIsEmailSent(true)
      } else {
        // Verificar se é erro de rate limiting
        if (response.message?.includes("muitas tentativas") || response.message?.includes("rate limit")) {
          setRateLimitError(true)
          setError("Muitas tentativas de redefinição. Tente novamente em alguns minutos.")
        } else {
          setError(response.message || "Erro ao enviar email de recuperação. Tente novamente.")
        }
      }
      
    } catch (err: any) {
      console.error("Erro ao solicitar redefinição de senha:", err)
      
      // Tratamento específico de erros
      if (err.status === 429) {
        setRateLimitError(true)
        setError("Muitas tentativas de redefinição. Tente novamente em alguns minutos.")
      } else if (err.status === 404) {
        // Por segurança, não revelamos se o email existe ou não
        setIsEmailSent(true)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Erro interno do servidor. Tente novamente mais tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setIsEmailSent(false)
    setError("")
    setRateLimitError(false)
    setEmail("")
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email enviado!</h1>
            <p className="text-zinc-400">
              Se o email <strong>{email}</strong> estiver cadastrado em nossa plataforma, 
              você receberá um link de recuperação em alguns minutos.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Próximos passos:
            </h3>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>• Verifique sua caixa de entrada</li>
              <li>• Procure por um email da Reticket</li>
              <li>• Clique no link de recuperação (válido por 1 hora)</li>
              <li>• Defina sua nova senha</li>
              <li>• Faça login com a nova senha</li>
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-200 font-medium mb-1">Importante:</p>
                <ul className="text-amber-100/80 space-y-1">
                  <li>• Verifique também sua pasta de spam</li>
                  <li>• O link expira em 1 hora por segurança</li>
                  <li>• Não compartilhe o link com ninguém</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-zinc-400">
            Não recebeu o email?{" "}
            <button 
              onClick={handleTryAgain}
              className="text-blue-500 hover:text-blue-400 underline transition-colors"
            >
              Tentar novamente
            </button>
          </div>

          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Esqueceu sua senha?</h1>
          <p className="text-zinc-400">
            Digite seu email e enviaremos um link seguro para redefinir sua senha
          </p>
        </div>

        {error && (
          <Alert className={`border-red-500/50 bg-red-500/10 ${rateLimitError ? 'border-amber-500/50 bg-amber-500/10' : ''}`}>
            <AlertCircle className={`h-4 w-4 ${rateLimitError ? 'text-amber-400' : 'text-red-400'}`} />
            <AlertDescription className={rateLimitError ? 'text-amber-400' : 'text-red-400'}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </div>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        </div>

        <div className="text-center text-sm text-zinc-500">
          Lembrou da senha?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  )
}