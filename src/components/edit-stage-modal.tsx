"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { DealStage } from "@/lib/types"
import { useUpdateStage } from "@/hooks/use-deal-stages"

interface EditStageModalProps {
  stage: DealStage
  onClose: () => void
  onSuccess: () => void
}

export function EditStageModal({ stage, onClose, onSuccess }: EditStageModalProps) {
  const [name, setName] = useState(stage.name)
  const [color, setColor] = useState(stage.color)
  const [order, setOrder] = useState(stage.order)
  const { mutate: updateStage, isPending } = useUpdateStage()

  useEffect(() => {
    setName(stage.name)
    setColor(stage.color)
    setOrder(stage.order)
  }, [stage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    updateStage(
      {
        id: stage.id,
        data: {
          name: name.trim(),
          color,
          order,
        },
      },
      {
        onSuccess: () => {
          console.log("[EditStageModal] Stage updated successfully")
          onSuccess()
          onClose()
        },
        onError: (error) => {
          console.error("[EditStageModal] Error updating stage:", error)
          alert(error instanceof Error ? error.message : "Error al actualizar etapa")
        },
      }
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Etapa</DialogTitle>
          <DialogDescription>
            Modifica el nombre, color y posición de la etapa
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la etapa</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Prospección, Negociación..."
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                  disabled={isPending}
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Posición</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="0"
                disabled={isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                Las etapas se ordenan de menor a mayor. 0 es la primera posición.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
