"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Bot,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  InstagramIcon as TiktokIcon,
} from "lucide-react"
import { useParams } from "next/navigation"

export default function EventDetails() {
  const params = useParams()
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="w-full py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-black rounded" />
            </div>
            <span className="text-white text-xl font-bold">reticket</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-white hover:text-primary transition">
              Como Funciona
            </Link>
            <Link href="#" className="text-white hover:text-primary transition">
              WhatsApp
            </Link>
            <Button variant="outline" className="bg-black text-white border-primary hover:bg-primary hover:text-black">
              Acessar
            </Button>
          </div>
        </div>
      </nav>

      {/* Event Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4">Rock in Rio 2023</h1>
            <div className="relative aspect-video mb-6">
              <Image
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Rock in Rio"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-gray-300">
                <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                <span>2-10 Set, 2023</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                <span>Rio de Janeiro</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                <span>14:00 - 00:00</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Users className="w-5 h-5 mr-2 text-primary" />
                <span>100.000+ pessoas</span>
              </div>
            </div>
            <div className="text-gray-300 space-y-4">
              <p>
                O Rock in Rio é um dos maiores festivais de música do mundo, reunindo artistas nacionais e
                internacionais em performances inesquecíveis. Em 2023, o evento promete ser ainda mais grandioso, com
                uma lineup diversificada e cheia de estrelas.
              </p>
              <p>
                Durante os dias de festival, a Cidade do Rock se transforma em um verdadeiro parque de diversões para os
                amantes da música, com várias atrações além dos shows principais, incluindo a famosa roda gigante,
                tirolesa, e diversas opções gastronômicas.
              </p>
              <p>
                Não perca a chance de fazer parte deste evento histórico e viver momentos únicos ao som de seus artistas
                favoritos!
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-zinc-900 p-6 rounded-lg h-fit">
            <h2 className="text-2xl font-bold text-white mb-4">Ingressos Disponíveis</h2>
            <div className="space-y-4">
              <div className="bg-black p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Selecione o tipo de ingresso</h3>
                <select className="w-full bg-zinc-800 text-white p-2 rounded mb-4">
                  <option>Pista Premium</option>
                  <option>Pista</option>
                  <option>Cadeira Inferior</option>
                  <option>Cadeira Superior</option>
                </select>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-300">Acesso ao evento</p>
                  <div className="bg-blue-500 bg-opacity-20 px-2 py-1 rounded text-blue-400 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V10M22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10M22 10H2M9 14H15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    12 ingressos disponíveis
                  </div>
                </div>
                <p className="text-primary font-bold text-xl mb-4">R$ 750,00</p>
                <div className="flex gap-2">
                  <Button
                    className="w-full bg-primary hover:bg-blue-600 text-black flex items-center justify-center"
                    onClick={() => (window.location.href = "/cart")}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 3H5L5.4 5M5.4 5H21L17 13H7M5.4 5L7 13M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C16.4696 17 15.9609 17.2107 15.5858 17.5858C15.2107 17.9609 15 18.4696 15 19C15 19.5304 15.2107 20.0391 15.5858 20.4142C15.9609 20.7893 16.4696 21 17 21C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19C19 18.4696 18.7893 17.9609 18.4142 17.5858C18.0391 17.2107 17.5304 17 17 17Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent border-primary text-primary hover:bg-primary hover:text-black"
                    onClick={() => (window.location.href = "/checkout")}
                  >
                    Comprar Agora
                  </Button>
                </div>
              </div>

              <div className="bg-black p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Tem ingressos para vender?</h3>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                  onClick={() => (window.location.href = `/sell`)}
                >
                  Vender Ingressos
                </Button>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Galeria de Imagens</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Image
                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Rock in Rio 1"
                width={300}
                height={200}
                className="rounded-lg object-cover w-full h-48"
              />
              <Image
                src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                alt="Rock in Rio 2"
                width={300}
                height={200}
                className="rounded-lg object-cover w-full h-48"
              />
              <Image
                src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Rock in Rio 3"
                width={300}
                height={200}
                className="rounded-lg object-cover w-full h-48"
              />
              <Image
                src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Rock in Rio 4"
                width={300}
                height={200}
                className="rounded-lg object-cover w-full h-48"
              />
            </div>
          </section>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Sobre</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                ReTicket é uma plataforma confiável para compra e venda de ingressos diretamente entre fãs.
              </p>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                Nossa missão é conectar pessoas, que desejam revender seus ingressos devido a imprevistos, com
                compradores que procuram as melhores ofertas de última hora.
              </p>
              <p className="text-gray-400 text-sm mt-4">Seja bem bem vindo, seja feliz, seja ReTicket!</p>
            </div>

            {/* Quick Access */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Acesso Rápido</h3>
              <div className="flex flex-col gap-2">
                <Link href="#" className="text-gray-400 hover:text-primary transition">
                  Como Funciona
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary transition">
                  Login
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary transition">
                  Termos de Uso
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary transition">
                  Política de Privacidade
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary transition">
                  Início
                </Link>
              </div>
            </div>

            {/* Guarantee Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Garantia ReTicket</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-white font-medium">Ingresso Garantido</p>
                    <p className="text-gray-400 text-sm">
                      Para o comprador: garantimos sua entrada ou seu dinheiro de volta.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-white font-medium">Pagamento Garantido</p>
                    <p className="text-gray-400 text-sm">
                      Para o vendedor: garantimos seu pagamento por ingressos válidos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-white font-medium">Plataforma Confiável</p>
                    <p className="text-gray-400 text-sm">
                      Transações autenticadas, suporte humano e conformidade com as leis brasileiras.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <Link href="#" className="bg-zinc-800 p-2 rounded-full hover:bg-primary transition">
                  <Facebook className="w-5 h-5 text-white" />
                </Link>
                <Link href="#" className="bg-zinc-800 p-2 rounded-full hover:bg-primary transition">
                  <Instagram className="w-5 h-5 text-white" />
                </Link>
                <Link href="#" className="bg-zinc-800 p-2 rounded-full hover:bg-primary transition">
                  <Youtube className="w-5 h-5 text-white" />
                </Link>
                <Link href="#" className="bg-zinc-800 p-2 rounded-full hover:bg-primary transition">
                  <Twitter className="w-5 h-5 text-white" />
                </Link>
                <Link href="#" className="bg-zinc-800 p-2 rounded-full hover:bg-primary transition">
                  <TiktokIcon className="w-5 h-5 text-white" />
                </Link>
              </div>
              <div className="mt-6">
                <Image
                  src="https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&auto=format&fit=crop&q=60"
                  alt="Trust Badge"
                  width={180}
                  height={60}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
