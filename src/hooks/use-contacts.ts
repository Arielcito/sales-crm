"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Contact } from "@/lib/types"

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener contactos")
      return json.data as Contact[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al crear contacto")
      return json.data as Contact
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
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al actualizar contacto")
      return json.data as Contact
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
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al eliminar contacto")
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}
