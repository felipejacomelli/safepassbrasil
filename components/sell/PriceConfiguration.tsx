"use client"

import { memo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { usePriceCalculations } from "@/hooks/use-price-calculations"

interface PriceConfigurationProps {
  price: number
  onChange: (price: number) => void
  platformFeeRate: number
}

export const PriceConfiguration = memo(({ price, onChange, platformFeeRate }: PriceConfigurationProps) => {
  const [inputValue, setInputValue] = useState("")
  
  const { formattedSellerReceives, formattedPlatformFee } = usePriceCalculations({
    price,
    platformFeeRate
  })

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Se o campo estiver vazio, definir como 0
    if (value === '') {
      onChange(0)
      return
    }
    
    // Converter vírgula para ponto para parseFloat
    const normalizedValue = value.replace(',', '.')
    const numericValue = parseFloat(normalizedValue)
    
    // Só atualizar se for um número válido e não negativo
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="price" className="text-white font-medium">
        Preço unitário de cada ingresso
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm font-medium">R$</span>
        <Input
          id="price"
          type="text"
          value={inputValue}
          onChange={handlePriceChange}
          placeholder="0,00"
          className="pl-8 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded"
          aria-label="Preço do ingresso"
          inputMode="decimal"
        />
      </div>
      
      {price > 0 && (
        <Card className="bg-green-950/20 border-green-500/30 rounded">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">
                  Você receberá:
                </div>
                <div className="text-lg font-bold text-green-400">
                  R$ {formattedSellerReceives}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

PriceConfiguration.displayName = "PriceConfiguration"
