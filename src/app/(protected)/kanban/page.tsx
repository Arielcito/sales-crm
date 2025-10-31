"use client"

import { KanbanBoard } from "@/components/kanban-board"
import { KanbanSkeleton } from "@/components/kanban-skeleton"
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
    return <KanbanSkeleton />
  }

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">No autorizado</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">  
    <KanbanBoard
      currentUser={currentUser}
      stages={stages}
      companies={companies}
      contacts={contacts}
      users={users}
    />
    </div>
  )
}
