"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompanies } from "@/hooks/use-companies"
import { useContacts } from "@/hooks/use-contacts"
import { useCreateDeal } from "@/hooks/use-deals"
import { useDealStages } from "@/hooks/use-deal-stages"
import { useUsers } from "@/hooks/use-users"
import { useExchangeRate, useConvertCurrency } from "@/hooks/use-exchange-rate"
import type { User, Currency } from "@/lib/types"
import { apiClient } from "@/lib/api/client"

interface NewDealModalProps {
  currentUser: User
  onClose: () => void
  onSuccess: () => void
}

export function NewDealModal({ currentUser, onClose, onSuccess }: NewDealModalProps) {
  const { data: companies = [] } = useCompanies()
  const { data: contacts = [] } = useContacts()
  const { data: dealStages = [] } = useDealStages()
  const { data: users = [] } = useUsers()
  const createDealMutation = useCreateDeal()
  const { data: exchangeRate } = useExchangeRate()
  const { convertAmount } = useConvertCurrency()

  const [formData, setFormData] = useState({
    title: "",
    amountUsd: "",
    currency: "USD" as Currency,
    expectedCloseDate: "",
    contactId: "",
    companyId: "",
    userId: currentUser.id,
    stageId: dealStages[0]?.id || "",
  })

  const visibleUsers = useMemo(() => {
    return users.filter(user => user.level >= currentUser.level)
  }, [users, currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const amount = Number.parseFloat(formData.amountUsd)

      if (!exchangeRate?.usdToArs) {
        console.error("[NewDealModal] No exchange rate available")
        return
      }

      console.log("[NewDealModal] Creating deal with exchange rate:", exchangeRate.usdToArs)

      const savedExchangeRate = await apiClient<{ id: string }>("/api/exchange-rate", {
        method: "POST",
        body: JSON.stringify({ usdToArs: exchangeRate.usdToArs }),
      })

      console.log("[NewDealModal] Exchange rate saved with ID:", savedExchangeRate.id)

      const amountUsd = formData.currency === "USD"
        ? amount
        : convertAmount(amount, "ARS", "USD")

      const amountArs = formData.currency === "ARS"
        ? amount
        : convertAmount(amount, "USD", "ARS")

      console.log("[NewDealModal] Amounts - USD:", amountUsd, "ARS:", amountArs)

      await createDealMutation.mutateAsync({
        ...formData,
        amountUsd,
        amountArs,
        exchangeRateId: savedExchangeRate.id,
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("[NewDealModal] Error creating deal:", error)
    }
  }

  const handleCompanyChange = (companyId: string) => {
    setFormData((prev) => ({ ...prev, companyId, contactId: "" }))
  }

  const availableContacts = useMemo(() => {
    return contacts.filter((contact) => contact.companyId === formData.companyId)
  }, [contacts, formData.companyId])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Negociación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del Proyecto *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Sistema CRM Personalizado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">Usuario Responsable</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, userId: value }))}
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
              <Label htmlFor="amountUsd">Monto *</Label>
              <Input
                id="amountUsd"
                type="number"
                value={formData.amountUsd}
                onChange={(e) => setFormData((prev) => ({ ...prev, amountUsd: e.target.value }))}
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
              <Label htmlFor="companyId">Empresa *</Label>
              <Select value={formData.companyId} onValueChange={handleCompanyChange} required>
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
              <Label htmlFor="contactId">Contacto *</Label>
              <Select
                value={formData.contactId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, contactId: value }))}
                required
                disabled={!formData.companyId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={formData.companyId ? "Seleccionar contacto" : "Primero selecciona una empresa"}
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
                        {contact.name} {contact.position && `(${contact.position})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Fecha Límite *</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, expectedCloseDate: e.target.value }))}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageId">Etapa Inicial</Label>
              <Select
                value={formData.stageId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, stageId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dealStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createDealMutation.isPending}>
              {createDealMutation.isPending ? "Creando..." : "Crear Negociación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
