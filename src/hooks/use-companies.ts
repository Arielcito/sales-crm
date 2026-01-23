"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Company } from "@/lib/types"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"

interface CreateCompanyPayload {
  name: string
  industry?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  employeeCount?: number
  notes?: string
  createdBy?: string
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      return await apiClient<Company[]>("/api/companies")
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCompanyPayload) => {
      return await apiClient<Company>("/api/companies", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
    onSuccess: async () => {
      toast.success("Empresa creada exitosamente")
      await queryClient.invalidateQueries({ queryKey: ["companies"] })
      await queryClient.refetchQueries({ queryKey: ["companies"] })
    },
    onError: (error: any) => {
      console.error("[useCreateCompany] Error:", error)
      const message = error?.message || "Error al crear empresa"
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

export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
      return await apiClient<Company>(`/api/companies/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["companies"] })

      const previousCompanies = queryClient.getQueryData<Company[]>(["companies"])

      queryClient.setQueryData<Company[]>(["companies"], (old) => {
        if (!old) return old
        return old.map((company) =>
          company.id === id ? { ...company, ...data } : company
        )
      })

      return { previousCompanies }
    },
    onError: (error: any, _variables, context) => {
      console.error("[useUpdateCompany] Error:", error)
      const message = error?.message || "Error al actualizar empresa"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }

      if (context?.previousCompanies) {
        queryClient.setQueryData(["companies"], context.previousCompanies)
      }
    },
    onSuccess: () => {
      toast.success("Empresa actualizada exitosamente")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient<void>(`/api/companies/${id}`, {
        method: "DELETE",
      })
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["companies"] })

      const previousCompanies = queryClient.getQueryData<Company[]>(["companies"])

      queryClient.setQueryData<Company[]>(["companies"], (old) => {
        if (!old) return old
        return old.filter((company) => company.id !== id)
      })

      return { previousCompanies }
    },
    onError: (error: any, _id, context) => {
      console.error("[useDeleteCompany] Error:", error)
      const message = error?.message || "Error al eliminar empresa"
      const details = error?.details || []

      if (details.length > 0) {
        toast.error(message, {
          description: details.join("\n"),
        })
      } else {
        toast.error(message)
      }

      if (context?.previousCompanies) {
        queryClient.setQueryData(["companies"], context.previousCompanies)
      }
    },
    onSuccess: () => {
      toast.success("Empresa eliminada exitosamente")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })
}
