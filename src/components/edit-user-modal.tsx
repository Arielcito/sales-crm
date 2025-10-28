"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/lib/types"
import { useUpdateUser } from "@/hooks/use-users"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  allUsers: User[]
}

export function EditUserModal({ isOpen, onClose, user, allUsers }: EditUserModalProps) {
  const updateUser = useUpdateUser()

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    level: user.level.toString(),
    managerId: user.managerId ?? "",
    teamId: user.teamId ?? "",
  })

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level.toString(),
      managerId: user.managerId ?? "",
      teamId: user.teamId ?? "",
    })
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[EditUserModal] Updating user:", user.id)

    updateUser.mutate(
      {
        id: user.id,
        data: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          level: Number.parseInt(formData.level),
          managerId: formData.managerId || null,
          teamId: formData.teamId || null,
        },
      },
      {
        onSuccess: () => {
          console.log("[EditUserModal] User updated successfully")
          onClose()
        },
        onError: (error) => {
          console.error("[EditUserModal] Error updating user:", error)
          alert(error.message || "No se pudo actualizar el usuario")
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nombre Completo</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-role">Rol</Label>
            <Input
              id="edit-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-level">Nivel</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Nivel 1 - Ejecutivo</SelectItem>
                <SelectItem value="2">Nivel 2 - Director</SelectItem>
                <SelectItem value="3">Nivel 3 - Senior</SelectItem>
                <SelectItem value="4">Nivel 4 - Junior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-manager">Gerente</Label>
            <Select
              value={formData.managerId || "none"}
              onValueChange={(value) => setFormData({ ...formData, managerId: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar gerente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin gerente</SelectItem>
                {allUsers
                  .filter((u) => u.id !== user.id)
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} - Nivel {u.level}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-team">ID del Equipo</Label>
            <Input
              id="edit-team"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={updateUser.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
