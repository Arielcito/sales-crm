"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Check, X, Clock } from "lucide-react"
import { useCompanyRequests, useApproveCompanyRequest, useRejectCompanyRequest } from "@/hooks/use-company-requests"
import type { User } from "@/lib/types"

interface PendingRequestsCardProps {
  currentUser: User
}

export function PendingRequestsCard({ currentUser }: PendingRequestsCardProps) {
  const { data: requests = [], isLoading } = useCompanyRequests()
  const approveMutation = useApproveCompanyRequest()
  const rejectMutation = useRejectCompanyRequest()

  if (currentUser.level !== 1) {
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Solicitudes Pendientes
          </CardTitle>
          <CardDescription>Cargando solicitudes...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const pendingRequests = requests.filter(r => r.status === "pending" && r.requestType === "manual")

  if (pendingRequests.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Solicitudes Manuales Pendientes
          <Badge variant="secondary">{pendingRequests.length}</Badge>
        </CardTitle>
        <CardDescription>Solicitudes antiguas de empresas (el sistema ahora usa creación automática)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRequests.slice(0, 5).map((request) => (
            <div
              key={request.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{request.companyName}</h4>
                  {request.industry && (
                    <p className="text-xs text-muted-foreground mt-1">{request.industry}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(request.createdAt).toLocaleDateString("es-AR")}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => approveMutation.mutate(request.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => rejectMutation.mutate(request.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {pendingRequests.length > 5 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              +{pendingRequests.length - 5} solicitudes más
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
