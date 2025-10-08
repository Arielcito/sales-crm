"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRecentDeals } from "@/hooks/use-recent-activity"
import { DollarSign, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

export function RecentDealsList() {
  const { data: deals, isLoading, error } = useRecentDeals(5)
  const router = useRouter()

  const handleDealClick = (dealId: string) => {
    router.push(`/kanban?dealId=${dealId}`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Negocios Recientes</CardTitle>
          <CardDescription>Tus últimos negocios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Negocios Recientes</CardTitle>
          <CardDescription>Tus últimos negocios</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error al cargar negocios</p>
        </CardContent>
      </Card>
    )
  }

  if (!deals || deals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Negocios Recientes</CardTitle>
          <CardDescription>Tus últimos negocios</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay negocios todavía</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Negocios Recientes</CardTitle>
        <CardDescription>Tus últimos negocios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.map((deal) => {
            const amount = deal.currency === "USD"
              ? deal.amountUsd
              : deal.amountArs
            const currencySymbol = deal.currency === "USD" ? "$" : "$"

            return (
              <div
                key={deal.id}
                onClick={() => handleDealClick(deal.id)}
                className="flex items-start space-x-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{deal.title}</p>
                  {amount && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <DollarSign className="h-3 w-3" />
                      {currencySymbol}{amount.toLocaleString()} {deal.currency}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
