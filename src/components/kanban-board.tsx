"use client"

import type React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Deal, User, DealStage } from "@/lib/types"
import { DealModal } from "./deal-modal"
import { NewDealModal } from "./new-deal-modal"
import { KanbanSkeleton } from "./kanban-skeleton"
import { DashboardFilters } from "./dashboard-filters"
import { StageSettingsMenu } from "./stage-settings-menu"
import { EditStageModal } from "./edit-stage-modal"
import { CreateStageModal } from "./create-stage-modal"
import { StatCard } from "./stat-card"
import { KanbanDealCard } from "./kanban-deal-card"
import { useDeals, useUpdateDeal, useDeleteDeal } from "@/hooks/use-deals"
import { useDashboardFilters } from "@/hooks/use-dashboard-filters"
import { useToggleStageActive } from "@/hooks/use-deal-stages"
import { useDashboardStats } from "@/hooks/use-dashboard-data"
import { useTeamLeaders } from "@/hooks/use-teams"
import { TrendingUp, Briefcase, CheckCircle2, XCircle } from "lucide-react"

interface KanbanBoardProps {
  currentUser: User
  stages: DealStage[]
  companies: Array<{ id: string; name: string }>
  contacts: Array<{ id: string; name: string; status: string }>
  users: User[]
  teams: Array<{ id: string; name: string }>
}

export function KanbanBoard({ currentUser, stages, companies, contacts, users, teams }: KanbanBoardProps) {
  const { dateRange, setDateRange, currency, setCurrency, selectedTeamLeaderId, setSelectedTeamLeaderId } = useDashboardFilters()
  const { data: deals = [], isLoading } = useDeals(undefined, selectedTeamLeaderId === "all" ? undefined : selectedTeamLeaderId)
  const { mutate: updateDeal, isPending: isUpdating } = useUpdateDeal()
  const { mutate: deleteDeal } = useDeleteDeal()
  const { mutate: toggleStageActive } = useToggleStageActive()
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats({ dateRange, currency })
  const { data: teamLeaders = [] } = useTeamLeaders()

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

  const getUserTeamName = (user: User) => {
    if (!user?.teamId) return undefined
    return teams.find(t => t.id === user.teamId)?.name
  }

  const getCompanyName = (companyId?: string | null) => {
    if (!companyId) return "Sin empresa"
    return companies.find(c => c.id === companyId)?.name || "Empresa Desconocida"
  }

  const getContactName = (contactId?: string | null) => {
    if (!contactId) return "Sin contacto"
    return contacts.find(c => c.id === contactId)?.name || "Contacto Desconocido"
  }

  const getContactStatus = (contactId?: string | null) => {
    if (!contactId) return undefined
    return contacts.find(c => c.id === contactId)?.status
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

  const handleDeleteDeal = (dealId: string) => {
    console.log("[KanbanBoard] Deleting deal:", dealId)
    deleteDeal(dealId)
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
              <Button onClick={() => setShowNewDealModal(true)}>
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
            selectedTeamLeaderId={selectedTeamLeaderId}
            onTeamLeaderChange={setSelectedTeamLeaderId}
            teamLeaders={teamLeaders}
            showTeamFilter={currentUser.level === 1}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
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
                let amount = 0

                if (currency === deal.currency) {
                  amount = deal.currency === "USD" ? (deal.amountUsd || 0) : (deal.amountArs || 0)
                } else if (deal.dollarRate) {
                  if (currency === "USD" && deal.currency === "ARS") {
                    amount = (deal.amountArs || 0) / deal.dollarRate
                  } else if (currency === "ARS" && deal.currency === "USD") {
                    amount = (deal.amountUsd || 0) * deal.dollarRate
                  }
                } else {
                  amount = deal.currency === "USD" ? (deal.amountUsd || 0) : (deal.amountArs || 0)
                }

                return sum + amount
              }, 0)

              const isDropTarget = dragOverStage === stage.id

              const handleColumnDragOver = (e: React.DragEvent) => handleDragOver(e, stage.id)
              const handleColumnDrop = (e: React.DragEvent) => handleDrop(e, stage.id)

              return (
                <div
                  key={stage.id}
                  className={`nexus-card flex flex-col w-80 flex-shrink-0 bg-muted/30 transition-all duration-200 ${
                    isDropTarget ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
                  }`}
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

                  <section
                    className="flex-1 overflow-y-auto p-3"
                    onDragOver={handleColumnDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleColumnDrop}
                    aria-label={`Zona de drop para ${stage.name}`}
                  >
                    <div className="space-y-3">
                      {stageDeals.map((deal) => {
                        const responsibleUser = getUser(deal.userId)
                        const isBeingDragged = draggedDeal?.id === deal.id
                        const isOptimistic = optimisticDealId === deal.id
                        const isDealUpdating = isUpdating && isOptimistic

                        return (
                          <KanbanDealCard
                            key={deal.id}
                            deal={deal}
                            currency={currency}
                            isBeingDragged={isBeingDragged}
                            isOptimistic={isOptimistic}
                            isDealUpdating={isDealUpdating}
                            responsibleUserName={responsibleUser?.name}
                            responsibleUserLevel={responsibleUser?.level}
                            responsibleUserTeamName={responsibleUser ? getUserTeamName(responsibleUser) : undefined}
                            companyName={getCompanyName(deal.companyId)}
                            contactName={getContactName(deal.contactId)}
                            contactStatus={getContactStatus(deal.contactId)}
                            onDragStart={handleDragStart}
                            onClick={() => !isBeingDragged && setSelectedDeal(deal)}
                          />
                        )
                      })}
                    </div>
                  </section>
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
