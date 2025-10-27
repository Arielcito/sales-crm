"use client"

import { CurrencySettings } from "@/components/currency-settings"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function CurrencyPage() {
  const { data: currentUser, isLoading, error } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <p className="text-destructive">Error al cargar las cotizaciones</p>
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
        <CurrencySettings currentUser={currentUser} />
      </div>
    </div>
  )
}
