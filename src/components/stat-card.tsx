import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  description?: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, description, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
        <div>
          <CardTitle className="text-xs font-medium">{title}</CardTitle>
          {description && <CardDescription className="text-[10px] mt-0.5 leading-tight">{description}</CardDescription>}
        </div>
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="text-base font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"} mt-0.5`}>
            {trend.isPositive ? "+" : ""}{trend.value}% desde el mes pasado
          </p>
        )}
      </CardContent>
    </Card>
  )
}
