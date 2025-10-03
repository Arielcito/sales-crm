"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/lib/types"

interface NewUserModalProps {
  isOpen: boolean
  onClose: () => void
  allUsers: User[]
}

export function NewUserModal({ isOpen, onClose, allUsers }: NewUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    level: "4",
    manager_id: "0", // Updated default value to be a non-empty string
    team_id: "1",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In production, this would call an API
    console.log("[v0] Creating new user:", formData)
    alert("Usuario creado exitosamente (demo)")

    onClose()
    setFormData({
      name: "",
      email: "",
      role: "",
      level: "4",
      manager_id: "0", // Updated default value to be a non-empty string
      team_id: "1",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="juan@empresa.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Rol</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Sales Representative"
              required
            />
          </div>

          <div>
            <Label htmlFor="level">Nivel</Label>
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
            <Label htmlFor="manager">Gerente</Label>
            <Select
              value={formData.manager_id}
              onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar gerente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sin gerente</SelectItem> {/* Updated value prop to be a non-empty string */}
                {allUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - Nivel {user.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="team">ID del Equipo</Label>
            <Input
              id="team"
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              placeholder="1"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear Usuario
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
