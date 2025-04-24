import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  SlidersHorizontal,
  Music,
  Ticket,
  Theater,
  ClubIcon as Football,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bot,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  InstagramIcon as TiktokIcon,
  CalendarDays,
  MapPin,
} from "lucide-react"

export default function Page() {
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-20 pb-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight">
          Ingressos diretamente de outro fã
        </h1>
        <p className="text-primary text-xl md:text-2xl font-medium mt-4">Seguro, confiável e muito Simples.</p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mt-8 relative">
          <Input
            type="search"
            placeholder="Busque por evento, categoria ou palavra-chave"
            className="w-full bg-zinc-900/80 border-zinc-800 text-white placeholder:text-gray-400 h-14 pl-12 pr-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <Button size="lg" className="mt-8 bg-primary hover:bg-blue-600 text-black font-semibold px-8 py-6 text-lg">
          Comprar e vender ingressos
        </Button>
      </main>

      {/* Events Section */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">Próximos eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-2">
            <span className="text-white">Categorias de </span>
            <span className="text-primary">Eventos</span>
          </h2>
          <p className="text-gray-400 mb-12">Busque eventos por categoria</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link href="#" className="group relative rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60"
                alt="Shows"
                width={400}
                height={200}
                className="w-full h-48 object-cover brightness-75 group-hover:brightness-50 transition-all duration-300"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="bg-black/30 p-3 rounded-lg backdrop-blur-sm">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xl font-semibold">Shows</span>
              </div>
            </Link>

            <Link href="#" className="group relative rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60"
                alt="Festivals"
                width={400}
                height={200}
                className="w-full h-48 object-cover brightness-75 group-hover:brightness-50 transition-all duration-300"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="bg-black/30 p-3 rounded-lg backdrop-blur-sm">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xl font-semibold">Festivals</span>
              </div>
            </Link>

            <Link href="#" className="group relative rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=60"
                alt="Teatros"
                width={400}
                height={200}
                className="w-full h-48 object-cover brightness-75 group-hover:brightness-50 transition-all duration-300"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="bg-black/30 p-3 rounded-lg backdrop-blur-sm">
                  <Theater className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xl font-semibold">Teatros</span>
              </div>
            </Link>

            <Link href="#" className="group relative rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1577223625816-7546c937db8e?w=800&auto=format&fit=crop&q=60"
                alt="Esportes"
                width={400}
                height={200}
                className="w-full h-48 object-cover brightness-75 group-hover:brightness-50 transition-all duration-300"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="bg-black/30 p-3 rounded-lg backdrop-blur-sm">
                  <Football className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xl font-semibold">Esportes</span>
              </div>
            </Link>

            <Link
              href="#"
              className="group relative rounded-lg overflow-hidden bg-zinc-800 h-48 flex items-center justify-center"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="bg-zinc-700 p-3 rounded-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xl font-semibold">Outras categorias</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-2">
            <span className="text-primary">Eventos</span>
            <span className="text-white"> por Localização</span>
          </h2>
          <p className="text-gray-400 mb-12">Busque eventos pelas cidades mais populares</p>

          <div className="relative max-w-6xl mx-auto">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
              <Link
                href="#"
                className="relative flex-none w-[300px] h-[400px] rounded-3xl overflow-hidden snap-start group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1598484548834-926b0f3924e4?w=800&auto=format&fit=crop&q=60"
                  alt="Curitiba"
                  width={300}
                  height={400}
                  className="object-cover w-full h-full brightness-75 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <h3 className="absolute bottom-6 left-6 text-white text-2xl font-bold">Curitiba</h3>
              </Link>

              <Link
                href="#"
                className="relative flex-none w-[300px] h-[400px] rounded-3xl overflow-hidden snap-start group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1578002573559-689b0abc4148?w=800&auto=format&fit=crop&q=60"
                  alt="São Paulo"
                  width={300}
                  height={400}
                  className="object-cover w-full h-full brightness-75 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <h3 className="absolute bottom-6 left-6 text-white text-2xl font-bold">São Paulo</h3>
              </Link>

              <Link
                href="#"
                className="relative flex-none w-[300px] h-[400px] rounded-3xl overflow-hidden snap-start group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=60"
                  alt="Rio de Janeiro"
                  width={300}
                  height={400}
                  className="object-cover w-full h-full brightness-75 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <h3 className="absolute bottom-6 left-6 text-white text-2xl font-bold">Rio de Janeiro</h3>
              </Link>
            </div>

            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12 flex items-center justify-center gap-3">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-8 h-8 bg-black rounded" />
            </div>
            <span className="text-primary">3 motivos</span>
            <span className="text-white">para usar</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="relative p-8">
              <div className="absolute inset-0 border border-zinc-700 rounded-[2.5rem] [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%,0%_15%,2%_15%,2%_3%,98%_3%,98%_97%,2%_97%,2%_85%,0%_85%)]" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <Ticket className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-lg leading-tight">Versatilidade: compre e venda todo tipo de ingresso</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative p-8">
              <div className="absolute inset-0 border border-zinc-700 rounded-[2.5rem] [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%,0%_15%,2%_15%,2%_3%,98%_3%,98%_97%,2%_97%,2%_85%,0%_85%)]" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-lg leading-tight">
                  Segurança: o vendedor só recebe se o ingresso for válido
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative p-8">
              <div className="absolute inset-0 border border-zinc-700 rounded-[2.5rem] [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%,0%_15%,2%_15%,2%_3%,98%_3%,98%_97%,2%_97%,2%_85%,0%_85%)]" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-lg leading-tight">
                  Facilidade: um ChatBot inteligente que te guia em cada etapa
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-16">
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
                  <Ticket className="w-5 h-5 text-primary mt-1" />
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

function EventCard({ image, title, date, location, price, slug }) {
  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <Link href={slug ? `/event/${slug}` : "#"}>
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          width={400}
          height={200}
          className="w-full h-48 object-cover cursor-pointer"
        />
      </Link>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <div className="flex items-center text-gray-400 mb-2">
          <CalendarDays className="w-4 h-4 mr-2" />
          <span>{date}</span>
        </div>
        <div className="flex items-center text-gray-400 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{location}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-primary font-semibold">{price}</span>
          <Link href={`/event/${slug}`}>
            <Button variant="outline" className="bg-black text-white border-primary hover:bg-primary hover:text-black">
              Ver ingressos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const events = [
  {
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60",
    title: "Festival de Verão",
    date: "15 de Dezembro, 2023",
    location: "Praia de Copacabana, Rio de Janeiro",
    price: "A partir de R$ 150",
    slug: "festival-de-verao",
  },
  {
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=60",
    title: "Rock in Rio",
    date: "2 de Setembro, 2023",
    location: "Cidade do Rock, Rio de Janeiro",
    price: "A partir de R$ 250",
    slug: "rock-in-rio-2023",
  },
  {
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
    title: "Lollapalooza Brasil",
    date: "24 de Março, 2024",
    location: "Autódromo de Interlagos, São Paulo",
    price: "A partir de R$ 200",
    slug: "lollapalooza-brasil-2024",
  },
]

