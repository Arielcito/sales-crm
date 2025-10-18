"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users as UsersIcon } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function TeamsPage() {
  const { data: currentUser, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Equipos</h1>
            <p className="text-muted-foreground mt-1">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.level > 2) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">No tienes permisos para acceder a esta página</p>
          <p className="text-sm text-muted-foreground mt-2">
            Solo niveles 1 y 2 pueden gestionar equipos
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Equipos</h1>
          <p className="text-muted-foreground mt-1">
            Administra los equipos y asigna usuarios
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Equipo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Equipos
          </CardTitle>
          <CardDescription>
            Funcionalidad de gestión de equipos en desarrollo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Próximamente</p>
            <p className="text-sm mt-2">
              La gestión completa de equipos estará disponible pronto
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
