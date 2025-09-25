import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReTicket - Compra e venda de ingressos",
  description: "Plataforma segura para compra e venda de ingressos para eventos",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-black`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <DataProvider>
            <AuthProvider>{children}</AuthProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
