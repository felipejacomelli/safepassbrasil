"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { formatCpf, validateCpfWithMessage } from "@/utils/cpf"
import Header from "@/components/Header"

export default function RegisterPage() {
  const [isDesktop, setIsDesktop] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  // Set desktop state after client mount to avoid hydration mismatch
  useEffect(() => {
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
  }, [])

  // Handle CPF formatting
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formattedCpf = formatCpf(value)
    setCpf(formattedCpf)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setErrors({})

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido"
    }

    if (!cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else {
      const cpfValidation = validateCpfWithMessage(cpf)
      if (!cpfValidation.isValid) {
        newErrors.cpf = cpfValidation.message
      }
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória"
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit form
    setIsSubmitting(true)

    try {
      const result = await register({
        name,
        email,
        password,
        phone: phone || undefined,
        cpf: cpf.replace(/\D/g, ''), // Remove formatação antes de enviar
      })

      if (result.success) {
        setSuccess(true)
        // Redirect after success
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        // Tratar diferentes tipos de erro
        if (result.message?.includes('CPF') || result.message?.includes('duplicate key')) {
          setErrors({ cpf: "Este CPF já está cadastrado no sistema" })
        } else if (result.message?.includes('email')) {
          setErrors({ email: "Este email já está cadastrado no sistema" })
        } else {
          setErrors({ general: result.message || "Erro ao criar conta. Tente novamente." })
        }
      }
    } catch (error: any) {
      console.error('Erro no registro:', error)
      
      // Tratar erros específicos baseados na resposta da API
      if (error.message?.includes('400')) {
        // Erro de validação - tentar extrair detalhes
        setErrors({ general: "Dados inválidos. Verifique as informações e tente novamente." })
      } else if (error.message?.includes('CPF') || error.message?.includes('duplicate')) {
        setErrors({ cpf: "Este CPF já está cadastrado no sistema" })
      } else {
        setErrors({ general: "Erro ao criar conta. Tente novamente." })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      {/* Main Content */}
      <main
        style={{
          padding: "24px 16px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
          }}
        >
          {success ? (
            <div
              style={{
                backgroundColor: "#18181B",
                borderRadius: "12px",
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px auto",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5 13L9 17L19 7"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                Cadastro realizado com sucesso!
              </h2>
              <p
                style={{
                  color: "#A1A1AA",
                  marginBottom: "24px",
                }}
              >
                Sua conta foi criada e você já pode acessar a plataforma.
              </p>
              <a
                href="/"
                style={{
                  display: "inline-block",
                  backgroundColor: "#3B82F6",
                  color: "black",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Ir para a página inicial
              </a>
            </div>
          ) : (
            <>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                Crie sua conta
              </h1>
              <p
                style={{
                  color: "#A1A1AA",
                  marginBottom: "32px",
                  textAlign: "center",
                }}
              >
                Junte-se à comunidade ReTicket e comece a comprar e vender ingressos de forma segura.
              </p>

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    backgroundColor: "#18181B",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                  }}
                >
                  {/* General Error */}
                  {errors.general && (
                    <div
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid #EF4444",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          margin: 0,
                        }}
                      >
                        {errors.general}
                      </p>
                    </div>
                  )}

                  {/* Name Field */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="name"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Nome completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: errors.name ? "1px solid #EF4444" : "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    />
                    {errors.name && (
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: errors.email ? "1px solid #EF4444" : "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    />
                    {errors.email && (
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* CPF Field */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="cpf"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      CPF
                    </label>
                    <input
                      id="cpf"
                      type="text"
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: errors.cpf ? "1px solid #EF4444" : "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    />
                    {errors.cpf && (
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.cpf}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="phone"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Telefone (opcional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: errors.phone ? "1px solid #EF4444" : "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    />
                    {errors.phone && (
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="password"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: errors.password ? "1px solid #EF4444" : "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    />
                    {errors.password && (
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="confirmPassword"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Confirmar senha
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#27272A",
                        color: "white",
                        padding: "12px",
                        borderRadius: "8px",
                        border: errors.confirmPassword ? "1px solid #EF4444" : "1px solid #3F3F46",
                        fontSize: "16px",
                      }}
                    />
                    {errors.confirmPassword && (
                      <p
                        style={{
                          color: "#EF4444",
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="terms"
                        style={{
                          marginTop: "4px",
                        }}
                        required
                      />
                      <label
                        htmlFor="terms"
                        style={{
                          color: "#D4D4D8",
                          fontSize: "14px",
                          lineHeight: "1.6",
                        }}
                      >
                        Eu concordo com os{" "}
                        <a
                          href="#"
                          style={{
                            color: "#3B82F6",
                            textDecoration: "none",
                          }}
                        >
                          Termos e Condições
                        </a>{" "}
                        e{" "}
                        <a
                          href="#"
                          style={{
                            color: "#3B82F6",
                            textDecoration: "none",
                          }}
                        >
                          Política de Privacidade
                        </a>{" "}
                        da ReTicket.
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "black",
                    border: "none",
                    borderRadius: "8px",
                    padding: "16px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    width: "100%",
                    opacity: isSubmitting ? 0.7 : 1,
                    marginBottom: "16px",
                  }}
                >
                  {isSubmitting ? "Processando..." : "Criar conta"}
                </button>

                <p
                  style={{
                    textAlign: "center",
                    color: "#A1A1AA",
                    fontSize: "14px",
                  }}
                >
                  Já tem uma conta?{" "}
                  <a
                    href="/login"
                    style={{
                      color: "#3B82F6",
                      textDecoration: "none",
                    }}
                  >
                    Faça login
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#18181B",
          borderTop: "1px solid #27272A",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <p
            style={{
              color: "#71717A",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            © 2023 ReTicket. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
