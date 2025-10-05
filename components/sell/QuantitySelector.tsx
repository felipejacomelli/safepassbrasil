"use client"

import { memo } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Minus, AlertCircle } from "lucide-react"

interface QuantitySelectorProps {
  value: number
  onChange: (quantity: number) => void
  maxQuantity?: number
  disabled?: boolean
}

export const QuantitySelector = memo(({ 
  value, 
  onChange, 
  maxQuantity = 10, 
  disabled = false 
}: QuantitySelectorProps) => {
  const handleIncrement = () => {
    if (value < maxQuantity) {
      onChange(value + 1)
    }
  }

  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-white font-medium">
        Quantidade
      </Label>
      
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled || value <= 1}
          className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          aria-label="Diminuir quantidade"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <div className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 font-bold min-w-[60px] text-center rounded">
          {value}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled || value >= maxQuantity}
          className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          aria-label="Aumentar quantidade"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <Alert className="bg-yellow-950/20 border-yellow-500/30 rounded">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <AlertDescription className="text-yellow-400 text-sm">
          Se você tiver mais de um ingresso para venda, eles serão vendidos separadamente. 
          Você receberá o pagamento após a validação de cada ingresso.
        </AlertDescription>
      </Alert>
    </div>
  )
})

QuantitySelector.displayName = "QuantitySelector"
