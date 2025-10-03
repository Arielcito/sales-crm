"use client"

import { useQuery } from "@tanstack/react-query"
import { getCurrentExchangeRate, convertCurrency } from "@/lib/services/exchange-rate.service"
import type { Currency } from "@/lib/types"

export function useExchangeRate() {
  return useQuery({
    queryKey: ["exchange-rate"],
    queryFn: async () => {
      const response = await fetch("/api/exchange-rate")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener tipo de cambio")
      return json.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useConvertCurrency() {
  const { data: exchangeRate } = useExchangeRate()

  const rate = exchangeRate ? Number(exchangeRate.usdToArs) : null

  return {
    convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
      if (fromCurrency === toCurrency) {
        return amount
      }

      if (!rate || Number.isNaN(rate)) {
        return amount
      }

      if (fromCurrency === "USD" && toCurrency === "ARS") {
        return amount * rate
      }

      if (fromCurrency === "ARS" && toCurrency === "USD" && rate !== 0) {
        return amount / rate
      }

      return amount
    },
  }
}
