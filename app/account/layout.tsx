import type { ReactNode } from "react"

interface AccountLayoutProps {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <>
      {/* Navigation */}
      <nav className="w-full py-4 border-b border-zinc-800 bg-black">
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}

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
    </>
  )
}
