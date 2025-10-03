"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDeals, convertAmount } from "@/lib/services/deal.service"
import type { User, Currency, Deal } from "@/lib/types"

interface DashboardAnalyticsParams {
  userId?: string
  currency: Currency
}

interface DealAnalytics {
  original_amount: number
  currency: Currency
  stage: string
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
      const response = await fetch(`/api/dashboard?userId=${userId || ""}`)
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener datos del dashboard")

      const deals = json.data.deals || []

      let totalValue = 0
      let closedValue = 0
      const dealsByStage: Record<string, number> = {}
      const valueByStage: Record<string, number> = {}

      for (const deal of deals) {
        const convertedAmount = await convertAmount(deal.amountUsd || 0, deal.currency, currency)

        if (deal.stage === "facturacion-final") {
          closedValue += convertedAmount
        }

        totalValue += convertedAmount

        dealsByStage[deal.stage] = (dealsByStage[deal.stage] || 0) + 1
        valueByStage[deal.stage] = (valueByStage[deal.stage] || 0) + convertedAmount
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
