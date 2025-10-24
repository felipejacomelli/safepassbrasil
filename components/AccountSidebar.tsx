"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { User, LogOut, Ticket, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
    { name: "Meus Ingressos", href: "/account/orders", icon: Ticket },
    {
      name: "Verificação",
      href: "/account/verification",
      icon: ShieldCheck,
      status: isVerified ? "verified" : "pending",
    },
  ]

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <Card className="bg-card rounded border-border flex flex-col h-full">
        {/* Header */}
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded bg-accent flex items-center justify-center text-card-foreground font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-card-foreground">{user?.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "email@example.com"}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Card className="bg-accent rounded border-border">
              <CardContent className="p-2">
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className="font-medium text-card-foreground">R$ {(balance !== undefined ? balance : 0).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-accent rounded border-border">
              <CardContent className="p-2">
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="font-medium text-card-foreground">R$ {(pendingBalance !== undefined ? pendingBalance : 0).toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
        </CardHeader>

        <Separator className="bg-border" />

        {/* Navigation - Flex grow para ocupar espaço disponível */}
        <CardContent className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start h-auto p-3 rounded",
                pathname === item.href
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-card-foreground hover:bg-accent",
              )}
            >
              <Link href={item.href}>
                <item.icon size={20} />
                <span className="ml-3">{item.name}</span>
                {item.status && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-auto",
                      item.status === "verified"
                        ? "bg-green-500/20 text-green-600 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
                    )}
                  >
                    {item.status === "verified" ? "Verificado" : "Pendente"}
                  </Badge>
                )}
              </Link>
            </Button>
          ))}
        </CardContent>

        <Separator className="bg-border" />

        {/* Logout Button - Flex shrink para ficar fixo no bottom */}
        <CardContent className="flex-shrink-0 p-4">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start h-auto p-3 rounded text-muted-foreground hover:text-card-foreground hover:bg-accent"
          >
            <LogOut size={20} />
            <span className="ml-3">Sair</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
