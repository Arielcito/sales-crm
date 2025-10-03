"use client"

import { useQuery } from "@tanstack/react-query"

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
      const response = await fetch("/api/dashboard/stats")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener estadísticas")
      return json.data as DashboardStats
    },
    staleTime: 1000 * 60 * 2,
  })
}
