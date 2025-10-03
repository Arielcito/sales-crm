"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import type { User } from "@/lib/types"

interface CurrencySettingsProps {
  currentUser: User
}

interface ExchangeRate {
  currency: string
  name: string
  type?: string
  rate: number
  change: number
  lastUpdate: Date
}

export function CurrencySettings({ currentUser }: CurrencySettingsProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadExchangeRates()
  }, [])

  const loadExchangeRates = () => {
    // Mock data - in production this would fetch from an API
    const rates: ExchangeRate[] = [
      {
        currency: "USD",
        name: "Dólar Blue",
        type: "Blue",
        rate: 1050,
        change: 2.5,
        lastUpdate: new Date(),
      },
      {
        currency: "USD",
        name: "Dólar Oficial",
        type: "Oficial",
        rate: 850,
        change: 0.8,
        lastUpdate: new Date(),
      },
      {
        currency: "USD",
        name: "Dólar Cripto",
        type: "Cripto",
        rate: 1045,
        change: 1.2,
        lastUpdate: new Date(),
      },
      {
        currency: "EUR",
        name: "Euro",
        rate: 1150,
        change: -0.5,
        lastUpdate: new Date(),
      },
      {
        currency: "BRL",
        name: "Real Brasileño",
        rate: 210,
        change: 1.8,
        lastUpdate: new Date(),
      },
      {
        currency: "CLP",
        name: "Peso Chileno",
        rate: 1.15,
        change: 0.3,
        lastUpdate: new Date(),
      },
      {
        currency: "UYU",
        name: "Peso Uruguayo",
        rate: 22,
        change: -0.2,
        lastUpdate: new Date(),
      },
    ]
    setExchangeRates(rates)
    setLastUpdate(new Date())
  }

  const handleRefresh = async () => {
    setIsUpdating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock updated rates with random fluctuations
    const updatedRates = exchangeRates.map((rate) => ({
      ...rate,
      rate: rate.rate + (Math.random() * 10 - 5),
      change: Math.random() * 5 - 2.5,
      lastUpdate: new Date(),
    }))

    setExchangeRates(updatedRates)
    setLastUpdate(new Date())
    setIsUpdating(false)
  }

  const getCurrencyIcon = (currency: string) => {
    const icons: Record<string, string> = {
      USD: "$",
      EUR: "€",
      BRL: "R$",
      CLP: "$",
      UYU: "$U",
    }
    return icons[currency] || currency
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cotizaciones</h2>
          <p className="text-muted-foreground">Valor del Peso Argentino (ARS) en diferentes monedas</p>
        </div>
        <Button onClick={handleRefresh} disabled={isUpdating} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
          {isUpdating ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Última actualización:{" "}
        {lastUpdate.toLocaleString("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </div>

      {/* USD Rates (Blue, Oficial, Cripto) */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Dólar Estadounidense (USD)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exchangeRates
            .filter((rate) => rate.currency === "USD")
            .map((rate, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>{rate.name}</span>
                    <Badge variant={rate.type === "Blue" ? "default" : "secondary"} className="text-xs">
                      {rate.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold">${rate.rate.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">ARS por USD</div>
                    </div>
                    <div
                      className={`flex items-center text-sm font-medium ${
                        rate.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {rate.change >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(rate.change).toFixed(2)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Other Currencies */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Otras Monedas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exchangeRates
            .filter((rate) => rate.currency !== "USD")
            .map((rate, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{rate.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold">
                      {getCurrencyIcon(rate.currency)}
                      {rate.rate.toFixed(2)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {rate.currency}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ARS por {rate.currency}</span>
                    <span
                      className={`flex items-center font-medium ${
                        rate.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {rate.change >= 0 ? "+" : ""}
                      {rate.change.toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Conversion Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-sm">Desde ARS</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>ARS 100,000</span>
                  <span className="font-medium">
                    ≈ ${(100000 / (exchangeRates.find((r) => r.type === "Blue")?.rate || 1050)).toFixed(2)} USD (Blue)
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>ARS 100,000</span>
                  <span className="font-medium">
                    ≈ €{(100000 / (exchangeRates.find((r) => r.currency === "EUR")?.rate || 1150)).toFixed(2)} EUR
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>ARS 100,000</span>
                  <span className="font-medium">
                    ≈ R${(100000 / (exchangeRates.find((r) => r.currency === "BRL")?.rate || 210)).toFixed(2)} BRL
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Hacia ARS</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>$100 USD (Blue)</span>
                  <span className="font-medium">
                    ≈ ${((exchangeRates.find((r) => r.type === "Blue")?.rate || 1050) * 100).toLocaleString()} ARS
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>€100 EUR</span>
                  <span className="font-medium">
                    ≈ ${((exchangeRates.find((r) => r.currency === "EUR")?.rate || 1150) * 100).toLocaleString()} ARS
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>R$100 BRL</span>
                  <span className="font-medium">
                    ≈ ${((exchangeRates.find((r) => r.currency === "BRL")?.rate || 210) * 100).toLocaleString()} ARS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
