"use client"

import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import type { User } from "@/lib/types"

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const session = await authClient.getSession()

      if (!session?.data?.user) {
        throw new Error("No session found")
      }

      const sessionUser = session.data.user

      const user: User = {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: (sessionUser as any).role || "vendedor",
        level: (sessionUser as any).level || 4,
        managerId: (sessionUser as any).managerId,
        teamId: (sessionUser as any).teamId,
        image: sessionUser.image || undefined,
      }

      return user
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
