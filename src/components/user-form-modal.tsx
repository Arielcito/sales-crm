"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateUser, useUpdateUser, useUsers } from "@/hooks/use-users"
import type { User } from "@/lib/types"
import { getAvailableLevels } from "@/lib/utils"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  editingUser?: User | null
}

export function UserFormModal({ isOpen, onClose, currentUser, editingUser }: UserFormModalProps) {
  const { data: allUsers = [] } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    level: "",
    managerId: "",
    teamId: "",
  })

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role,
        level: editingUser.level.toString(),
        managerId: editingUser.managerId || "",
        teamId: editingUser.teamId || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        level: "",
        managerId: "",
        teamId: "",
      })
    }
  }, [editingUser, isOpen])

  const availableLevels = getAvailableLevels(currentUser.level)

  const availableManagers = allUsers.filter(
    (user) => user.level < Number.parseInt(formData.level || "4") && user.id !== editingUser?.id
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          data: {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            level: Number.parseInt(formData.level),
            managerId: formData.managerId && formData.managerId !== "none" ? formData.managerId : null,
            teamId: formData.teamId || null,
          },
        })
      } else {
        await createUserMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          level: Number.parseInt(formData.level),
          managerId: formData.managerId && formData.managerId !== "none" ? formData.managerId : null,
          teamId: formData.teamId || null,
        })
      }
      onClose()
    } catch (error: unknown) {
      console.error("[UserFormModal] Error submitting form:", error)
      const message = error instanceof Error ? error.message : "Error al guardar usuario"
      alert(message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="juan@empresa.com"
              required
              disabled={!!editingUser}
            />
          </div>

          {!editingUser && (
            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
            </div>
          )}

          <div>
            <Label htmlFor="role">Rol *</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Vendedor Senior"
              required
            />
          </div>

          <div>
            <Label htmlFor="level">Nivel *</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value, managerId: "" })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Nivel {level} - {level === 2 ? "Director/Gerente" : level === 3 ? "Senior" : "Junior"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="manager">Gerente</Label>
            <Select
              value={formData.managerId || "none"}
              onValueChange={(value) => setFormData({ ...formData, managerId: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar gerente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin gerente</SelectItem>
                {availableManagers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - Nivel {user.level} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="teamId">ID del Equipo (opcional)</Label>
            <Input
              id="teamId"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              placeholder="UUID del equipo"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {createUserMutation.isPending || updateUserMutation.isPending
                ? "Guardando..."
                : editingUser
                  ? "Actualizar"
                  : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
