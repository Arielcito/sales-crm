"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle } from "lucide-react"

type RequestStatus = "pending" | "approved" | "rejected"

interface RequestStatusBadgeProps {
  status: RequestStatus
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pendiente",
      variant: "default" as const,
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock,
    },
    approved: {
      label: "Aprobada",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Rechazada",
      variant: "default" as const,
      className: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  )
}
