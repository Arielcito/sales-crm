"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api/client"
import type { ContactAccessRequest } from "@/lib/types"

type RequestFilters = {
  status?: string
}

export function useContactRequests(filters?: RequestFilters) {
  return useQuery({
    queryKey: ["contact-requests", filters],
    queryFn: async () => {
      const response = await apiClient<ContactAccessRequest[]>(
        "/api/contact-requests"
      )
      return response
    },
    staleTime: 1000 * 30,
    select: (data) => {
      if (!filters) return data

      return data.filter((request) => {
        const matchesStatus = !filters.status || request.status === filters.status
        return matchesStatus
      })
    },
  })
}

export function useApproveContactRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ContactAccessRequest>(
        `/api/contact-requests/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ action: "approve" }),
        }
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      toast.success("Solicitud aprobada", {
        description: "Acceso a contacto concedido exitosamente"
      })
    },
    onError: () => {
      toast.error("Error", {
        description: "No se pudo aprobar la solicitud"
      })
    },
  })
}

export function useRejectContactRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ContactAccessRequest>(
        `/api/contact-requests/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ action: "reject" }),
        }
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-requests"] })
      toast.success("Solicitud rechazada", {
        description: "La solicitud de acceso ha sido rechazada"
      })
    },
    onError: () => {
      toast.error("Error", {
        description: "No se pudo rechazar la solicitud"
      })
    },
  })
}

export function usePendingContactRequestsCount() {
  return useQuery({
    queryKey: ["contact-requests"],
    queryFn: async () => {
      const response = await apiClient<ContactAccessRequest[]>(
        "/api/contact-requests"
      )
      return response
    },
    staleTime: 1000 * 30,
    select: (data) => data.filter((request) => request.status === "pending").length,
  })
}
