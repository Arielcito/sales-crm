"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
        <p className="text-muted-foreground">
          Vista general de tus actividades de ventas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Contactos</CardTitle>
            <CardDescription>Contactos activos en tu CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negocios Abiertos</CardTitle>
            <CardDescription>Negocios en progreso</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos</CardTitle>
            <CardDescription>Ingresos esperados totales</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$0</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contactos Recientes</CardTitle>
            <CardDescription>Tus últimos contactos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay contactos todavía</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negocios Recientes</CardTitle>
            <CardDescription>Tus últimos negocios</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay negocios todavía</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
