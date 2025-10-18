"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { TeamStats, Currency } from "@/lib/types"

interface TeamPieChartsProps {
  openNegotiations: TeamStats[]
  ongoingProjects: TeamStats[]
  currency: Currency
  isLoading?: boolean
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
  "#f97316",
]

export function TeamPieCharts({ openNegotiations, ongoingProjects, currency, isLoading }: TeamPieChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Negociaciones Abiertas por Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proyectos en Curso por Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const currencySymbol = currency === "USD" ? "USD" : "ARS"

  const openNegData = openNegotiations
    .filter(stat => stat.count > 0)
    .map((stat) => ({
      name: stat.teamName,
      value: stat.totalAmount,
      count: stat.count,
    }))

  const ongoingData = ongoingProjects
    .filter(stat => stat.count > 0)
    .map((stat) => ({
      name: stat.teamName,
      value: stat.totalAmount,
      count: stat.count,
    }))

  const CustomTooltip = ({ active, payload }: {active?: boolean, payload?: Array<{name: string, value: number, payload: {count: number}}>}) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Cantidad: {payload[0].payload.count}
          </p>
          <p className="text-sm">
            Monto: {currencySymbol} {payload[0].value.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Negociaciones Abiertas por Equipo</CardTitle>
          <CardDescription>Distribución de negociaciones abiertas</CardDescription>
        </CardHeader>
        <CardContent>
          {openNegData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={openNegData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => `${props.name} ${(Number(props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {openNegData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos en Curso por Equipo</CardTitle>
          <CardDescription>Distribución de proyectos en curso</CardDescription>
        </CardHeader>
        <CardContent>
          {ongoingData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ongoingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => `${props.name} ${(Number(props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ongoingData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
