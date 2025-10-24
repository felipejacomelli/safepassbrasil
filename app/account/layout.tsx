import type { ReactNode } from "react"
import Link from "next/link"

interface AccountLayoutProps {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <>
      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="bg-card border-t border-zinc-800 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded">
                  <div className="w-6 h-6 bg-background rounded" />
                </div>
                <span className="text-foreground text-xl font-bold">Safe Pass</span>
              </Link>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground text-sm">© 2023 Safe Pass. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
