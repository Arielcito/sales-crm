"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Contact } from "@/lib/types"
import { apiClient } from "@/lib/api/client"

interface CreateContactPayload {
  name: string
  email?: string
  phone?: string
  position?: string
  status?: string
  notes?: string
  companyId: string
  userId?: string
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      return await apiClient<Contact[]>("/api/contacts")
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateContactPayload) => {
      return await apiClient<Contact>("/api/contacts", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      return await apiClient<Contact>(`/api/contacts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient<void>(`/api/contacts/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}
