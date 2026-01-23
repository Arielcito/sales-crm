"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { CreateUserInput, UpdateUserInput } from "@/lib/schemas/user"
import type { User, ApiError } from "@/lib/types"
import { toast } from "sonner"

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
        throw result.error
      }

      return result.data as User
    },
    onSuccess: () => {
      console.log("[useCreateUser] User created, invalidating queries")
      toast.success("Usuario creado exitosamente")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["visible-users"] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
    onError: (error: ApiError) => {
      console.error("[useCreateUser] Error:", error)
      const message = error?.message || "Error al crear usuario"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }
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
        throw result.error
      }

      return result.data as User
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] })
      await queryClient.cancelQueries({ queryKey: ["visible-users"] })

      const previousUsers = queryClient.getQueryData<User[]>(["users"])
      const previousVisibleUsers = queryClient.getQueryData<User[]>(["visible-users"])

      queryClient.setQueryData<User[]>(["users"], (old) => {
        if (!old) return old
        return old.map((user) =>
          user.id === id ? { ...user, ...data } : user
        )
      })

      queryClient.setQueryData<User[]>(["visible-users"], (old) => {
        if (!old) return old
        return old.map((user) =>
          user.id === id ? { ...user, ...data } : user
        )
      })

      return { previousUsers, previousVisibleUsers }
    },
    onError: (error: ApiError, _variables, context) => {
      console.error("[useUpdateUser] Error:", error)
      const message = error?.message || "Error al actualizar usuario"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }

      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers)
      }
      if (context?.previousVisibleUsers) {
        queryClient.setQueryData(["visible-users"], context.previousVisibleUsers)
      }
    },
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente")
    },
    onSettled: () => {
      console.log("[useUpdateUser] User updated, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["visible-users"] })
      queryClient.invalidateQueries({ queryKey: ["current-user"] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
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
        throw result.error
      }

      return result.data
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users"] })
      await queryClient.cancelQueries({ queryKey: ["visible-users"] })

      const previousUsers = queryClient.getQueryData<User[]>(["users"])
      const previousVisibleUsers = queryClient.getQueryData<User[]>(["visible-users"])

      queryClient.setQueryData<User[]>(["users"], (old) => {
        if (!old) return old
        return old.filter((user) => user.id !== id)
      })

      queryClient.setQueryData<User[]>(["visible-users"], (old) => {
        if (!old) return old
        return old.filter((user) => user.id !== id)
      })

      return { previousUsers, previousVisibleUsers }
    },
    onError: (error: ApiError, _id, context) => {
      console.error("[useDeleteUser] Error:", error)
      const message = error?.message || "Error al eliminar usuario"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }

      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers)
      }
      if (context?.previousVisibleUsers) {
        queryClient.setQueryData(["visible-users"], context.previousVisibleUsers)
      }
    },
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente")
    },
    onSettled: () => {
      console.log("[useDeleteUser] User deleted, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["visible-users"] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}

export function useReassignUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      managerId,
      teamId,
    }: {
      id: string
      managerId?: string | null
      teamId?: string | null
    }) => {
      console.log("[useReassignUser] Reassigning user:", id)
      const response = await fetch(`/api/users/${id}/reassign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId, teamId }),
      })

      const result = await response.json()

      if (!result.success) {
        throw result.error
      }

      return result.data as User
    },
    onSuccess: () => {
      console.log("[useReassignUser] User reassigned, invalidating queries")
      toast.success("Usuario reasignado exitosamente")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["visible-users"] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
    onError: (error: ApiError) => {
      console.error("[useReassignUser] Error:", error)
      const message = error?.message || "Error al reasignar usuario"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }
    },
  })
}
