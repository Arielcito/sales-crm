"use client"

import { Dashboard } from "@/components/dashboard"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function DashboardPage() {
  const { data: currentUser, isLoading, error } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de control...</p>
        </div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <p className="text-destructive">Error al cargar el panel de control</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.message || "Usuario no encontrado"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <Dashboard currentUser={currentUser} />
      </div>
    </div>
  )
}
