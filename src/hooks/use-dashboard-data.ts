"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

export interface DashboardStats {
  totalContacts: number
  totalDeals: number
  totalRevenueUsd: number
  totalRevenueArs: number
  dealsByStage: Record<string, number>
  revenueByStage: Record<string, number>
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      return await apiClient<DashboardStats>("/api/dashboard/stats")
    },
    staleTime: 1000 * 60 * 2,
  })
}
