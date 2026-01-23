"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Contact, ApiError } from "@/lib/types"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"

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
    onSuccess: async () => {
      toast.success("Contacto creado exitosamente")
      await queryClient.invalidateQueries({ queryKey: ["contacts"] })
      await queryClient.refetchQueries({ queryKey: ["contacts"] })
    },
    onError: (error: ApiError) => {
      console.error("[useCreateContact] Error:", error)
      const message = error?.message || "Error al crear contacto"
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

export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      return await apiClient<Contact>(`/api/contacts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["contacts"] })

      const previousContacts = queryClient.getQueryData<Contact[]>(["contacts"])

      queryClient.setQueryData<Contact[]>(["contacts"], (old) => {
        if (!old) return old
        return old.map((contact) =>
          contact.id === id ? { ...contact, ...data } : contact
        )
      })

      return { previousContacts }
    },
    onError: (error: ApiError, _variables, context) => {
      console.error("[useUpdateContact] Error:", error)
      const message = error?.message || "Error al actualizar contacto"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }

      if (context?.previousContacts) {
        queryClient.setQueryData(["contacts"], context.previousContacts)
      }
    },
    onSuccess: () => {
      toast.success("Contacto actualizado exitosamente")
    },
    onSettled: () => {
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["contacts"] })

      const previousContacts = queryClient.getQueryData<Contact[]>(["contacts"])

      queryClient.setQueryData<Contact[]>(["contacts"], (old) => {
        if (!old) return old
        return old.filter((contact) => contact.id !== id)
      })

      return { previousContacts }
    },
    onError: (error: ApiError, _id, context) => {
      console.error("[useDeleteContact] Error:", error)
      const message = error?.message || "Error al eliminar contacto"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }

      if (context?.previousContacts) {
        queryClient.setQueryData(["contacts"], context.previousContacts)
      }
    },
    onSuccess: () => {
      toast.success("Contacto eliminado exitosamente")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}
