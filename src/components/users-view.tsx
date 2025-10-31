"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserFormModal } from "@/components/user-form-modal"
import { createUsersColumns } from "@/components/users-table-columns"
import { useDeleteUser, useUsers } from "@/hooks/use-users"
import { useTeams } from "@/hooks/use-teams"
import { OrgChart } from "@/components/users/org-chart"
import { NewTeamModal } from "@/components/new-team-modal"
import type { User } from "@/lib/types"

interface UsersViewProps {
  currentUser: User
}

export function UsersView({ currentUser }: UsersViewProps) {
  const { data: users = [], isLoading } = useUsers()
  const { data: teams = [] } = useTeams()
  const deleteUserMutation = useDeleteUser()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [prefilledManagerId, setPrefilledManagerId] = useState<string | undefined>()
  const [prefilledTeamId, setPrefilledTeamId] = useState<string | undefined>()

  const filteredUsers = useMemo(() => {
    return users.filter((user) => !user.id.includes("banned"))
  }, [users])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowFormModal(true)
  }

  const handleDelete = async (user: User) => {
    try {
      await deleteUserMutation.mutateAsync(user.id)
      setDeletingUser(null)
    } catch (error: unknown) {
      console.error("[UsersView] Error deleting user:", error)
      const message = error instanceof Error ? error.message : "Error al eliminar usuario"
      alert(message)
      setDeletingUser(null)
    }
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingUser(null)
    setPrefilledManagerId(undefined)
    setPrefilledTeamId(undefined)
  }

  const handleCreateUser = (managerId?: string, teamId?: string) => {
    setPrefilledManagerId(managerId)
    setPrefilledTeamId(teamId)
    setShowFormModal(true)
  }

  const columns = useMemo(
    () => createUsersColumns(currentUser, handleEdit, (user) => setDeletingUser(user), users, teams),
    [currentUser, users, teams]
  )

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios del sistema (nivel {currentUser.level})
          </p>
        </div>
        <Button onClick={() => setShowFormModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Crear Usuario
        </Button>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table">Tabla</TabsTrigger>
          <TabsTrigger value="orgchart">Organigrama</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <DataTable columns={columns} data={filteredUsers} searchKey="name" searchPlaceholder="Buscar por nombre..." />
        </TabsContent>

        <TabsContent value="orgchart" className="mt-6">
          <OrgChart
            users={filteredUsers}
            teams={teams}
            currentUser={currentUser}
            onCreateUser={handleCreateUser}
            onEditUser={handleEdit}
            onCreateTeam={() => setShowTeamModal(true)}
          />
        </TabsContent>
      </Tabs>

      {showFormModal && (
        <UserFormModal
          isOpen={showFormModal}
          onClose={handleCloseModal}
          currentUser={currentUser}
          editingUser={editingUser}
          prefilledManagerId={prefilledManagerId}
          prefilledTeamId={prefilledTeamId}
        />
      )}

      {showTeamModal && (
        <NewTeamModal
          isOpen={showTeamModal}
          onClose={() => setShowTeamModal(false)}
          currentUser={currentUser}
        />
      )}

      {deletingUser && (
        <AlertDialog open onOpenChange={() => setDeletingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar al usuario &quot;{deletingUser.name}&quot;? Esta acción marcará al usuario
                como inhabilitado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(deletingUser)}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
