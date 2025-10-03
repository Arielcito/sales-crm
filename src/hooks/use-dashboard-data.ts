import { useState, useEffect } from "react"
import type { User } from "@/lib/types"

export interface KPIData {
  totalDeals: number
  totalValue: number
  wonDeals: number
  wonValue: number
  conversionRate: number
  avgDealSize: number
  dealsByStage: Record<string, number>
  valueByStage: Record<string, number>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user: string
  }>
}

export type Currency = "USD" | "ARS"

export function useDashboardData(currentUser: User, currency: Currency) {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)

      const recentActivity = [
        {
          id: "1",
          type: "deal_moved",
          description: "Sistema ERP Completo movido a Cotización generada",
          timestamp: "2024-01-22T10:30:00Z",
          user: "Luis Rodríguez",
        },
        {
          id: "2",
          type: "deal_created",
          description: "Nuevo negocio: App Mobile Fintech creado",
          timestamp: "2024-01-22T09:15:00Z",
          user: "Pedro Martín",
        },
        {
          id: "3",
          type: "deal_won",
          description: "Plataforma E-commerce cerrado exitosamente",
          timestamp: "2024-01-21T16:45:00Z",
          user: "María López",
        },
        {
          id: "4",
          type: "deal_updated",
          description: "Consultoría Digital monto actualizado",
          timestamp: "2024-01-21T14:20:00Z",
          user: "Ana García",
        },
      ]

      setKpiData({
        totalDeals: 0,
        totalValue: 0,
        wonDeals: 0,
        wonValue: 0,
        conversionRate: 0,
        avgDealSize: 0,
        dealsByStage: {},
        valueByStage: {},
        recentActivity,
      })

      setIsLoading(false)
    }

    fetchDashboardData()
  }, [currentUser, currency])

  return { kpiData, isLoading }
}
