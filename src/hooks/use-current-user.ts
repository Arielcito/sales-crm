"use client"

import { useSession } from "@/lib/auth-client"
import type { User } from "@/lib/types"

export function useCurrentUser() {
  const { data: session, isPending, error } = useSession()

  const user: User | undefined = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role || "vendedor",
        level: (session.user as any).level || 4,
        managerId: (session.user as any).managerId,
        teamId: (session.user as any).teamId,
        image: session.user.image || undefined,
      }
    : undefined

  return {
    data: user,
    isLoading: isPending,
    error: error,
  }
}
