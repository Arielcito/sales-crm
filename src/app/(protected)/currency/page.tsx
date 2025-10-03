"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CurrencyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Cotizaciones</h2>
        <p className="text-muted-foreground">
          Visualiza las cotizaciones de monedas actualizadas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>USD</CardTitle>
            <CardDescription>Dólar estadounidense</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Cargando cotización...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EUR</CardTitle>
            <CardDescription>Euro</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Cargando cotización...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BTC</CardTitle>
            <CardDescription>Bitcoin</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Cargando cotización...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
