"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateCompany } from "@/hooks/use-companies"
import type { Company } from "@/lib/types"

interface EditCompanyModalProps {
  company: Company
  onClose: () => void
  onSuccess: () => void
}

export function EditCompanyModal({ company, onClose, onSuccess }: EditCompanyModalProps) {
  const [formData, setFormData] = useState({
    name: company.name,
    industry: company.industry || "",
    website: company.website || "",
  })

  const updateCompanyMutation = useUpdateCompany()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateCompanyMutation.mutateAsync({ id: company.id, data: formData })
      onSuccess()
    } catch (error) {
      console.error("[EditCompanyModal] Error updating company:", error)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Empresa *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: TechCorp SA"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industria</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
              placeholder="Ej: Tecnología"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="Ej: techcorp.com"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateCompanyMutation.isPending}>
              {updateCompanyMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
