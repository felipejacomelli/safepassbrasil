"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { authApi, PasswordResetConfirmRequest, PasswordResetValidateRequest } from "@/lib/api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [error, setError] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    const emailParam = searchParams.get("email")
    
    if (!tokenParam || !emailParam) {
      setError("Link inválido ou expirado. Solicite um novo link de redefinição.")
      setIsValidatingToken(false)
      return
    }

    setToken(tokenParam)
    setEmail(emailParam)
    validateToken(tokenParam, emailParam)
  }, [searchParams])

  const validateToken = async (tokenValue: string, emailValue: string) => {
    try {
      const requestData: PasswordResetValidateRequest = {
        token: tokenValue,
        email: emailValue
      }
      
      const response = await authApi.validatePasswordResetToken(requestData)
      
      if (response.valid) {
        setIsTokenValid(true)
      } else {
        setError(response.message || "Link inválido ou expirado. Solicite um novo link de redefinição.")
      }
    } catch (err: any) {
      console.error("Erro ao validar token:", err)
      if (err.status === 404 || err.status === 400) {
        setError("Link inválido ou expirado. Solicite um novo link de redefinição.")
      } else {
        setError("Erro ao validar link. Tente novamente.")
      }
    } finally {
      setIsValidatingToken(false)
    }
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("A senha deve ter pelo menos 8 caracteres")
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula")
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula")
    }
    
    if (!/\d/.test(password)) {
      errors.push("A senha deve conter pelo menos um número")
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("A senha deve conter pelo menos um caractere especial")
    }
    
    return errors
  }

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    const errors = validatePassword(newPassword)
    setPasswordErrors(errors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validações
    if (!password || !confirmPassword) {
      setError("Por favor, preencha todos os campos")
      return
    }
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }
    
    const passwordValidationErrors = validatePassword(password)
    if (passwordValidationErrors.length > 0) {
      setError("A senha não atende aos critérios de segurança")
      return
    }
    
    setIsLoading(true)

    try {
      const requestData: PasswordResetConfirmRequest = {
        token,
        email,
        new_password: password
      }
      
      const response = await authApi.confirmPasswordReset(requestData)
      
      if (response.success) {
        setIsPasswordReset(true)
      } else {
        setError(response.message || "Erro ao redefinir senha. Tente novamente.")
      }
      
    } catch (err: any) {
      console.error("Erro ao redefinir senha:", err)
      
      if (err.status === 400) {
        setError("Dados inválidos. Verifique as informações e tente novamente.")
      } else if (err.status === 404) {
        setError("Link inválido ou expirado. Solicite um novo link de redefinição.")
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Erro interno do servidor. Tente novamente mais tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state durante validação do token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Validando link...</h1>
          <p className="text-zinc-400">
            Aguarde enquanto verificamos a validade do seu link de redefinição
          </p>
        </div>
      </div>
    )
  }

  // Estado de sucesso
  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Senha redefinida!</h1>
            <p className="text-zinc-400">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Próximos passos:
            </h3>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>• Faça login com sua nova senha</li>
              <li>• Mantenha sua senha segura</li>
              <li>• Não compartilhe suas credenciais</li>
            </ul>
          </div>

          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-foreground"
          >
            Ir para o login
          </Button>
        </div>
      </div>
    )
  }

  // Estado de erro (token inválido)
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Link inválido</h1>
            <p className="text-zinc-400">
              {error}
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-200 font-medium mb-1">Possíveis causas:</p>
                <ul className="text-amber-100/80 space-y-1">
                  <li>• O link expirou (válido por 1 hora)</li>
                  <li>• O link já foi utilizado</li>
                  <li>• O link foi copiado incorretamente</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/forgot-password">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-foreground">
                Solicitar novo link
              </Button>
            </Link>
            
            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Formulário de redefinição de senha
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Redefinir senha</h1>
          <p className="text-zinc-400">
            Digite sua nova senha para <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-foreground">
              Nova senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="bg-card border-border text-foreground placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="Digite sua nova senha"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {passwordErrors.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordErrors.map((error, index) => (
                  <p key={index} className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirmar nova senha
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-card border-border text-foreground placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="Confirme sua nova senha"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                As senhas não coincidem
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-sm">Critérios de segurança:</h3>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-400' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-zinc-600'}`} />
                Pelo menos 8 caracteres
              </li>
              <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-400' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-400' : 'bg-zinc-600'}`} />
                Uma letra maiúscula
              </li>
              <li className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-400' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(password) ? 'bg-green-400' : 'bg-zinc-600'}`} />
                Uma letra minúscula
              </li>
              <li className={`flex items-center gap-2 ${/\d/.test(password) ? 'text-green-400' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-green-400' : 'bg-zinc-600'}`} />
                Um número
              </li>
              <li className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-400' : 'bg-zinc-600'}`} />
                Um caractere especial
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !password || !confirmPassword || passwordErrors.length > 0 || password !== confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redefinindo senha...
              </div>
            ) : (
              "Redefinir senha"
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
      </div>
    </div>
  )
}