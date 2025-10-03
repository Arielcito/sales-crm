"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Pencil, Trash2, Shield } from "lucide-react"
import { NewUserModal } from "@/components/new-user-modal"
import { EditUserModal } from "@/components/edit-user-modal"
import type { User } from "@/lib/types"
import { useUsers } from "@/hooks/use-users"

interface UserHierarchyProps {
  currentUser: User
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-chart-1 text-chart-1-foreground",
  2: "bg-chart-2 text-chart-2-foreground",
  3: "bg-chart-3 text-chart-3-foreground",
  4: "bg-chart-4 text-chart-4-foreground",
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Ejecutivo",
  2: "Director",
  3: "Senior",
  4: "Junior",
}

export function UserHierarchy({ currentUser }: UserHierarchyProps) {
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const { data: allUsers = [], isLoading } = useUsers()

  if (currentUser.level !== 1) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta sección. Solo los usuarios de Nivel 1 pueden gestionar usuarios.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando usuarios...</div>
  }

  const handleEditUser = (user: User) => {
    setUserToEdit(user)
    setIsEditUserModalOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert("No puedes eliminar tu propio usuario")
      return
    }

    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      // In production, this would call an API
      console.log("[v0] Deleting user:", userId)
      alert("Usuario eliminado (demo)")
    }
  }

  const renderUserCard = (user: User) => {
    const isCurrentUser = user.id === currentUser.id
    const directReports = allUsers.filter((u) => u.managerId === user.id)

    return (
      <Card key={user.id} className={`${isCurrentUser ? "ring-2 ring-primary" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{user.name}</h3>
                  {isCurrentUser && <Badge variant="outline">Tú</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{user.role}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={LEVEL_COLORS[user.level]}>Nivel {user.level}</Badge>

              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                <Pencil className="w-4 h-4" />
              </Button>

              {!isCurrentUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Gerente:</span>
                <span className="ml-2 font-medium">
                  {user.managerId ? allUsers.find((u) => u.id === user.managerId)?.name || "Desconocido" : "Ninguno"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Reportes Directos:</span>
                <span className="ml-2 font-medium">{directReports.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Equipo:</span>
                <span className="ml-2 font-medium">{user.teamId || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <span className="ml-2 font-medium">{LEVEL_LABELS[user.level]}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Crear, editar y eliminar usuarios del sistema</p>
        </div>
        <Button onClick={() => setIsNewUserModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">{allUsers.map((user) => renderUserCard(user))}</div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permisos por Nivel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Nivel</th>
                  <th className="text-left p-2">Tipo de Rol</th>
                  <th className="text-left p-2">Puede Ver</th>
                  <th className="text-left p-2">Puede Editar</th>
                  <th className="text-left p-2">Puede Gestionar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-2">
                    <Badge className={LEVEL_COLORS[1]}>Nivel 1</Badge>
                  </td>
                  <td className="p-2">CEO/Ejecutivo</td>
                  <td className="p-2">Todos los negocios, todos los usuarios</td>
                  <td className="p-2">Todos los negocios, todos los usuarios</td>
                  <td className="p-2">Control total del sistema</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-2">
                    <Badge className={LEVEL_COLORS[2]}>Nivel 2</Badge>
                  </td>
                  <td className="p-2">Director/Gerente</td>
                  <td className="p-2">Negocios del equipo, reportes directos e indirectos</td>
                  <td className="p-2">Negocios del equipo, reportes directos</td>
                  <td className="p-2">Gestión de equipo</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-2">
                    <Badge className={LEVEL_COLORS[3]}>Nivel 3</Badge>
                  </td>
                  <td className="p-2">Representante Senior</td>
                  <td className="p-2">Negocios propios, reportes directos</td>
                  <td className="p-2">Negocios propios, reportes directos</td>
                  <td className="p-2">Solo reportes directos</td>
                </tr>
                <tr>
                  <td className="p-2">
                    <Badge className={LEVEL_COLORS[4]}>Nivel 4</Badge>
                  </td>
                  <td className="p-2">Representante Junior</td>
                  <td className="p-2">Solo negocios propios</td>
                  <td className="p-2">Solo negocios propios</td>
                  <td className="p-2">Sin derechos de gestión</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <NewUserModal isOpen={isNewUserModalOpen} onClose={() => setIsNewUserModalOpen(false)} allUsers={allUsers} />

      {userToEdit && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false)
            setUserToEdit(null)
          }}
          user={userToEdit}
          allUsers={allUsers}
        />
      )}
    </div>
  )
}
