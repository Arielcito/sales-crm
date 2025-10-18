"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api/client"
import type { CompanyRequest } from "@/lib/types"

export function useCompanyRequests() {
  return useQuery({
    queryKey: ["company-requests"],
    queryFn: async () => {
      const response = await apiClient<{ data: CompanyRequest[] }>(
        "/api/companies/requests"
      )
      return response.data
    },
    staleTime: 1000 * 30,
  })
}

export function useApproveCompanyRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<{ data: CompanyRequest }>(
        `/api/companies/requests/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ action: "approve" }),
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-requests"] })
      toast.success("Solicitud aprobada", {
        description: "La solicitud ha sido aprobada exitosamente"
      })
    },
    onError: () => {
      toast.error("Error", {
        description: "No se pudo aprobar la solicitud"
      })
    },
  })
}

export function useRejectCompanyRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<{ data: CompanyRequest }>(
        `/api/companies/requests/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ action: "reject" }),
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-requests"] })
      toast.success("Solicitud rechazada", {
        description: "La solicitud ha sido rechazada"
      })
    },
    onError: () => {
      toast.error("Error", {
        description: "No se pudo rechazar la solicitud"
      })
    },
  })
}
