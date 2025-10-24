"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/formatCurrency"
import { ArrowUpFromLine } from "lucide-react"

interface BalanceSectionProps {
  availableBalance: number
  pendingBalance: number
  onWithdrawClick: () => void
}

export function BalanceSection({ 
  availableBalance, 
  pendingBalance, 
  onWithdrawClick 
}: BalanceSectionProps) {
  return (
    <div className="bg-blue-600 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Saldo Disponível</h2>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(availableBalance)}</p>
          <p className="text-muted-foreground mt-1">
            Pendente: {formatCurrency(pendingBalance)}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={onWithdrawClick}
            className="bg-background text-foreground hover:bg-accent"
            aria-label="Solicitar saque do saldo disponível"
          >
            <ArrowUpFromLine className="w-4 h-4 mr-2" />
            Sacar
          </Button>
        </div>
      </div>
    </div>
  )
}