"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import type { Deal, User, Currency, DealStage } from "@/lib/types"
import { DealModal } from "./deal-modal"
import { CurrencyToggle } from "./currency-toggle"
import { NewDealModal } from "./new-deal-modal"
import { KanbanSkeleton } from "./kanban-skeleton"
import { DashboardFilters } from "./dashboard-filters"
import { StageSettingsMenu } from "./stage-settings-menu"
import { EditStageModal } from "./edit-stage-modal"
import { CreateStageModal } from "./create-stage-modal"
import { StatCard } from "./stat-card"
import { useDeals, useUpdateDeal } from "@/hooks/use-deals"
import { useDashboardFilters } from "@/hooks/use-dashboard-filters"
import { useToggleStageActive } from "@/hooks/use-deal-stages"
import { useDashboardStats } from "@/hooks/use-dashboard-data"
import { TrendingUp, Briefcase, CheckCircle2, XCircle } from "lucide-react"

interface KanbanBoardProps {
  currentUser: User
  stages: DealStage[]
  companies: Array<{ id: string; name: string }>
  contacts: Array<{ id: string; name: string }>
  users: Array<{ id: string; name: string }>
}

export function KanbanBoard({ currentUser, stages, companies, contacts, users }: KanbanBoardProps) {
  const { data: deals = [], isLoading } = useDeals()
  const { mutate: updateDeal, isPending: isUpdating } = useUpdateDeal()
  const { mutate: toggleStageActive } = useToggleStageActive()
  const { dateRange, setDateRange, currency, setCurrency } = useDashboardFilters()
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats({ dateRange, currency })

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [optimisticDealId, setOptimisticDealId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [editingStage, setEditingStage] = useState<DealStage | null>(null)
  const [showCreateStageModal, setShowCreateStageModal] = useState(false)

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
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

    setOptimisticDealId(draggedDeal.id)

    updateDeal(
      {
        id: draggedDeal.id,
        data: { stageId: newStageId }
      },
      {
        onSettled: () => {
          setOptimisticDealId(null)
        }
      }
    )

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

  const handleEditStage = (stage: DealStage) => {
    console.log("[KanbanBoard] Editing stage:", stage.id)
    setEditingStage(stage)
  }

  const handleCreateStage = () => {
    console.log("[KanbanBoard] Creating new stage")
    setShowCreateStageModal(true)
  }

  const handleToggleStageActive = (stage: DealStage) => {
    console.log("[KanbanBoard] Toggling stage active:", stage.id, !stage.isActive)

    const confirmMessage = stage.isActive
      ? `¿Estás seguro que deseas inactivar la etapa "${stage.name}"? Los negocios existentes permanecerán en esta etapa pero no será visible.`
      : `¿Deseas activar la etapa "${stage.name}"?`

    if (!confirm(confirmMessage)) {
      return
    }

    toggleStageActive(
      { id: stage.id, isActive: !stage.isActive },
      {
        onSuccess: () => {
          console.log("[KanbanBoard] Stage active toggled successfully")
        },
        onError: (error) => {
          console.error("[KanbanBoard] Error toggling stage active:", error)
          alert(error instanceof Error ? error.message : "Error al cambiar estado de etapa")
        },
      }
    )
  }

  const orderedStages = [...stages].filter(s => s.isActive).sort((a, b) => a.order - b.order)
  const isAdmin = currentUser.level === 1
  const currencySymbol = currency === "USD" ? "USD" : "ARS"

  if (isLoading) {
    return <KanbanSkeleton />
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex-shrink-0 bg-card border-b border-border/50 shadow-sm overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
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
            </div>
          </div>
          <DashboardFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard
              title="Negociaciones Abiertas"
              description="En oportunidad, cotización, aprobación y OC"
              value={isLoadingStats ? "Cargando..." : `${stats?.openNegotiations.count || 0} (${currencySymbol} ${(stats?.openNegotiations.amount || 0).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })})`}
              icon={TrendingUp}
            />

            <StatCard
              title="Proyectos en Curso"
              description="Anticipo pagado, en curso y facturación final"
              value={isLoadingStats ? "Cargando..." : `${stats?.ongoingProjects.count || 0} (${currencySymbol} ${(stats?.ongoingProjects.amount || 0).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })})`}
              icon={Briefcase}
            />

            <StatCard
              title="Proyectos Terminados"
              description="Proyectos finalizados exitosamente"
              value={isLoadingStats ? "Cargando..." : `${stats?.finishedProjects.count || 0} (${currencySymbol} ${(stats?.finishedProjects.amount || 0).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })})`}
              icon={CheckCircle2}
            />

            <StatCard
              title="Proyectos Perdidos"
              description="Oportunidades que no se concretaron"
              value={isLoadingStats ? "Cargando..." : `${stats?.lostProjects.count || 0} (${currencySymbol} ${(stats?.lostProjects.amount || 0).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })})`}
              icon={XCircle}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="flex gap-4 p-6 h-full min-w-max">
            {orderedStages.map((stage) => {
              const stageDeals = deals.filter((deal) => deal.stageId === stage.id)
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
                  className={`nexus-card flex flex-col w-80 flex-shrink-0 bg-muted/30 transition-all duration-200 ${
                    isDropTarget ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-4 border-b border-border/50 flex-shrink-0 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-semibold text-sm">{stage.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-0">
                          {stageDeals.length}
                        </Badge>
                        <StageSettingsMenu
                          stage={stage}
                          onEdit={handleEditStage}
                          onCreate={handleCreateStage}
                          onToggleActive={handleToggleStageActive}
                          isAdmin={isAdmin}
                        />
                      </div>
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
                        const isBeingDragged = draggedDeal?.id === deal.id
                        const isOptimistic = optimisticDealId === deal.id
                        const isDealUpdating = isUpdating && isOptimistic

                        return (
                          <Card
                            key={deal.id}
                            className={`cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card ${
                              isBeingDragged ? "opacity-40 scale-95" : ""
                            } ${
                              isOptimistic ? "ring-2 ring-primary/50 animate-pulse" : ""
                            }`}
                            draggable={!isDealUpdating}
                            onDragStart={(e) => handleDragStart(e, deal)}
                            onClick={() => !isBeingDragged && setSelectedDeal(deal)}
                          >
                            <CardContent className="p-4 relative">
                              {isDealUpdating && (
                                <div className="absolute top-2 right-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                              )}
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
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {responsibleUser?.name}
                                  </div>
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

      {editingStage && (
        <EditStageModal
          stage={editingStage}
          onClose={() => setEditingStage(null)}
          onSuccess={() => setEditingStage(null)}
        />
      )}

      {showCreateStageModal && (
        <CreateStageModal
          onClose={() => setShowCreateStageModal(false)}
          onSuccess={() => setShowCreateStageModal(false)}
        />
      )}
    </div>
  )
}
