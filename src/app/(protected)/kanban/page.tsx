"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Pipeline de Ventas</h2>
        <p className="text-muted-foreground">
          Gestiona tus oportunidades de venta en formato Kanban
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista Kanban</CardTitle>
          <CardDescription>Próximamente disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página mostrará un tablero Kanban con las etapas del pipeline de ventas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
