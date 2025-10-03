"use client"

import { StatCard } from "@/components/stat-card"
import { RecentContactsList } from "@/components/recent-contacts-list"
import { RecentDealsList } from "@/components/recent-deals-list"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Users, TrendingUp, DollarSign } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard-data"
import type { User } from "@/lib/types"

interface DashboardProps {
  currentUser: User
}

export function Dashboard({ currentUser }: DashboardProps) {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
          <p className="text-muted-foreground">
            Vista general de tus actividades de ventas
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive">Error al cargar las estadísticas</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const totalRevenue = stats?.totalRevenueUsd || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
        <p className="text-muted-foreground">
          Vista general de tus actividades de ventas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Contactos"
          description="Contactos activos en tu CRM"
          value={stats?.totalContacts || 0}
          icon={Users}
        />

        <StatCard
          title="Negocios Abiertos"
          description="Negocios en progreso"
          value={stats?.totalDeals || 0}
          icon={TrendingUp}
        />

        <StatCard
          title="Ingresos Totales"
          description="Valor total de negocios"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentContactsList />
        <RecentDealsList />
      </div>
    </div>
  )
}
