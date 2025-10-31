"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import type { Deal } from "@/lib/types"

interface KanbanDealCardProps {
  deal: Deal
  currency: string
  isBeingDragged: boolean
  isOptimistic: boolean
  isDealUpdating: boolean
  responsibleUserName?: string
  companyName: string
  contactName: string
  onDragStart: (e: React.DragEvent, deal: Deal) => void
  onClick: () => void
}

export function KanbanDealCard({
  deal,
  currency,
  isBeingDragged,
  isOptimistic,
  isDealUpdating,
  responsibleUserName,
  companyName,
  contactName,
  onDragStart,
  onClick,
}: KanbanDealCardProps) {
  const isOverdue = deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date()
  const amount = deal.currency === "USD"
    ? (deal.amountUsd || 0)
    : (deal.amountArs || 0)

  return (
    <Card
      className={`cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card ${
        isBeingDragged ? "opacity-40 scale-95" : ""
      } ${
        isOptimistic ? "ring-2 ring-primary/50 animate-pulse" : ""
      }`}
      draggable={!isDealUpdating}
      onDragStart={(e) => onDragStart(e, deal)}
      onClick={onClick}
    >
      <CardContent className="p-4 relative">
        {isDealUpdating && (
          <div className="absolute top-2 right-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        <div className="space-y-3">
          {responsibleUserName && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
              {responsibleUserName}
            </Badge>
          )}
          <h4 className="font-semibold text-sm leading-tight line-clamp-2">
            {deal.title}
          </h4>

          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: deal.currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(amount)}
            </span>
            {deal.currency !== currency && (
              <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                {deal.currency}
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">{companyName}</div>
            <div>{contactName}</div>
          </div>

          {deal.dollarRate && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Cotización USD
              </div>
              <div className="text-xs font-semibold text-primary">
                ${new Intl.NumberFormat("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(deal.dollarRate)}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground">Fecha creación</div>
            <div className="text-xs text-muted-foreground">
              {new Date(deal.createdAt).toLocaleDateString("es-AR")}
            </div>
          </div>

          {deal.expectedCloseDate && (
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-muted-foreground">
                Fecha límite
              </div>
              <div
                className={`text-xs font-medium px-2 py-1 rounded-md ${
                  isOverdue ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"
                }`}
              >
                {new Date(deal.expectedCloseDate).toLocaleDateString("es-AR")}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


