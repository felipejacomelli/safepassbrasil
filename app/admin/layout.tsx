"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Ticket, ShoppingCart, Users, Settings, BarChart3, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Eventos", href: "/admin/events", icon: Ticket },
    { name: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
    { name: "Usuários", href: "/admin/users", icon: Users },
    { name: "Relatórios", href: "/admin/reports", icon: BarChart3 },
    { name: "Configurações", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded">
            <div className="w-6 h-6 bg-black rounded" />
          </div>
          <span className="text-white text-xl font-bold">reticket</span>
          <span className="text-xs text-primary ml-1">ADMIN</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 p-6 border-b border-zinc-800">
          <div className="bg-primary p-1.5 rounded">
            <div className="w-6 h-6 bg-black rounded" />
          </div>
          <span className="text-white text-xl font-bold">reticket</span>
          <span className="text-xs text-primary ml-1">ADMIN</span>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-900 bg-opacity-20 text-primary"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="p-4 lg:p-8 mt-16 lg:mt-0">{children}</div>
      </div>
    </div>
  )
}
