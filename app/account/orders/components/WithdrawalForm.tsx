"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/formatCurrency"
import { PaymentMethod, PaymentMethodType } from "@/lib/types/orders"
import { QrCode, Landmark } from "lucide-react"

interface WithdrawalFormProps {
  withdrawalAmount: string
  onAmountChange: (amount: string) => void
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethodType) => void
  availableBalance: number
  onConfirm: () => void
  onCancel: () => void
}

export function WithdrawalForm({
  withdrawalAmount,
  onAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  availableBalance,
  onConfirm,
  onCancel
}: WithdrawalFormProps) {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 mb-8 border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-4">Solicitar Saque</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="withdrawal-amount" className="block text-sm font-medium text-gray-300 mb-2">
            Valor do Saque
          </label>
          <input
            id="withdrawal-amount"
            type="number"
            value={withdrawalAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0,00"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            aria-describedby="withdrawal-amount-help"
          />
          <p id="withdrawal-amount-help" className="text-xs text-gray-400 mt-1">
            Valor máximo disponível: {formatCurrency(availableBalance)}
          </p>
        </div>
        
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-300 mb-2">
              Método de Pagamento
            </legend>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onPaymentMethodChange("pix")}
                className={`w-full flex items-center p-3 rounded-lg border ${
                  paymentMethod.method === "pix"
                    ? "border-blue-500 bg-blue-900 bg-opacity-20"
                    : "border-zinc-700 bg-zinc-800"
                }`}
                aria-pressed={paymentMethod.method === "pix"}
              >
                <QrCode className="w-5 h-5 mr-3" />
                <span>PIX</span>
              </button>
              
              <button
                type="button"
                onClick={() => onPaymentMethodChange("bank")}
                className={`w-full flex items-center p-3 rounded-lg border ${
                  paymentMethod.method === "bank"
                    ? "border-blue-500 bg-blue-900 bg-opacity-20"
                    : "border-zinc-700 bg-zinc-800"
                }`}
                aria-pressed={paymentMethod.method === "bank"}
              >
                <Landmark className="w-5 h-5 mr-3" />
                <span>Transferência Bancária</span>
              </button>
            </div>
          </fieldset>
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6">
        <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
          Confirmar Saque
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-zinc-700 text-white hover:bg-zinc-800"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}