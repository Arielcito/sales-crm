"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { DashboardStatsExtended, Currency } from "@/lib/types"
import { DateRange } from "react-day-picker"

export interface DashboardStats {
  totalContacts: number
  totalDeals: number
  totalRevenueUsd: number
  totalRevenueArs: number
  dealsByStage: Record<string, number>
  revenueByStage: Record<string, number>
}

interface UseDashboardStatsParams {
  dateRange?: DateRange
  currency: Currency
}

export function useDashboardStats({ dateRange, currency }: UseDashboardStatsParams) {
  return useQuery({
    queryKey: ["dashboard", "stats", dateRange?.from, dateRange?.to, currency],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (dateRange?.from) {
        params.append("from", dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        params.append("to", dateRange.to.toISOString())
      }
      params.append("currency", currency)

      return await apiClient<DashboardStatsExtended>(`/api/dashboard/stats?${params.toString()}`)
    },
    staleTime: 1000 * 60 * 2,
  })
}
