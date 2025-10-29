"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateTeam, useDeleteTeam } from "@/hooks/use-teams"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import type { Team } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TeamFormModalProps {
  team: Team | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamFormModal({ team, open, onOpenChange }: TeamFormModalProps) {
  const [name, setName] = useState(team?.name || "")
  const [description, setDescription] = useState(team?.description || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const updateTeam = useUpdateTeam()
  const deleteTeam = useDeleteTeam()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!team) return

    if (name.trim().length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres")
      return
    }

    updateTeam.mutate(
      {
        id: team.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setName("")
          setDescription("")
        },
      }
    )
  }

  const handleDelete = () => {
    if (!team) return

    deleteTeam.mutate(team.id, {
      onSuccess: () => {
        onOpenChange(false)
        setShowDeleteDialog(false)
        setName("")
        setDescription("")
      },
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("")
      setDescription("")
    }
    onOpenChange(newOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del equipo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa el nombre del equipo"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del equipo"
                rows={3}
              />
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={updateTeam.isPending || deleteTeam.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={updateTeam.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateTeam.isPending}>
                  {updateTeam.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el equipo permanentemente. Solo se pueden eliminar equipos sin miembros asignados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTeam.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteTeam.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeam.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
