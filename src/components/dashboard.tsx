"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Target, BarChart3, Activity, Users, ArrowUpRight } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { DataService } from "@/lib/data"
import type { User, Currency } from "@/lib/types"
import { CurrencyToggle } from "@/components/currency-toggle"

interface DashboardProps {
  currentUser: User
}

interface KPIData {
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

export function Dashboard({ currentUser }: DashboardProps) {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    calculateKPIs()
  }, [currentUser, currency])

  const calculateKPIs = () => {
    setIsLoading(true)

    const allDeals = DataService.getDeals()
    const visibleUsers = AuthService.getUsersByLevel(currentUser)
    const visibleUserIds = visibleUsers.map((user) => user.id)

    // Filter deals based on user permissions
    const deals = allDeals.filter((deal) => visibleUserIds.includes(deal.responsible_user_id))

    // Calculate basic metrics
    const totalDeals = deals.length
    const wonDeals = deals.filter((deal) => deal.stage === "facturacion-final").length
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0

    // Calculate values in selected currency
    const totalValue = deals.reduce((sum, deal) => {
      return sum + DataService.convertAmount(deal.original_amount, deal.currency, currency)
    }, 0)

    const wonValue = deals
      .filter((deal) => deal.stage === "facturacion-final")
      .reduce((sum, deal) => {
        return sum + DataService.convertAmount(deal.original_amount, deal.currency, currency)
      }, 0)

    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0

    // Group by stage
    const dealsByStage: Record<string, number> = {}
    const valueByStage: Record<string, number> = {}

    deals.forEach((deal) => {
      dealsByStage[deal.stage] = (dealsByStage[deal.stage] || 0) + 1
      valueByStage[deal.stage] =
        (valueByStage[deal.stage] || 0) + DataService.convertAmount(deal.original_amount, deal.currency, currency)
    })

    // Mock recent activity
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
      totalDeals,
      totalValue,
      wonDeals,
      wonValue,
      conversionRate,
      avgDealSize,
      dealsByStage,
      valueByStage,
      recentActivity,
    })

    setIsLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      "oportunidad-identificada": "Oportunidades",
      "cotizacion-generada": "Cotizaciones",
      "aprobacion-pendiente": "Aprobaciones",
      "orden-compra-generada": "Órdenes de Compra",
      "anticipo-pagado": "Anticipos",
      "proyectos-en-curso": "En Curso",
      "facturacion-final": "Facturación",
      "proyectos-terminados-perdidos": "Terminados/Perdidos",
    }
    return labels[stage] || stage
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      deal_moved: Activity,
      deal_created: Target,
      deal_won: TrendingUp,
      deal_updated: BarChart3,
      deal_lost: Activity,
    }
    return icons[type] || Activity
  }

  if (isLoading || !kpiData) {
    return (
      <div className="space-y-6 md:space-y-8 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Panel de Control</h2>
            <p className="text-muted-foreground">Cargando métricas de rendimiento...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Panel de Control</h2>
          <p className="text-muted-foreground text-sm mt-1">Resumen de tu rendimiento de ventas</p>
        </div>
        <CurrencyToggle currency={currency} onCurrencyChange={setCurrency} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="nexus-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Negocios</CardTitle>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpiData.totalDeals}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              Negocios activos en pipeline
            </p>
          </CardContent>
        </Card>

        <Card className="nexus-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(kpiData.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Valor del pipeline</p>
          </CardContent>
        </Card>

        <Card className="nexus-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Negocios Ganados</CardTitle>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpiData.wonDeals}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatCurrency(kpiData.wonValue)} ganados</div>
          </CardContent>
        </Card>

        <Card className="nexus-card border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Conversión</CardTitle>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpiData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Negocios ganados vs total</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline by Stage */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="nexus-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Pipeline por Etapa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(kpiData.dealsByStage).map(([stage, count]) => {
              const value = kpiData.valueByStage[stage] || 0
              const percentage = kpiData.totalDeals > 0 ? (count / kpiData.totalDeals) * 100 : 0

              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{getStageLabel(stage)}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">{count} negocios</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(value)}</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="nexus-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData.recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{activity.user}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="nexus-card border-0 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Tamaño Promedio de Negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(kpiData.avgDealSize)}</div>
            <p className="text-sm text-muted-foreground mt-2">Promedio por negocio</p>
          </CardContent>
        </Card>

        <Card className="nexus-card border-0 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Tasa de Éxito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpiData.conversionRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              {kpiData.wonDeals} de {kpiData.totalDeals} negocios ganados
            </p>
          </CardContent>
        </Card>

        <Card className="nexus-card border-0 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Rendimiento del Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{AuthService.getUsersByLevel(currentUser).length}</div>
            <p className="text-sm text-muted-foreground mt-2">Miembros del equipo visibles</p>
          </CardContent>
        </Card>
      </div>

      {/* User View Card */}
      <Card className="nexus-card border-0 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Tu Vista del Panel de Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-0 font-medium">
              Nivel {currentUser.level}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentUser.level === 1 &&
                "Puedes ver todos los negocios y el rendimiento del equipo en toda la organización."}
              {currentUser.level === 2 && "Puedes ver negocios de tu equipo y reportes directos."}
              {currentUser.level === 3 && "Puedes ver negocios de tus reportes directos."}
              {currentUser.level === 4 && "Puedes ver solo tus propios negocios y rendimiento."}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
