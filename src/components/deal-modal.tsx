"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Activity } from "lucide-react"
import { useUpdateDeal } from "@/hooks/use-deals"
import { useCompanies } from "@/hooks/use-companies"
import { useContacts } from "@/hooks/use-contacts"
import { useDealStages } from "@/hooks/use-deal-stages"
import { useDealHistory } from "@/hooks/use-deal-history"
import { useUsers } from "@/hooks/use-users"
import type { Deal, User, Currency } from "@/lib/types"

interface DealModalProps {
  deal: Deal
  currentUser: User
  currency: Currency
  onClose: () => void
  onUpdate: () => void
}

export function DealModal({ deal, currentUser, currency, onClose, onUpdate }: DealModalProps) {
  const { data: companies = [] } = useCompanies()
  const { data: contacts = [] } = useContacts()
  const { data: stages = [] } = useDealStages()
  const { data: users = [] } = useUsers()
  const { data: history = [], isLoading: isLoadingHistory } = useDealHistory(deal.id)
  const updateDealMutation = useUpdateDeal()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(deal)

  const company = companies.find((c) => c.id === deal.companyId)
  const contact = contacts.find((c) => c.id === deal.contactId)
  const responsibleUser = users.find((user) => user.id === deal.userId)
  const currentStage = stages.find((s) => s.id === deal.stageId)

  const handleSave = async () => {
    try {
      console.log("[DealModal] Saving deal:", deal.id)
      await updateDealMutation.mutateAsync({
        id: deal.id,
        data: {
          title: formData.title,
          currency: formData.currency as Currency,
          amountUsd: formData.currency === "USD" ? (formData.amountUsd ?? undefined) : undefined,
          amountArs: formData.currency === "ARS" ? (formData.amountArs ?? undefined) : undefined,
          stageId: formData.stageId,
          expectedCloseDate: formData.expectedCloseDate ?? undefined,
        }
      })
      console.log("[DealModal] Deal saved successfully")
      onUpdate()
      setIsEditing(false)
    } catch (error) {
      console.error("[DealModal] Error updating deal:", error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto mx-auto nexus-card">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="text-xl font-bold">{deal.title}</span>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="shadow-sm">
                  Editar
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} className="bg-accent hover:bg-accent/90 shadow-sm">
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Título del Deal</Label>
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-balance">{deal.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Etapa</Label>
              {isEditing ? (
                <Select
                  value={formData.stageId}
                  onValueChange={(value) => setFormData({ ...formData, stageId: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {currentStage?.name}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Monto</Label>
              {isEditing ? (
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={formData.currency === "USD" ? formData.amountUsd || "" : formData.amountArs || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (formData.currency === "USD") {
                        setFormData({ ...formData, amountUsd: value })
                      } else {
                        setFormData({ ...formData, amountArs: value })
                      }
                    }}
                    className="text-sm"
                  />
                  <Select
                    value={formData.currency}
                    onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="w-20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="ARS">ARS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: deal.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(deal.currency === "USD" ? (deal.amountUsd || 0) : (deal.amountArs || 0))}
                  </p>
                  {deal.currency !== currency && (
                    <p className="text-xs text-muted-foreground">
                      Moneda original: {deal.currency}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha de Cierre Esperada</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value ? new Date(e.target.value) : null })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm">
                  {deal.expectedCloseDate
                    ? new Date(deal.expectedCloseDate).toLocaleDateString()
                    : "Sin fecha"}
                </p>
              )}
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
            <h3 className="font-semibold mb-4 text-base flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-primary" />
              </div>
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground text-xs font-medium">Empresa</Label>
                <p className="text-sm font-medium mt-1">{company?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs font-medium">Contacto</Label>
                <p className="text-sm font-medium mt-1">{contact?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs font-medium">Industria</Label>
                <p className="text-sm font-medium mt-1">{company?.industry}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs font-medium">Responsable</Label>
                <p className="text-sm font-medium mt-1">{responsibleUser?.name}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Log */}
          <div>
            <h3 className="font-semibold mb-4 text-base flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              Registro de Actividad
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {isLoadingHistory ? (
                <p className="text-sm text-muted-foreground text-center py-4">Cargando actividad...</p>
              ) : history.length > 0 ? (
                history.map((log) => {
                  const user = users.find((u) => u.id === log.userId)
                  return (
                    <div key={log.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {log.changeType.replace("_", " ")}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {log.notes && <p className="text-sm text-foreground">{log.notes}</p>}
                      {log.fieldName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.fieldName}: {log.oldValue} → {log.newValue}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">por {user?.name || log.userName}</p>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Aún no se ha registrado actividad.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
