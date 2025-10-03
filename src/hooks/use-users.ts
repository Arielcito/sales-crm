"use client"

import { useQuery } from "@tanstack/react-query"
import type { User } from "@/lib/types"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener usuarios")
      return json.data as User[]
    },
    staleTime: 1000 * 60 * 5,
  })
}
