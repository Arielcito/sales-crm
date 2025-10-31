"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { Team, User } from "@/lib/types"
import { toast } from "sonner"

export interface TeamLeader {
  id: string
  name: string
  teamId: string | null
  teamName: string | null
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      return await apiClient<Team[]>("/api/teams")
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useTeamLeaders() {
  return useQuery({
    queryKey: ["team-leaders"],
    queryFn: async () => {
      const users = await apiClient<User[]>("/api/users")
      const teams = await apiClient<Team[]>("/api/teams")

      const level2Users = users.filter(u => u.level === 2)

      return level2Users.map(user => ({
        id: user.id,
        name: user.name,
        teamId: user.teamId || null,
        teamName: user.teamId ? (teams.find(t => t.id === user.teamId)?.name || null) : null
      })) as TeamLeader[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Team> }) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Error al actualizar equipo")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Equipo actualizado correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Error al eliminar equipo")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Equipo eliminado correctamente")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
