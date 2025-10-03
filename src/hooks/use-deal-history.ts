"use client"

import { useQuery } from "@tanstack/react-query"
import { getDealHistory } from "@/lib/api/deal-history"

export function useDealHistory(dealId: string) {
  return useQuery({
    queryKey: ["deal-history", dealId],
    queryFn: () => getDealHistory(dealId),
    enabled: !!dealId,
    staleTime: 1000 * 60,
  })
}
