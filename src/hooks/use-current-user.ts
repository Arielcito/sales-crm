"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import type { User } from "@/lib/types"

export function useCurrentUser() {
  const { data: session, isPending: sessionPending } = useSession()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["current-user", session?.user?.id],
    queryFn: async () => {
      console.log("[useCurrentUser] Fetching current user data")
      const response = await fetch(`/api/users/${session?.user?.id}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || "Error al obtener usuario")
      }

      return result.data as User
    },
    enabled: !!session?.user?.id && !sessionPending,
  })

  return {
    data: user,
    isLoading: sessionPending || isLoading,
    error: error,
  }
}
