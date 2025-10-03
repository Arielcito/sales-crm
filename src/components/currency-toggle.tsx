"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useExchangeRate } from "@/hooks/use-exchange-rate"
import type { Currency } from "@/lib/types"

interface CurrencyToggleProps {
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
}

export function CurrencyToggle({ currency, onCurrencyChange }: CurrencyToggleProps) {
  const { data: exchangeRateData } = useExchangeRate()
  const exchangeRate = exchangeRateData?.venta || 0

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Moneda:</span>
      <div className="flex items-center space-x-1">
        <Button variant={currency === "USD" ? "default" : "outline"} size="sm" onClick={() => onCurrencyChange("USD")}>
          USD
        </Button>
        <Button variant={currency === "ARS" ? "default" : "outline"} size="sm" onClick={() => onCurrencyChange("ARS")}>
          ARS
        </Button>
      </div>
      <Badge variant="secondary" className="text-xs">
        1 USD = {exchangeRate.toLocaleString()} ARS
      </Badge>
    </div>
  )
}
