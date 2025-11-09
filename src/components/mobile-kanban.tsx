"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useDeals, useUpdateDeal, useDeleteDeal } from "@/hooks/use-deals"
import { useCompanies } from "@/hooks/use-companies"
import { useContacts } from "@/hooks/use-contacts"
import { useConvertCurrency } from "@/hooks/use-exchange-rate"
import { useDealStages } from "@/hooks/use-deal-stages"
import { useVisibleUsers } from "@/hooks/use-users"
import type { Deal, User, Currency, DealStage } from "@/lib/types"
import { DealModal } from "./deal-modal"
import { CurrencyToggle } from "./currency-toggle"
import { NewDealModal } from "./new-deal-modal"

const DEFAULT_CURRENCY: Currency = "USD"

const isCurrency = (value: string): value is Currency => value === "USD" || value === "ARS"

const getDealBaseAmount = (deal: Deal): number => {
  if (isCurrency(deal.currency)) {
    return deal.currency === "USD" ? deal.amountUsd ?? 0 : deal.amountArs ?? 0
  }

  return deal.amountUsd ?? deal.amountArs ?? 0
}

interface MobileKanbanProps {
  currentUser: User
}

export function MobileKanban({ currentUser }: MobileKanbanProps) {
  const { data: allDeals = [], isLoading: dealsLoading } = useDeals(currentUser.id)
  const { data: companies = [] } = useCompanies()
  const { data: contacts = [] } = useContacts()
  const { data: stages = [], isLoading: stagesLoading } = useDealStages()
  const { data: visibleUsers = [] } = useVisibleUsers(currentUser)
  const { convertAmount } = useConvertCurrency()
  const updateDealMutation = useUpdateDeal()
  const { mutate: deleteDeal } = useDeleteDeal()

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [activeStage, setActiveStage] = useState<string | null>(null)

  const orderedStages = useMemo(() => {
    return [...stages].sort((a, b) => a.order - b.order)
  }, [stages])

  const stageIds = useMemo(() => orderedStages.map((stage) => stage.id), [orderedStages])

  useEffect(() => {
    if (!activeStage && orderedStages.length > 0) {
      setActiveStage(orderedStages[0].id)
    }
  }, [activeStage, orderedStages])

  const currentStageValue = activeStage ?? orderedStages[0]?.id ?? ""

  const visibleUserIds = useMemo(() => {
    return visibleUsers.length > 0 ? visibleUsers.map((user) => user.id) : [currentUser.id]
  }, [visibleUsers, currentUser.id])

  const deals = useMemo(() => {
    return allDeals.filter((deal) => visibleUserIds.includes(deal.userId))
  }, [allDeals, visibleUserIds])

  const formatAmount = (deal: Deal) => {
    const dealCurrency: Currency = isCurrency(deal.currency) ? deal.currency : DEFAULT_CURRENCY
    const baseAmount = getDealBaseAmount(deal)
    const converted = convertAmount(baseAmount, dealCurrency, currency)

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted)
  }

  const getResponsibleUserName = (userId: string) => {
    const user = visibleUsers.find((item) => item.id === userId)
    if (user) return user.name
    if (currentUser.id === userId) return currentUser.name
    return "Usuario desconocido"
  }

  const getCompanyName = (companyId?: string | null) => {
    if (!companyId) return "Empresa desconocida"
    return companies.find((company) => company.id === companyId)?.name || "Empresa desconocida"
  }

  const getContactName = (contactId?: string | null) => {
    if (!contactId) return "Contacto desconocido"
    return contacts.find((contact) => contact.id === contactId)?.name || "Contacto desconocido"
  }

  const moveToStage = async (deal: Deal, stageIndex: number) => {
    if (stageIndex < 0 || stageIndex >= stageIds.length) return

    const nextStageId = stageIds[stageIndex]

    try {
      await updateDealMutation.mutateAsync({
        id: deal.id,
        data: { stageId: nextStageId },
      })
    } catch (error) {
      console.error("[MobileKanban] Error updating deal stage", error)
    }
  }

  const moveToNextStage = (deal: Deal) => {
    const currentIndex = stageIds.indexOf(deal.stageId)
    if (currentIndex === -1) return
    moveToStage(deal, currentIndex + 1)
  }

  const moveToPrevStage = (deal: Deal) => {
    const currentIndex = stageIds.indexOf(deal.stageId)
    if (currentIndex === -1) return
    moveToStage(deal, currentIndex - 1)
  }

  const handleDeleteDeal = (dealId: string) => {
    console.log("[MobileKanban] Deleting deal:", dealId)
    deleteDeal(dealId)
  }

  if (dealsLoading || stagesLoading || !currentStageValue) {
    return (
      <div className="md:hidden h-screen flex flex-col">
        <div className="p-6 text-sm text-muted-foreground">Cargando pipeline...</div>
      </div>
    )
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
        <Tabs value={currentStageValue} onValueChange={(value: string) => setActiveStage(value)} className="h-full flex flex-col">
          <div className="px-4 py-2 border-b border-border">
            <TabsList className="flex flex-wrap gap-1 bg-muted/50 p-1">
              {orderedStages.map((stage) => {
                const stageDeals = deals.filter((deal) => deal.stageId === stage.id)
                return (
                  <TabsTrigger
                    key={stage.id}
                    value={stage.id}
                    className="text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="text-left">
                      <div className="font-medium line-clamp-1">{stage.name}</div>
                      <div className="text-[11px] opacity-70">({stageDeals.length})</div>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {orderedStages.map((stage) => {
            const stageDeals = deals.filter((deal) => deal.stageId === stage.id)
            const stageTotal = stageDeals.reduce((total, deal) => {
              const dealCurrency: Currency = isCurrency(deal.currency) ? deal.currency : DEFAULT_CURRENCY
              const baseAmount = getDealBaseAmount(deal)
              return total + convertAmount(baseAmount, dealCurrency, currency)
            }, 0)

            return (
              <TabsContent key={stage.id} value={stage.id} className="flex-1 overflow-hidden m-0">
                <div className="h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-border bg-card">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color || "var(--primary)" }}
                      />
                      <h3 className="font-semibold text-sm">{stage.name}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total: {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stageTotal)}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {stageDeals.map((deal) => {
                        const responsibleUserName = getResponsibleUserName(deal.userId)
                        const dueDate = deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null
                        const isOverdue = dueDate ? dueDate < new Date() : false
                        const currentIndex = stageIds.indexOf(deal.stageId)

                        return (
                          <Card
                            key={deal.id}
                            className="cursor-pointer card-hover border-l-4"
                            style={{ borderLeftColor: stage.color || "var(--primary)" }}
                            onClick={() => setSelectedDeal(deal)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm leading-tight line-clamp-2">{deal.title}</h4>

                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-lg text-primary">{formatAmount(deal)}</span>
                                  {isCurrency(deal.currency) && deal.currency !== currency && (
                                    <Badge variant="outline" className="text-xs">
                                      {deal.currency}
                                    </Badge>
                                  )}
                                </div>

                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="font-medium">{getCompanyName(deal.companyId)}</div>
                                  <div>{getContactName(deal.contactId)}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="text-xs text-muted-foreground font-medium">
                                    {responsibleUserName}
                                  </div>
                                  {dueDate && (
                                    <div
                                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        isOverdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {dueDate.toLocaleDateString("es-AR")}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-2 space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentIndex <= 0}
                                    onClick={(event) => {
                                      event.stopPropagation()
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
                                    disabled={currentIndex === stageIds.length - 1}
                                    onClick={(event) => {
                                      event.stopPropagation()
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

                      {stageDeals.length === 0 && (
                        <div className="text-center text-xs text-muted-foreground py-6">
                          No hay negocios en esta etapa.
                        </div>
                      )}
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
          onUpdate={() => setSelectedDeal(null)}
          onDelete={() => handleDeleteDeal(selectedDeal.id)}
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
