"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { User, Package, Shield, BadgeCheck, LogOut } from "lucide-react"

export function AccountSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isVerified = user?.isVerified || false

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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500">Saldo</p>
              <p className="font-medium">R$ {user?.balance.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500">Pendente</p>
              <p className="font-medium">R$ {user?.pendingBalance.toFixed(2)}</p>
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
                pathname === item.href ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
              {item.status && (
                <span
                  className={cn(
                    "ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                    item.status === "verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800",
                  )}
                >
                  {item.status === "verified" ? "Verificado" : "Pendente"}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
