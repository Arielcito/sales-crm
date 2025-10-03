"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateContact } from "@/hooks/use-contacts"

interface NewContactModalProps {
  companyId: string
  companyName: string
  onClose: () => void
  onSuccess: () => void
}

export function NewContactModal({ companyId, companyName, onClose, onSuccess }: NewContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    area: "",
  })

  const createContactMutation = useCreateContact()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createContactMutation.mutateAsync({
        ...formData,
        company_id: companyId,
      })
      onSuccess()
    } catch (error) {
      console.error("[NewContactModal] Error creating contact:", error)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Contacto - {companyName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Roberto Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Ej: roberto@empresa.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Ej: +54 11 1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
              placeholder="Ej: Director de IT"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área / Departamento</Label>
            <Input
              id="area"
              value={formData.area}
              onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="Ej: Tecnología, Compras, Ventas"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContactMutation.isPending}>
              {createContactMutation.isPending ? "Creando..." : "Crear Contacto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
