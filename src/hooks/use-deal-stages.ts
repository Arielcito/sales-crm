"use client"

import { useQuery } from "@tanstack/react-query"
import type { DealStage } from "@/lib/types"

export function useDealStages() {
  return useQuery({
    queryKey: ["deal-stages"],
    queryFn: async () => {
      const response = await fetch("/api/deal-stages")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener etapas")
      return json.data as DealStage[]
    },
    staleTime: 1000 * 60 * 5,
  })
}
