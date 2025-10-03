"use client"

import { useQuery } from "@tanstack/react-query"
import type { DealStage } from "@/lib/types"
import { apiClient } from "@/lib/api/client"

export function useDealStages() {
  return useQuery({
    queryKey: ["deal-stages"],
    queryFn: async () => {
      return await apiClient<DealStage[]>("/api/deal-stages")
    },
    staleTime: 1000 * 60 * 5,
  })
}
