"use client"

import { CompaniesView } from "@/components/companies-view"
import { CompaniesSkeleton } from "@/components/companies-skeleton"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function CompaniesPage() {
  const { data: currentUser, isLoading, error } = useCurrentUser()

  if (isLoading) {
    return <CompaniesSkeleton />
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">Error al cargar las empresas</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.message || "Usuario no encontrado"}
          </p>
        </div>
      </div>
    )
  }

  return <CompaniesView currentUser={currentUser} />
}
