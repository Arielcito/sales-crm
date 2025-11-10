"use client"

import { useState, useEffect, useCallback } from "react"
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

interface DolarApiResponse {
  moneda: string
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

export function CurrencySettings({ currentUser }: CurrencySettingsProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [previousRates, setPreviousRates] = useState<Map<string, number>>(new Map())

  const calculateChange = (current: number, previous: number | undefined): number => {
    if (!previous || previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const loadExchangeRates = useCallback(async () => {
    setIsUpdating(true)

    try {
      const [blueRes, oficialRes, criptoRes] = await Promise.all([
        fetch("https://dolarapi.com/v1/dolares/blue"),
        fetch("https://dolarapi.com/v1/dolares/oficial"),
        fetch("https://dolarapi.com/v1/dolares/cripto"),
      ])

      const blue: DolarApiResponse = await blueRes.json()
      const oficial: DolarApiResponse = await oficialRes.json()
      const cripto: DolarApiResponse = await criptoRes.json()

      setPreviousRates(prevRates => {
        const newRates: ExchangeRate[] = [
          {
            currency: "USD",
            name: "Dólar Blue",
            type: "Blue",
            rate: blue.venta,
            change: calculateChange(blue.venta, prevRates.get("blue")),
            lastUpdate: new Date(blue.fechaActualizacion),
          },
          {
            currency: "USD",
            name: "Dólar Oficial",
            type: "Oficial",
            rate: oficial.venta,
            change: calculateChange(oficial.venta, prevRates.get("oficial")),
            lastUpdate: new Date(oficial.fechaActualizacion),
          },
          {
            currency: "USD",
            name: "Dólar Cripto",
            type: "Cripto",
            rate: cripto.venta,
            change: calculateChange(cripto.venta, prevRates.get("cripto")),
            lastUpdate: new Date(cripto.fechaActualizacion),
          },
        ]

        setExchangeRates(newRates)
        setLastUpdate(new Date())

        return new Map([
          ["blue", blue.venta],
          ["oficial", oficial.venta],
          ["cripto", cripto.venta],
        ])
      })
    } catch (error) {
      console.error("[CurrencySettings] Error fetching exchange rates:", error)
    } finally {
      setIsUpdating(false)
    }
  }, [])

  useEffect(() => {
    loadExchangeRates()
  }, [loadExchangeRates])

  const handleRefresh = async () => {
    await loadExchangeRates()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cotizaciones</h2>
          <p className="text-muted-foreground">Cotización del dólar en Argentina (Blue, Oficial, Cripto)</p>
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
          {exchangeRates.map((rate, index) => (
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
                {exchangeRates.map((rate, index) => (
                  <div key={index} className="flex justify-between p-2 bg-muted rounded">
                    <span>ARS 100,000</span>
                    <span className="font-medium">
                      ≈ ${(100000 / rate.rate).toFixed(2)} USD ({rate.type})
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Hacia ARS</h4>
              <div className="space-y-2 text-sm">
                {exchangeRates.map((rate, index) => (
                  <div key={index} className="flex justify-between p-2 bg-muted rounded">
                    <span>$100 USD ({rate.type})</span>
                    <span className="font-medium">
                      ≈ ${(rate.rate * 100).toLocaleString("es-AR")} ARS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
