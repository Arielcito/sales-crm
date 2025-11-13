"use client"

import { StatCard } from "@/components/stat-card"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { DashboardFilters } from "@/components/dashboard-filters"
import { PipelineTable } from "@/components/pipeline-table"
import { TeamPieCharts } from "@/components/team-pie-charts"
import { TrendingUp, Briefcase, CheckCircle2, XCircle } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard-data"
import { useDashboardFilters } from "@/hooks/use-dashboard-filters"
import { useTeamLeaders } from "@/hooks/use-teams"
import type { User } from "@/lib/types"

interface DashboardProps {
  currentUser: User
}

export function Dashboard({ currentUser }: DashboardProps) {
  const { dateRange, setDateRange, currency, setCurrency, selectedTeamLeaderId, setSelectedTeamLeaderId } = useDashboardFilters()
  const { data: stats, isLoading, error } = useDashboardStats({ dateRange, currency, teamLeaderId: selectedTeamLeaderId })
  const { data: teamLeaders } = useTeamLeaders()

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

  const currencySymbol = currency === "USD" ? "USD" : "ARS"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
        <p className="text-muted-foreground">
          Vista general de tus actividades de ventas
        </p>
      </div>

      <DashboardFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        currency={currency}
        onCurrencyChange={setCurrency}
        selectedTeamLeaderId={selectedTeamLeaderId}
        onTeamLeaderChange={setSelectedTeamLeaderId}
        teamLeaders={teamLeaders}
        showTeamFilter={currentUser.level === 1}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Negociaciones Abiertas"
          description="En oportunidad, cotización, aprobación y OC"
          value={`${stats?.openNegotiations.count || 0} (${currencySymbol} ${(stats?.openNegotiations.amount || 0).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })})`}
          icon={TrendingUp}
        />

        <StatCard
          title="Proyectos en Curso"
          description="Anticipo pagado, en curso y facturación final"
          value={`${stats?.ongoingProjects.count || 0} (${currencySymbol} ${(stats?.ongoingProjects.amount || 0).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })})`}
          icon={Briefcase}
        />

        <StatCard
          title="Proyectos Terminados"
          description="Proyectos finalizados exitosamente"
          value={`${stats?.finishedProjects.count || 0} (${currencySymbol} ${(stats?.finishedProjects.amount || 0).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })})`}
          icon={CheckCircle2}
        />

        <StatCard
          title="Proyectos Perdidos"
          description="Oportunidades que no se concretaron"
          value={`${stats?.lostProjects.count || 0} (${currencySymbol} ${(stats?.lostProjects.amount || 0).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })})`}
          icon={XCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineTable
          stageStats={stats?.stageStats || []}
          currency={currency}
          isLoading={isLoading}
        />

        <div className="lg:col-span-1">
          <TeamPieCharts
            openNegotiations={stats?.teamStats.openNegotiations || []}
            ongoingProjects={stats?.teamStats.ongoingProjects || []}
            currency={currency}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
