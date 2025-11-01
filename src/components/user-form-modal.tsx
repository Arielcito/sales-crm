"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateUser, useUpdateUser, useUsers } from "@/hooks/use-users"
import { useTeams } from "@/hooks/use-teams"
import type { User } from "@/lib/types"
import { getAvailableLevels } from "@/lib/utils"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  editingUser?: User | null
  prefilledManagerId?: string
  prefilledTeamId?: string
}

export function UserFormModal({ isOpen, onClose, currentUser, editingUser, prefilledManagerId, prefilledTeamId }: UserFormModalProps) {
  const { data: allUsers = [] } = useUsers()
  const { data: teams = [] } = useTeams()
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
        managerId: prefilledManagerId || "",
        teamId: prefilledTeamId || "",
      })
    }
  }, [editingUser, isOpen, prefilledManagerId, prefilledTeamId])

  const availableLevels = getAvailableLevels(currentUser.level)
  const selectedLevel = Number.parseInt(formData.level || "4")

  const availableManagers = allUsers.filter((user) => {
    if (user.id === editingUser?.id) return false

    if (selectedLevel === 4) {
      if (!formData.teamId) return false
      return (user.level === 2 || user.level === 3) && user.teamId === formData.teamId
    }

    if (selectedLevel === 3) {
      if (!formData.teamId) return false
      return user.level === 2 && user.teamId === formData.teamId
    }

    return false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedLevel = Number.parseInt(formData.level)
    const managerId = formData.managerId && formData.managerId !== "none" ? formData.managerId : null
    const teamId = formData.teamId && formData.teamId !== "none" ? formData.teamId : null

    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          data: {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            level: parsedLevel,
            managerId,
            teamId,
          },
        })
      } else {
        await createUserMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          level: parsedLevel,
          managerId,
          teamId,
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
              onValueChange={(value) => setFormData({ ...formData, level: value, managerId: "", teamId: "" })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Nivel {level} - {level === 2 ? "Líder de Equipo" : level === 3 ? "Senior" : "Junior"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLevel !== 1 && (selectedLevel === 2 || formData.level) && (
            <div>
              <Label htmlFor="teamId">
                Equipo {(selectedLevel === 3 || selectedLevel === 4) && "*"}
              </Label>
              <Select
                value={formData.teamId || "none"}
                onValueChange={(value) => setFormData({ ...formData, teamId: value === "none" ? "" : value, managerId: "" })}
                required={selectedLevel === 3 || selectedLevel === 4}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedLevel === 2 ? "Seleccionar equipo (opcional)" : "Seleccionar equipo *"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedLevel === 2 && <SelectItem value="none">Sin equipo</SelectItem>}
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(selectedLevel === 3 || selectedLevel === 4) && formData.teamId && (
            <div>
              <Label htmlFor="manager">
                {selectedLevel === 3 ? "Líder de Equipo (Nivel 2) *" : "Manager Directo (Nivel 2 o 3) *"}
              </Label>
              <Select
                value={formData.managerId || "none"}
                onValueChange={(value) => setFormData({ ...formData, managerId: value === "none" ? "" : value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedLevel === 3 ? "Seleccionar líder de equipo *" : "Seleccionar manager *"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Seleccionar {selectedLevel === 3 ? "líder" : "manager"}</SelectItem>
                  {availableManagers.length === 0 && (
                    <SelectItem value="no-leaders" disabled>
                      {selectedLevel === 3 ? "No hay líderes nivel 2 en este equipo" : "No hay managers disponibles en este equipo"}
                    </SelectItem>
                  )}
                  {availableManagers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - Nivel {user.level} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
