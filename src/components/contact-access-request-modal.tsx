"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRequestContactAccess } from "@/hooks/use-contact-permissions"

interface ContactAccessRequestModalProps {
  isOpen: boolean
  onClose: () => void
  contactId: string
  fieldName: string
}

export function ContactAccessRequestModal({
  isOpen,
  onClose,
  contactId,
  fieldName,
}: ContactAccessRequestModalProps) {
  const [reason, setReason] = useState("")
  const requestAccess = useRequestContactAccess()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await requestAccess.mutateAsync({
        contactId,
        reason: reason.trim() || undefined,
      })

      onClose()
      setReason("")
    } catch (error) {
      console.error("[ContactAccessRequestModal] Error requesting access:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Acceso a Datos de Contacto</DialogTitle>
          <DialogDescription>
            Estás solicitando acceso a {fieldName} de este contacto. El administrador revisará tu solicitud.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Explica por qué necesitas acceso a esta información..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={requestAccess.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={requestAccess.isPending}>
              {requestAccess.isPending ? "Enviando..." : "Solicitar Acceso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
