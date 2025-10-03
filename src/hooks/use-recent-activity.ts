"use client"

import { useQuery } from "@tanstack/react-query"
import type { Contact, Deal } from "@/lib/types"

export function useRecentContacts(limit: number = 5) {
  return useQuery({
    queryKey: ["contacts", "recent", limit],
    queryFn: async () => {
      const response = await fetch("/api/contacts")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener contactos")
      const contacts = json.data as Contact[]
      return contacts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecentDeals(limit: number = 5) {
  return useQuery({
    queryKey: ["deals", "recent", limit],
    queryFn: async () => {
      const response = await fetch("/api/deals")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener negocios")
      const deals = json.data as Deal[]
      return deals
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
    },
    staleTime: 1000 * 60 * 5,
  })
}
