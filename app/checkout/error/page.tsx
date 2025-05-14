"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CreditCard, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorReason, setErrorReason] = useState<string>("")
  const [errorTitle, setErrorTitle] = useState<string>("Falha no Pagamento")
  const [errorDescription, setErrorDescription] = useState<string>(
    "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente ou use outro método de pagamento.",
  )

  useEffect(() => {
    const reason = searchParams.get("reason") || "unknown"
    setErrorReason(reason)

    // Set error details based on reason
    switch (reason) {
      case "payment_declined":
        setErrorTitle("Pagamento Recusado")
        setErrorDescription(
          "Seu cartão foi recusado pela operadora. Por favor, verifique os dados ou use outro método de pagamento.",
        )
        break
      case "insufficient_funds":
        setErrorTitle("Saldo Insuficiente")
        setErrorDescription(
          "Seu cartão não possui saldo suficiente para esta compra. Por favor, use outro método de pagamento.",
        )
        break
      case "card_expired":
        setErrorTitle("Cartão Expirado")
        setErrorDescription("Seu cartão está expirado. Por favor, use outro cartão ou método de pagamento.")
        break
      case "invalid_card":
        setErrorTitle("Cartão Inválido")
        setErrorDescription("Os dados do cartão informados são inválidos. Por favor, verifique e tente novamente.")
        break
      case "timeout":
        setErrorTitle("Tempo Esgotado")
        setErrorDescription("A operação demorou muito tempo e foi cancelada. Por favor, tente novamente.")
        break
      default:
        setErrorTitle("Falha no Pagamento")
        setErrorDescription(
          "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente ou use outro método de pagamento.",
        )
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="w-full py-4 border-b border-zinc-800">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-black rounded" />
            </div>
            <span className="text-white text-xl font-bold">reticket</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white hover:text-primary transition">
              Como Funciona
            </a>
            <a href="#" className="text-white hover:text-primary transition">
              WhatsApp
            </a>
            <Button variant="outline" className="bg-black text-white border-primary hover:bg-primary hover:text-black">
              Acessar
            </Button>
          </div>
        </div>
      </nav>

      {/* Error Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 rounded-lg p-8 border border-red-800">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-red-900 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{errorTitle}</h1>
              <p className="text-gray-400">{errorDescription}</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <h3 className="text-white font-medium mb-2">O que fazer agora?</h3>
                <ul className="text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CreditCard className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Verifique os dados do seu cartão e tente novamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Tente outro método de pagamento</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1 bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Pagamento
                </Button>
                <Button
                  onClick={() => router.push("/checkout")}
                  className="flex-1 bg-primary hover:bg-blue-600 text-black"
                >
                  Tentar Novamente
                </Button>
              </div>

              <div className="text-center mt-6">
                <Link href="/cart" className="text-primary hover:underline text-sm">
                  Voltar ao Carrinho
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded">
                  <div className="w-6 h-6 bg-black rounded" />
                </div>
                <span className="text-white text-xl font-bold">reticket</span>
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">© 2023 ReTicket. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
