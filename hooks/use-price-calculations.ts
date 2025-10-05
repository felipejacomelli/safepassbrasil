"use client"

import { useMemo } from "react"

interface UsePriceCalculationsProps {
  price: number
  platformFeeRate: number
}

export function usePriceCalculations({ price, platformFeeRate }: UsePriceCalculationsProps) {
  const sellerReceives = useMemo(() => {
    if (price <= 0) return 0
    return price * (1 - platformFeeRate)
  }, [price, platformFeeRate])
  
  const platformFee = useMemo(() => {
    if (price <= 0) return 0
    return price * platformFeeRate
  }, [price, platformFeeRate])

  const totalValue = useMemo(() => {
    return price
  }, [price])

  const formattedSellerReceives = useMemo(() => {
    return sellerReceives.toFixed(2)
  }, [sellerReceives])

  const formattedPlatformFee = useMemo(() => {
    return platformFee.toFixed(2)
  }, [platformFee])

  const formattedTotalValue = useMemo(() => {
    return totalValue.toFixed(2)
  }, [totalValue])

  return {
    sellerReceives,
    platformFee,
    totalValue,
    formattedSellerReceives,
    formattedPlatformFee,
    formattedTotalValue
  }
}
