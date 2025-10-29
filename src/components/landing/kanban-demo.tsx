"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockStages, mockDeals, mockCompanies, mockContacts, mockUsers } from "@/lib/mock-data"
import type { Deal } from "@/lib/types"

export function KanbanDemo() {
  const [deals, setDeals] = useState(mockDeals)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e: React.DragEvent, newStageId: string) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggedDeal || draggedDeal.stageId === newStageId) {
      setDraggedDeal(null)
      return
    }

    setDeals(prev =>
      prev.map(deal =>
        deal.id === draggedDeal.id
          ? { ...deal, stageId: newStageId }
          : deal
      )
    )

    setDraggedDeal(null)
  }

  const getCompanyName = (companyId?: string | null) => {
    if (!companyId) return "Sin empresa"
    return mockCompanies.find(c => c.id === companyId)?.name || "Empresa Desconocida"
  }

  const getContactName = (contactId?: string | null) => {
    if (!contactId) return "Sin contacto"
    return mockContacts.find(c => c.id === contactId)?.name || "Contacto Desconocido"
  }

  const getUser = (userId: string) => {
    return mockUsers.find(user => user.id === userId)
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max px-4">
        {mockStages.map(stage => {
          const stageDeals = deals.filter(deal => deal.stageId === stage.id)
          const stageTotal = stageDeals.reduce((sum, deal) => {
            const amount = deal.currency === "USD"
              ? (deal.amountUsd || 0)
              : (deal.amountArs || 0)
            return sum + amount
          }, 0)

          const isDropTarget = dragOverStage === stage.id

          return (
            <div
              key={stage.id}
              className={`flex flex-col w-80 flex-shrink-0 bg-muted/30 rounded-xl border transition-all duration-300 ${
                isDropTarget ? "ring-2 ring-primary ring-offset-2 bg-primary/5 scale-105" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="p-4 border-b border-border/50 bg-card rounded-t-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-0">
                    {stageDeals.length}
                  </Badge>
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(stageTotal)}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-96">
                {stageDeals.map(deal => {
                  const responsibleUser = getUser(deal.userId)
                  const amount = deal.currency === "USD"
                    ? (deal.amountUsd || 0)
                    : (deal.amountArs || 0)
                  const isBeingDragged = draggedDeal?.id === deal.id

                  return (
                    <Card
                      key={deal.id}
                      className={`cursor-move border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card ${
                        isBeingDragged ? "opacity-40 scale-95" : ""
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
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
                            <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                              {deal.currency}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="font-medium text-foreground">{getCompanyName(deal.companyId)}</div>
                            <div>{getContactName(deal.contactId)}</div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="text-xs font-medium text-muted-foreground">
                              {responsibleUser?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(deal.createdAt).toLocaleDateString("es-AR")}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
