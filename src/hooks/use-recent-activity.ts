"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { Contact, Deal } from "@/lib/types"

export function useRecentContacts(limit: number = 5) {
  return useQuery({
    queryKey: ["contacts", "recent", limit],
    queryFn: async () => {
      const contacts = await apiClient<Contact[]>("/api/contacts")
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
      const deals = await apiClient<Deal[]>("/api/deals")
      return deals
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
    },
    staleTime: 1000 * 60 * 5,
  })
}
