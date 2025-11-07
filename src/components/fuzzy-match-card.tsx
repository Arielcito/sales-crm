"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertCircle, Building2, User } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api/client"

interface FuzzyMatchRequest {
  id: string
  requestedBy: string
  companyName: string
  email?: string
  phone?: string
  status: string
  requestType: string
  entityType: string
  potentialDuplicateId?: string
  submittedData?: Record<string, unknown>
  potentialDuplicate?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  createdAt: Date
}

export function FuzzyMatchCard() {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: fuzzyMatches, isLoading } = useQuery({
    queryKey: ["fuzzy-matches"],
    queryFn: async () => {
      const response = await apiClient<FuzzyMatchRequest[]>("/api/fuzzy-matches")
      return response
    },
    refetchInterval: 30000,
  })

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient("/api/fuzzy-matches", {
        method: "POST",
        body: JSON.stringify({ requestId, action: "approve" }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuzzy-matches"] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast.success("Solicitud aprobada. Entidad existente vinculada.")
    },
    onError: () => {
      toast.error("Error al aprobar la solicitud")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient("/api/fuzzy-matches", {
        method: "POST",
        body: JSON.stringify({ requestId, action: "reject" }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuzzy-matches"] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast.success("Solicitud rechazada. Nueva entidad creada.")
    },
    onError: () => {
      toast.error("Error al rechazar la solicitud")
    },
  })

  const pendingCount = fuzzyMatches?.length || 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Solicitudes Pendientes
          </CardTitle>
          <CardDescription>Revisiones de duplicados potenciales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    )
  }

  if (pendingCount === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Solicitudes Pendientes
          <Badge variant="destructive" className="ml-auto">
            {pendingCount}
          </Badge>
        </CardTitle>
        <CardDescription>Revisiones de duplicados potenciales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fuzzyMatches?.map((request) => (
          <div
            key={request.id}
            className="border rounded-lg p-4 space-y-3 bg-muted/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {request.entityType === "company" ? (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{request.companyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.entityType === "company" ? "Empresa" : "Contacto"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExpandedId(expandedId === request.id ? null : request.id)
                }
              >
                {expandedId === request.id ? "Ocultar" : "Ver detalles"}
              </Button>
            </div>

            {expandedId === request.id && (
              <div className="space-y-3 pt-3 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      DATOS ENVIADOS
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Nombre:</span>{" "}
                        {request.companyName}
                      </p>
                      {request.email && (
                        <p className="text-sm">
                          <span className="font-medium">Email:</span>{" "}
                          {request.email}
                        </p>
                      )}
                      {request.phone && (
                        <p className="text-sm">
                          <span className="font-medium">Teléfono:</span>{" "}
                          {request.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      DUPLICADO POTENCIAL
                    </p>
                    {request.potentialDuplicate ? (
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Nombre:</span>{" "}
                          {request.potentialDuplicate.name}
                        </p>
                        {request.potentialDuplicate.email && (
                          <p className="text-sm">
                            <span className="font-medium">Email:</span>{" "}
                            {request.potentialDuplicate.email}
                          </p>
                        )}
                        {request.potentialDuplicate.phone && (
                          <p className="text-sm">
                            <span className="font-medium">Teléfono:</span>{" "}
                            {request.potentialDuplicate.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No disponible
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Vincular Existente
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Crear Nuevo
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
