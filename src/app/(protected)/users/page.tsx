"use client"

import { UsersView } from "@/components/users-view"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function UsersPage() {
  const { data: currentUser, isLoading, error } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">Error al cargar los usuarios</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.message || "Usuario no encontrado"}
          </p>
        </div>
      </div>
    )
  }

  return <UsersView currentUser={currentUser} />
}
