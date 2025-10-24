"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { Team } from "@/lib/types"

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      return await apiClient<Team[]>("/api/teams")
    },
    staleTime: 1000 * 60 * 5,
  })
}
