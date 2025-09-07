"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Download, Mail, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")

  useEffect(() => {
    // Generate a random order number
    const randomOrderNumber = Math.floor(100000 + Math.random() * 900000).toString()
    setOrderNumber(randomOrderNumber)
  }, [])

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
            <a href="/#como-funciona" className="text-white hover:text-primary transition">
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

      {/* Success Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 rounded-lg p-8 border border-green-800">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-green-900 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Compra Realizada com Sucesso!</h1>
              <p className="text-gray-400">
                Seu pedido #{orderNumber} foi confirmado e seus ingressos estão disponíveis na sua conta.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <h3 className="text-white font-medium mb-2">Detalhes do Pedido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Número do Pedido:</span>
                    <span className="text-white font-medium">#{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white">
                      {new Date().toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Método de Pagamento:</span>
                    <span className="text-white">Cartão de Crédito</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-500">Confirmado</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg">
                <h3 className="text-white font-medium mb-2">Próximos Passos</h3>
                <ul className="text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Enviamos um email com os detalhes da sua compra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Download className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Você pode baixar seus ingressos na área "Meus Ingressos" da sua conta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Adicione o evento ao seu calendário para não perder a data</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  onClick={() => router.push("/account/orders")}
                  className="flex-1 bg-primary hover:bg-blue-600 text-black"
                >
                  Ver Meus Ingressos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-center mt-6">
                <Link href="/" className="text-primary hover:underline text-sm">
                  Voltar à Página Inicial
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
