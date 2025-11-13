"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCircle, Check, X, FileText, User } from "lucide-react"
import { RequestStatusBadge } from "./request-status-badge"
import { useApproveContactRequest, useRejectContactRequest } from "@/hooks/use-contact-requests"
import { useContacts } from "@/hooks/use-contacts"
import { useUsers } from "@/hooks/use-users"
import type { ContactAccessRequest } from "@/lib/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ContactAccessRequestCardProps {
  request: ContactAccessRequest
  showActions?: boolean
}

export function ContactAccessRequestCard({ request, showActions = true }: ContactAccessRequestCardProps) {
  const approveMutation = useApproveContactRequest()
  const rejectMutation = useRejectContactRequest()
  const { data: contacts = [] } = useContacts()
  const { data: users = [] } = useUsers()

  const isPending = request.status === "pending"
  const isProcessing = approveMutation.isPending || rejectMutation.isPending

  const contact = contacts.find((c) => c.id === request.contactId)
  const requestedByUser = users.find((u) => u.id === request.requestedBy)

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <UserCircle className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">
                Acceso a contacto: {contact?.name || "Desconocido"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Solicitado por: {requestedByUser?.name || "Usuario desconocido"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <RequestStatusBadge status={request.status as "pending" | "approved" | "rejected"} />
                <Badge variant="outline" className="text-xs">
                  Acceso a Datos
                </Badge>
              </div>
            </div>

            {isPending && showActions && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  onClick={() => approveMutation.mutate(request.id)}
                  disabled={isProcessing}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => rejectMutation.mutate(request.id)}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {request.reason && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{request.reason}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>
              Creada: {format(new Date(request.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
            </span>
            {request.reviewedBy && request.reviewedAt && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Revisada: {format(new Date(request.reviewedAt), "dd MMM yyyy, HH:mm", { locale: es })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
