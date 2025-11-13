"use client"

import { RequestCard } from "./request-card"
import { Spinner } from "@/components/ui/spinner"
import { Inbox } from "lucide-react"
import type { CompanyRequest } from "@/lib/types"

interface RequestsListProps {
  requests: CompanyRequest[]
  isLoading: boolean
  emptyMessage?: string
}

export function RequestsList({ requests, isLoading, emptyMessage = "No hay solicitudes" }: RequestsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="text-muted-foreground mt-4">Cargando solicitudes...</p>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Sin solicitudes</h3>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}
