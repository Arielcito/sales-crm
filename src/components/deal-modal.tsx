"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Activity } from "lucide-react" // Fixed icon imports to use lucide-react instead of non-existent icons file
import { DataService } from "@/lib/data"
import { AuthService } from "@/lib/auth"
import type { Deal, User, Currency, DealStage } from "@/lib/types"

const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: "lead", label: "Prospecto" },
  { value: "qualified", label: "Calificado" },
  { value: "proposal", label: "Propuesta" },
  { value: "negotiation", label: "Negociación" },
  { value: "closed-won", label: "Ganado" },
  { value: "closed-lost", label: "Perdido" },
]

interface DealModalProps {
  deal: Deal
  currentUser: User
  currency: Currency
  onClose: () => void
  onUpdate: () => void
}

export function DealModal({ deal, currentUser, currency, onClose, onUpdate }: DealModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(deal)
  const [activityLogs, setActivityLogs] = useState(DataService.getActivityLogsByDealId(deal.id))

  useEffect(() => {
    setActivityLogs(DataService.getActivityLogsByDealId(deal.id))
  }, [deal.id])

  const company = DataService.getCompanyById(deal.company_id)
  const contact = DataService.getContactById(deal.client_id)
  const responsibleUser = AuthService.getAllUsers().find((user) => user.id === deal.responsible_user_id)

  const formatAmount = (amount: number, originalCurrency: Currency) => {
    const convertedAmount = DataService.convertAmount(amount, originalCurrency, currency)
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedAmount)
  }

  const handleSave = () => {
    const updatedDeal = DataService.updateDeal(deal.id, formData)
    if (updatedDeal) {
      // Add activity log for changes
      const changes = []
      if (formData.project_name !== deal.project_name) changes.push("nombre del proyecto")
      if (formData.original_amount !== deal.original_amount) changes.push("monto")
      if (formData.stage !== deal.stage) changes.push("etapa")
      if (formData.deadline !== deal.deadline) changes.push("fecha límite")

      if (changes.length > 0) {
        DataService.addActivityLog({
          deal_id: deal.id,
          user_id: currentUser.id,
          action: "deal_updated",
          details: `Actualizado: ${changes.join(", ")}`,
        })
      }

      onUpdate()
      setIsEditing(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto mx-auto nexus-card">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="text-xl font-bold">{deal.project_name}</span>
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
              <Label className="text-sm font-medium">Nombre del Proyecto</Label>
              {isEditing ? (
                <Input
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-balance">{deal.project_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Etapa</Label>
              {isEditing ? (
                <Select
                  value={formData.stage}
                  onValueChange={(value: DealStage) => setFormData({ ...formData, stage: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {STAGE_OPTIONS.find((s) => s.value === deal.stage)?.label}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Monto</Label>
              {isEditing ? (
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={formData.original_amount}
                    onChange={(e) => setFormData({ ...formData, original_amount: Number(e.target.value) })}
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
                  <p className="font-semibold text-sm">{formatAmount(deal.original_amount, deal.currency)}</p>
                  {deal.currency !== currency && (
                    <p className="text-xs text-muted-foreground">
                      Original:{" "}
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: deal.currency,
                      }).format(deal.original_amount)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha Límite</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm">{new Date(deal.deadline).toLocaleDateString()}</p>
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
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => {
                  const user = AuthService.getAllUsers().find((u) => u.id === log.user_id)
                  return (
                    <div key={log.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {log.action.replace("_", " ")}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">por {user?.name}</p>
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
