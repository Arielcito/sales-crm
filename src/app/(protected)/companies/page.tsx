"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Empresas y Contactos</h2>
        <p className="text-muted-foreground">
          Gestiona tus empresas y contactos comerciales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Lista de empresas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay empresas registradas todavía</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactos</CardTitle>
            <CardDescription>Lista de contactos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay contactos registrados todavía</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
