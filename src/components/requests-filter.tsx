"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface RequestsFilterProps {
  selectedStatus: string
  onStatusChange: (status: string) => void
  counts?: {
    all: number
    pending: number
    approved: number
    rejected: number
  }
}

export function RequestsFilter({ selectedStatus, onStatusChange, counts }: RequestsFilterProps) {
  return (
    <Tabs value={selectedStatus} onValueChange={onStatusChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all" className="flex items-center gap-2">
          Todas
          {counts && <Badge variant="secondary" className="ml-1">{counts.all}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          Pendientes
          {counts && counts.pending > 0 && (
            <Badge variant="default" className="ml-1 bg-yellow-100 text-yellow-800">
              {counts.pending}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex items-center gap-2">
          Aprobadas
          {counts && counts.approved > 0 && (
            <Badge variant="secondary" className="ml-1">{counts.approved}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex items-center gap-2">
          Rechazadas
          {counts && counts.rejected > 0 && (
            <Badge variant="secondary" className="ml-1">{counts.rejected}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
