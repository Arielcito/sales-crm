"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Deal, User, Currency } from "@/lib/types"
import { DealModal } from "./deal-modal"
import { CurrencyToggle } from "./currency-toggle"
import { NewDealModal } from "./new-deal-modal"
import { useDeals, useUpdateDeal } from "@/hooks/use-deals"

interface KanbanBoardProps {
  currentUser: User
  stages: Array<{ id: string; name: string; order: number; color: string }>
  companies: Array<{ id: string; name: string }>
  contacts: Array<{ id: string; name: string }>
  users: Array<{ id: string; name: string }>
}

export function KanbanBoard({ currentUser, stages, companies, contacts, users }: KanbanBoardProps) {
  const { data: deals = [], isLoading } = useDeals()
  const { mutate: updateDeal } = useUpdateDeal()

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, newStageId: string) => {
    e.preventDefault()
    if (!draggedDeal || draggedDeal.stageId === newStageId) return

    updateDeal({
      id: draggedDeal.id,
      data: { stageId: newStageId }
    })

    setDraggedDeal(null)
  }

  const getUser = (userId: string) => {
    return users.find((user) => user.id === userId)
  }

  const getCompanyName = (companyId?: string | null) => {
    if (!companyId) return "Sin empresa"
    return companies.find(c => c.id === companyId)?.name || "Empresa Desconocida"
  }

  const getContactName = (contactId?: string | null) => {
    if (!contactId) return "Sin contacto"
    return contacts.find(c => c.id === contactId)?.name || "Contacto Desconocido"
  }

  const orderedStages = [...stages].sort((a, b) => a.order - b.order)

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando negocios...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border/50 p-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Pipeline de Ventas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Mostrando {deals.length} negocios • Permisos Nivel {currentUser.level}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowNewDealModal(true)} className="bg-accent hover:bg-accent/90 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Negociación
            </Button>
            <CurrencyToggle currency={currency} onCurrencyChange={setCurrency} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-6 h-full min-w-max">
            {orderedStages.map((stage) => {
              const stageDeals = deals.filter((deal) => deal.stageId === stage.id)
              const stageTotal = stageDeals.reduce((sum, deal) => {
                const amount = deal.currency === "USD"
                  ? (deal.amountUsd || 0)
                  : (deal.amountArs || 0)
                return sum + amount
              }, 0)

              return (
                <div
                  key={stage.id}
                  className="nexus-card flex flex-col w-80 flex-shrink-0 bg-muted/30"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-4 border-b border-border/50 flex-shrink-0 bg-card">
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
                        currency: currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stageTotal)}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-3">
                      {stageDeals.map((deal) => {
                        const responsibleUser = getUser(deal.userId)
                        const isOverdue = deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date()
                        const amount = deal.currency === "USD"
                          ? (deal.amountUsd || 0)
                          : (deal.amountArs || 0)

                        return (
                          <Card
                            key={deal.id}
                            className="cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, deal)}
                            onClick={() => setSelectedDeal(deal)}
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
                                  {deal.currency !== currency && (
                                    <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                                      {deal.currency}
                                    </Badge>
                                  )}
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div className="font-medium text-foreground">{getCompanyName(deal.companyId)}</div>
                                  <div>{getContactName(deal.contactId)}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {responsibleUser?.name}
                                  </div>
                                  {deal.expectedCloseDate && (
                                    <div
                                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                                        isOverdue ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {new Date(deal.expectedCloseDate).toLocaleDateString("es-AR")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          currentUser={currentUser}
          currency={currency}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {}}
        />
      )}

      {showNewDealModal && (
        <NewDealModal
          currentUser={currentUser}
          onClose={() => setShowNewDealModal(false)}
          onSuccess={() => setShowNewDealModal(false)}
        />
      )}
    </div>
  )
}
