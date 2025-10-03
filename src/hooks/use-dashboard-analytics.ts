"use client"

import { useQuery } from "@tanstack/react-query"
import { convertAmount } from "@/lib/services/deal.service"
import { apiClient } from "@/lib/api/client"
import type { Currency, Deal } from "@/lib/types"

interface DashboardAnalyticsParams {
  userId?: string
  currency: Currency
}


interface DashboardAnalyticsResult {
  totalValue: number
  closedValue: number
  dealsByStage: Record<string, number>
  valueByStage: Record<string, number>
  dealCount: number
}

export function useDashboardAnalytics({ userId, currency }: DashboardAnalyticsParams) {
  return useQuery({
    queryKey: ["dashboard-analytics", userId, currency],
    queryFn: async (): Promise<DashboardAnalyticsResult> => {
      const deals = await apiClient<Deal[]>(`/api/dashboard?userId=${userId || ""}`)

      let totalValue = 0
      let closedValue = 0
      const dealsByStage: Record<string, number> = {}
      const valueByStage: Record<string, number> = {}

      for (const deal of deals) {
        const convertedAmount = await convertAmount(deal.amountUsd || 0, deal.currency, currency)

        if (deal.stageId === "facturacion-final") {
          closedValue += convertedAmount
        }

        totalValue += convertedAmount

        dealsByStage[deal.stageId] = (dealsByStage[deal.stageId] || 0) + 1
        valueByStage[deal.stageId] = (valueByStage[deal.stageId] || 0) + convertedAmount
      }

      return {
        totalValue,
        closedValue,
        dealsByStage,
        valueByStage,
        dealCount: deals.length
      }
    },
    enabled: !!userId,
  })
}
