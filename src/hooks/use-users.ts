"use client"

import { useQuery } from "@tanstack/react-query"
import type { User } from "@/lib/types"
import { apiClient } from "@/lib/api/client"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await apiClient<User[]>("/api/users")
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useVisibleUsers(currentUser: User) {
  return useQuery({
    queryKey: ["visible-users", currentUser.id, currentUser.level],
    queryFn: async () => {
      return await apiClient<User[]>("/api/users/by-level")
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!currentUser,
  })
}
