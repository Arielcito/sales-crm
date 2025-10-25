"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useCreateStage } from "@/hooks/use-deal-stages"

interface CreateStageModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateStageModal({ onClose, onSuccess }: CreateStageModalProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const { mutate: createStage, isPending } = useCreateStage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    createStage(
      {
        name: name.trim(),
        color,
        order: 0,
        isDefault: false,
        isActive: true,
      },
      {
        onSuccess: () => {
          console.log("[CreateStageModal] Stage created successfully")
          onSuccess()
          onClose()
        },
        onError: (error) => {
          console.error("[CreateStageModal] Error creating stage:", error)
          alert(error instanceof Error ? error.message : "Error al crear etapa")
        },
      }
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Etapa</DialogTitle>
          <DialogDescription>
            Crea una nueva etapa en tu pipeline de ventas
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
                autoFocus
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
              <p className="text-xs text-muted-foreground">
                Elige un color que represente esta etapa en el pipeline
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
              Crear Etapa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
