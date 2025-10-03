"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Gestión de Usuarios</h2>
        <p className="text-muted-foreground">
          Administra los usuarios del sistema (Solo para nivel 1)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>Lista de usuarios registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidad de gestión de usuarios próximamente disponible
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
