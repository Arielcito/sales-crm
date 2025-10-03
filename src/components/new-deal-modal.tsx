"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataService, companies, contacts } from "@/lib/data"
import { AuthService } from "@/lib/auth"
import type { User, Currency, DealStage } from "@/lib/types"

interface NewDealModalProps {
  currentUser: User
  onClose: () => void
  onSuccess: () => void
}

export function NewDealModal({ currentUser, onClose, onSuccess }: NewDealModalProps) {
  const [formData, setFormData] = useState({
    project_name: "",
    original_amount: "",
    currency: "USD" as Currency,
    deadline: "",
    client_id: "",
    company_id: "",
    responsible_user_id: currentUser.id,
    stage: "oportunidad-identificada" as DealStage,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const visibleUsers = AuthService.getUsersByLevel(currentUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newDeal = DataService.createDeal({
        ...formData,
        original_amount: Number.parseFloat(formData.original_amount),
      })

      // Add activity log
      DataService.addActivityLog({
        deal_id: newDeal.id,
        user_id: currentUser.id,
        action: "deal_created",
        details: `Nueva negociación creada: ${formData.project_name}`,
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error creating deal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompanyChange = (companyId: string) => {
    setFormData((prev) => ({ ...prev, company_id: companyId, client_id: "" }))
  }

  const availableContacts = contacts.filter((contact) => contact.company_id === formData.company_id)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Negociación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Nombre del Proyecto *</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, project_name: e.target.value }))}
                placeholder="Ej: Sistema CRM Personalizado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_user_id">Usuario Responsable</Label>
              <Select
                value={formData.responsible_user_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, responsible_user_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibleUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_amount">Monto *</Label>
              <Input
                id="original_amount"
                type="number"
                value={formData.original_amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, original_amount: e.target.value }))}
                placeholder="150000"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: Currency) => setFormData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                  <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_id">Empresa *</Label>
              <Select value={formData.company_id} onValueChange={handleCompanyChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Contacto *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, client_id: value }))}
                required
                disabled={!formData.company_id}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={formData.company_id ? "Seleccionar contacto" : "Primero selecciona una empresa"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableContacts.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay contactos para esta empresa
                    </div>
                  ) : (
                    availableContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} {contact.area && `- ${contact.area}`}{" "}
                        {contact.position && `(${contact.position})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha Límite *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Etapa Inicial</Label>
              <Select
                value={formData.stage}
                onValueChange={(value: DealStage) => setFormData((prev) => ({ ...prev, stage: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oportunidad-identificada">Oportunidad identificada</SelectItem>
                  <SelectItem value="cotizacion-generada">Cotización generada y enviada</SelectItem>
                  <SelectItem value="aprobacion-pendiente">Aprobación pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Negociación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
