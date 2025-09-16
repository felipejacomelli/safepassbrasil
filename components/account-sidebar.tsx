"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { User, Package, Shield, BadgeCheck, LogOut } from "lucide-react"

interface AccountSidebarProps {
  balance?: number
  pendingBalance?: number
}

export function AccountSidebar({ balance, pendingBalance }: AccountSidebarProps = {}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isVerified = user?.isVerified || false

  // Usar props se fornecidas, senão usar valores do contexto
  const displayBalance = balance !== undefined ? balance : (user?.balance || 0)
  const displayPendingBalance = pendingBalance !== undefined ? pendingBalance : (user?.pendingBalance || 0)

  const navigation = [
    { name: "Minha Conta", href: "/account", icon: User },
    { name: "Pedidos", href: "/account/orders", icon: Package },
    { name: "Segurança", href: "/account/security", icon: Shield },
    {
      name: "Verificação",
      href: "/account/verification",
      icon: BadgeCheck,
      status: isVerified ? "verified" : "pending",
    },
  ]

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-zinc-900 rounded-lg shadow-lg border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center text-white">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-zinc-800 p-2 rounded">
              <p className="text-xs text-gray-400">Saldo</p>
              <p className="font-medium text-white">R$ {displayBalance.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-800 p-2 rounded">
              <p className="text-xs text-gray-400">Pendente</p>
              <p className="font-medium text-white">R$ {displayPendingBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <nav className="p-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md my-1",
                pathname === item.href ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-zinc-800 hover:text-white",
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
              {item.status && (
                <span
                  className={cn(
                    "ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                    item.status === "verified" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300",
                  )}
                >
                  {item.status === "verified" ? "Verificado" : "Pendente"}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={logout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-zinc-800 hover:text-red-300"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
