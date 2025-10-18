"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"

interface CompanyRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CompanyRequestModal({ isOpen, onClose, onSuccess }: CompanyRequestModalProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("[CompanyRequestModal] Submitting request for:", formData.companyName)

      await apiClient("/api/companies/requests", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      console.log("[CompanyRequestModal] Request submitted successfully")

      toast.success("Solicitud enviada", {
        description: "La solicitud de empresa ha sido enviada al administrador"
      })

      onSuccess()
      onClose()

      setFormData({
        companyName: "",
        industry: "",
        website: "",
        email: "",
        phone: "",
        notes: "",
      })
    } catch (error) {
      console.error("[CompanyRequestModal] Error submitting request:", error)
      toast.error("Error al enviar solicitud", {
        description: "No se pudo enviar la solicitud. Por favor, intenta nuevamente."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Solicitar Nueva Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la Empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Ej: Acme Corporation"
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="contacto@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.empresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Información adicional sobre la empresa o el contacto..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
