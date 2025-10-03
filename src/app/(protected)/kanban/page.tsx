"use client"

import { KanbanBoard } from "@/components/kanban-board"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useDealStages } from "@/hooks/use-deal-stages"
import { useCompanies } from "@/hooks/use-companies"
import { useContacts } from "@/hooks/use-contacts"
import { useUsers } from "@/hooks/use-users"

export default function KanbanPage() {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const { data: stages = [], isLoading: isLoadingStages } = useDealStages()
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies()
  const { data: contacts = [], isLoading: isLoadingContacts } = useContacts()
  const { data: users = [], isLoading: isLoadingUsers } = useUsers()

  const isLoading = isLoadingUser || isLoadingStages || isLoadingCompanies || isLoadingContacts || isLoadingUsers

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">No autorizado</div>
      </div>
    )
  }

  return (
    <KanbanBoard
      currentUser={currentUser}
      stages={stages}
      companies={companies}
      contacts={contacts}
      users={users}
    />
  )
}
