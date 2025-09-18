"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { User, Package, Shield, BadgeCheck, LogOut, Settings } from "lucide-react"

interface AccountSidebarProps {
  balance?: number
  pendingBalance?: number
}

export function AccountSidebar({ balance, pendingBalance }: AccountSidebarProps = {}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isVerified = user?.isVerified || false

  const navigation = [
    { name: "Minha Conta", href: "/account", icon: User },
    { name: "Meus Pedidos", href: "/account/orders", icon: Package },
    { name: "Segurança", href: "/account/security", icon: Shield },
    {
      name: "Verificação",
      href: "/account/verification",
      icon: BadgeCheck,
      status: isVerified ? "verified" : "pending",
    },
    { name: "Configurações", href: "/account/settings", icon: Settings },
  ]

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-zinc-900 border-r border-zinc-800 overflow-hidden relative h-full">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name || "Usuário"}</p>
              <p className="text-xs text-gray-400">{user?.email || "email@example.com"}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-zinc-800 p-2 rounded">
              <p className="text-xs text-gray-400">Saldo</p>
              <p className="font-medium text-white">R$ {(balance !== undefined ? balance : user?.balance || 0).toFixed(2)}</p>
            </div>
            <div className="bg-zinc-800 p-2 rounded">
              <p className="text-xs text-gray-400">Pendente</p>
              <p className="font-medium text-white">R$ {(pendingBalance !== undefined ? pendingBalance : user?.pendingBalance || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href
                  ? "bg-blue-900 bg-opacity-20 text-primary"
                  : "text-gray-400 hover:text-white hover:bg-zinc-800",
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
              {item.status && (
                <span
                  className={cn(
                    "ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                    item.status === "verified"
                      ? "bg-green-900 bg-opacity-20 text-green-500"
                      : "bg-yellow-900 bg-opacity-20 text-yellow-500",
                  )}
                >
                  {item.status === "verified" ? "Verificado" : "Pendente"}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  )
}
