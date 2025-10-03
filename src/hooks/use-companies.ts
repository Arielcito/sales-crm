"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Company } from "@/lib/types"

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies")
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al obtener empresas")
      return json.data as Company[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<Company, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al crear empresa")
      return json.data as Company
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al actualizar empresa")
      return json.data as Company
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error?.message || "Error al eliminar empresa")
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}
