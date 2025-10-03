"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
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
  "oportunidad-identificada": "stage-initial",
  "cotizacion-generada": "stage-early",
  "aprobacion-pendiente": "stage-early",
  "orden-compra-generada": "stage-middle",
  "anticipo-pagado": "stage-middle",
  "proyectos-en-curso": "stage-progress",
  "facturacion-final": "stage-success",
  "proyectos-terminados-perdidos": "stage-lost",
}

const STAGE_SHORT_LABELS: Record<DealStage, string> = {
  "oportunidad-identificada": "Oportunidad",
  "cotizacion-generada": "Cotización",
  "aprobacion-pendiente": "Aprobación",
  "orden-compra-generada": "Orden Compra",
  "anticipo-pagado": "Anticipo",
  "proyectos-en-curso": "En Curso",
  "facturacion-final": "Facturación",
  "proyectos-terminados-perdidos": "Terminados",
}

interface MobileKanbanProps {
  currentUser: User
}

export function MobileKanban({ currentUser }: MobileKanbanProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [activeStage, setActiveStage] = useState<DealStage>("oportunidad-identificada")

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

  const formatAmount = (deal: Deal) => {
    const amount = DataService.convertAmount(deal.original_amount, deal.currency, currency)
    return new Intl.NumberFormat("es-AR", {
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

  const moveToNextStage = (deal: Deal) => {
    const currentIndex = stages.indexOf(deal.stage)
    if (currentIndex < stages.length - 1) {
      const newStage = stages[currentIndex + 1]
      const updatedDeal = DataService.updateDeal(deal.id, { stage: newStage })
      if (updatedDeal) {
        DataService.addActivityLog({
          deal_id: deal.id,
          user_id: currentUser.id,
          action: "stage_changed",
          details: `Moved from '${STAGE_LABELS[deal.stage]}' to '${STAGE_LABELS[newStage]}'`,
        })
        loadDeals()
      }
    }
  }

  const moveToPrevStage = (deal: Deal) => {
    const currentIndex = stages.indexOf(deal.stage)
    if (currentIndex > 0) {
      const newStage = stages[currentIndex - 1]
      const updatedDeal = DataService.updateDeal(deal.id, { stage: newStage })
      if (updatedDeal) {
        DataService.addActivityLog({
          deal_id: deal.id,
          user_id: currentUser.id,
          action: "stage_changed",
          details: `Moved from '${STAGE_LABELS[deal.stage]}' to '${STAGE_LABELS[newStage]}'`,
        })
        loadDeals()
      }
    }
  }

  return (
    <div className="md:hidden h-screen flex flex-col">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Pipeline de Ventas</h2>
            <p className="text-sm text-muted-foreground">
              {deals.length} negocios • Nivel {currentUser.level}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={() => setShowNewDealModal(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
            <CurrencyToggle currency={currency} onCurrencyChange={setCurrency} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeStage}
          onValueChange={(value) => setActiveStage(value as DealStage)}
          className="h-full flex flex-col"
        >
          <div className="px-4 py-2 border-b border-border">
            <TabsList className="grid grid-cols-4 gap-1 h-auto p-1 bg-muted/50">
              {stages.slice(0, 4).map((stage) => {
                const stageDeals = deals.filter((deal) => deal.stage === stage)
                return (
                  <TabsTrigger
                    key={stage}
                    value={stage}
                    className="text-xs p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="text-center">
                      <div className="font-medium">{STAGE_SHORT_LABELS[stage]}</div>
                      <div className="text-xs opacity-70">({stageDeals.length})</div>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <div className="px-4 py-2 border-b border-border">
            <TabsList className="grid grid-cols-4 gap-1 h-auto p-1 bg-muted/50">
              {stages.slice(4).map((stage) => {
                const stageDeals = deals.filter((deal) => deal.stage === stage)
                return (
                  <TabsTrigger
                    key={stage}
                    value={stage}
                    className="text-xs p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="text-center">
                      <div className="font-medium">{STAGE_SHORT_LABELS[stage]}</div>
                      <div className="text-xs opacity-70">({stageDeals.length})</div>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {stages.map((stage) => {
            const stageDeals = deals.filter((deal) => deal.stage === stage)
            const stageTotal = stageDeals.reduce((sum, deal) => {
              return sum + DataService.convertAmount(deal.original_amount, deal.currency, currency)
            }, 0)

            return (
              <TabsContent key={stage} value={stage} className="flex-1 overflow-hidden m-0">
                <div className="h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-border bg-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`} />
                      <h3 className="font-semibold text-sm">{STAGE_LABELS[stage]}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total:{" "}
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stageTotal)}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {stageDeals.map((deal) => {
                        const responsibleUser = getResponsibleUser(deal.responsible_user_id)
                        const isOverdue = new Date(deal.deadline) < new Date()
                        const currentIndex = stages.indexOf(deal.stage)

                        return (
                          <Card
                            key={deal.id}
                            className="cursor-pointer card-hover border-l-4"
                            style={{
                              borderLeftColor: `var(--color-${STAGE_COLORS[deal.stage].replace("stage-", "stage-")})`,
                            }}
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
                                    <Badge variant="outline" className="text-xs">
                                      {deal.currency}
                                    </Badge>
                                  )}
                                </div>

                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="font-medium">{getCompanyName(deal.company_id)}</div>
                                  <div>{getContactName(deal.client_id)}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="text-xs text-muted-foreground font-medium">
                                    {responsibleUser?.name}
                                  </div>
                                  <div
                                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      isOverdue
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {new Date(deal.deadline).toLocaleDateString("es-AR")}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentIndex === 0}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moveToPrevStage(deal)
                                    }}
                                    className="flex-1"
                                  >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Anterior
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentIndex === stages.length - 1}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moveToNextStage(deal)
                                    }}
                                    className="flex-1"
                                  >
                                    Siguiente
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
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
