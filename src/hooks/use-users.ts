"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { CreateUserInput, UpdateUserInput } from "@/lib/schemas/user"
import type { User } from "@/lib/types"

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

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      console.log("[useCreateUser] Creating user")
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || "Error al crear usuario")
      }

      return result.data as User
    },
    onSuccess: () => {
      console.log("[useCreateUser] User created, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["visible-users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      console.log("[useUpdateUser] Updating user:", id)
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || "Error al actualizar usuario")
      }

      return result.data as User
    },
    onSuccess: () => {
      console.log("[useUpdateUser] User updated, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["visible-users"] })
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[useDeleteUser] Deleting user:", id)
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || "Error al eliminar usuario")
      }

      return result.data
    },
    onSuccess: () => {
      console.log("[useDeleteUser] User deleted, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["visible-users"] })
    },
  })
}
