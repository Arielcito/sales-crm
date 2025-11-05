"use client"

import { UsersView } from "@/components/users-view"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function TeamsPage() {
  const { data: currentUser, isLoading, error } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando equipo...</p>
        </div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <p className="text-destructive">Error al cargar el equipo</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.message || "Usuario no encontrado"}
          </p>
        </div>
      </div>
    )
  }

  if (currentUser.level > 3) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <p className="text-destructive">No tienes permisos para acceder a esta página</p>
          <p className="text-sm text-muted-foreground mt-2">
            Esta sección está disponible solo para niveles 1, 2 y 3
          </p>
        </div>
      </div>
    )
  }

  const pageTitle = currentUser.level === 1 ? "Gestión de Equipos" : "Mi Equipo"
  const pageDescription = currentUser.level === 1
    ? "Administra los equipos y sus miembros"
    : `Gestiona tu equipo y subordinados (nivel ${currentUser.level})`

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <UsersView
          currentUser={currentUser}
          pageTitle={pageTitle}
          pageDescription={pageDescription}
        />
      </div>
    </div>
  )
}
