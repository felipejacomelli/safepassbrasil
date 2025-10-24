"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Ticket, ShoppingCart, Users, Settings, BarChart3, LogOut, Menu, X, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  // Verificação de permissões de admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=' + encodeURIComponent(pathname))
        return
      }

      if (!user?.isAdmin) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, isAuthenticated, isLoading, router, pathname])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  // Não renderizar nada se não estiver autenticado ou não for admin
  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Eventos", href: "/admin/events", icon: Ticket },
    { name: "Ocorrências", href: "/admin/occurrences", icon: Calendar },
    { name: "Tipos de Ingressos", href: "/admin/ticket-types", icon: Ticket },
    { name: "Ingressos Únicos", href: "/admin/unique-tickets", icon: Star },
    { name: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
    { name: "Usuários", href: "/admin/users", icon: Users },
    { name: "Relatórios", href: "/admin/reports", icon: BarChart3 },
    { name: "Configurações", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-card border-b border-zinc-800 rounded-b-lg">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded">
            <div className="w-6 h-6 bg-background rounded" />
          </div>
          <span className="text-foreground text-xl font-bold">Safe Pass</span>
          <span className="text-xs text-primary ml-1">ADMIN</span>
        </div>
        <Button variant="ghost" size="icon" className="text-foreground rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-card border-r border-zinc-800 transition-transform duration-300 transform rounded-r-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 p-6 border-b border-zinc-800 rounded-t-r-xl">
          <div className="bg-primary p-1.5 rounded-lg">
            <div className="w-6 h-6 bg-background rounded-lg" />
          </div>
          <span className="text-foreground text-xl font-bold">Safe Pass</span>
          <span className="text-xs text-primary ml-1">ADMIN</span>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-900 bg-opacity-20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 rounded-b-r-xl">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="p-4 lg:p-8 mt-16 lg:mt-0">{children}</div>
      </div>
    </div>
  )
}
