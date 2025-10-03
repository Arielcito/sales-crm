"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { DataService } from "@/lib/data"
import type { Deal, User, Currency, DealStage } from "@/lib/types"
import { DealModal } from "./deal-modal"
import { CurrencyToggle } from "./currency-toggle"
import { NewDealModal } from "./new-deal-modal"

const STAGE_LABELS: Record<DealStage, string> = {
  "oportunidad-identificada": "Oportunidad identificada",
  "cotizacion-generada": "Cotización generada y enviada",
  "aprobacion-pendiente": "Aprobación pendiente",
  "orden-compra-generada": "Orden de compra generada",
  "anticipo-pagado": "Anticipo pagado",
  "proyectos-en-curso": "Proyectos en curso",
  "facturacion-final": "Facturación final",
  "proyectos-terminados-perdidos": "Proyectos terminados o perdidos",
}

const STAGE_COLORS: Record<DealStage, string> = {
  "oportunidad-identificada": "bg-slate-100",
  "cotizacion-generada": "bg-blue-100",
  "aprobacion-pendiente": "bg-blue-100",
  "orden-compra-generada": "bg-amber-100",
  "anticipo-pagado": "bg-amber-100",
  "proyectos-en-curso": "bg-emerald-100",
  "facturacion-final": "bg-green-500",
  "proyectos-terminados-perdidos": "bg-red-100",
}

interface KanbanBoardProps {
  currentUser: User
}

export function KanbanBoard({ currentUser }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)

  useEffect(() => {
    loadDeals()
  }, [currentUser])

  const loadDeals = () => {
    const allDeals = DataService.getDeals()
    const visibleUsers = AuthService.getUsersByLevel(currentUser)
    const visibleUserIds = visibleUsers.map((user) => user.id)
    const filteredDeals = allDeals.filter((deal) => visibleUserIds.includes(deal.responsible_user_id))
    setDeals(filteredDeals)
  }

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault()
    if (!draggedDeal || draggedDeal.stage === newStage) return

    const updatedDeal = DataService.updateDeal(draggedDeal.id, { stage: newStage })
    if (updatedDeal) {
      DataService.addActivityLog({
        deal_id: draggedDeal.id,
        user_id: currentUser.id,
        action: "stage_changed",
        details: `Moved from '${STAGE_LABELS[draggedDeal.stage]}' to '${STAGE_LABELS[newStage]}'`,
      })
      loadDeals()
    }
    setDraggedDeal(null)
  }

  const formatAmount = (deal: Deal) => {
    const amount = DataService.convertAmount(deal.original_amount, deal.currency, currency)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getResponsibleUser = (userId: string) => {
    return AuthService.getAllUsers().find((user) => user.id === userId)
  }

  const getCompanyName = (companyId: string) => {
    return DataService.getCompanyById(companyId)?.name || "Empresa Desconocida"
  }

  const getContactName = (contactId: string) => {
    return DataService.getContactById(contactId)?.name || "Contacto Desconocido"
  }

  const stages: DealStage[] = [
    "oportunidad-identificada",
    "cotizacion-generada",
    "aprobacion-pendiente",
    "orden-compra-generada",
    "anticipo-pagado",
    "proyectos-en-curso",
    "facturacion-final",
    "proyectos-terminados-perdidos",
  ]

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
            {stages.map((stage) => {
              const stageDeals = deals.filter((deal) => deal.stage === stage)
              const stageTotal = stageDeals.reduce((sum, deal) => {
                return sum + DataService.convertAmount(deal.original_amount, deal.currency, currency)
              }, 0)

              return (
                <div
                  key={stage}
                  className="nexus-card flex flex-col w-80 flex-shrink-0 bg-muted/30"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className="p-4 border-b border-border/50 flex-shrink-0 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[stage]}`} />
                        <h3 className="font-semibold text-sm">{STAGE_LABELS[stage]}</h3>
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
                        const responsibleUser = getResponsibleUser(deal.responsible_user_id)
                        const isOverdue = new Date(deal.deadline) < new Date()

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
                                  {deal.project_name}
                                </h4>

                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-lg text-primary">{formatAmount(deal)}</span>
                                  {deal.currency !== currency && (
                                    <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                                      {deal.currency}
                                    </Badge>
                                  )}
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div className="font-medium text-foreground">{getCompanyName(deal.company_id)}</div>
                                  <div>{getContactName(deal.client_id)}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {responsibleUser?.name}
                                  </div>
                                  <div
                                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                                      isOverdue ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {new Date(deal.deadline).toLocaleDateString("es-AR")}
                                  </div>
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
          onUpdate={loadDeals}
        />
      )}

      {showNewDealModal && (
        <NewDealModal currentUser={currentUser} onClose={() => setShowNewDealModal(false)} onSuccess={loadDeals} />
      )}
    </div>
  )
}
