"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { DealStage } from "@/lib/types"
import { apiClient } from "@/lib/api/client"
import type { CreateDealStageInput, UpdateDealStageInput } from "@/lib/schemas/deal-stage"

export function useDealStages() {
  return useQuery({
    queryKey: ["deal-stages"],
    queryFn: async () => {
      return await apiClient<DealStage[]>("/api/deal-stages")
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateDealStageInput) => {
      console.log("[useCreateStage] Creating stage with data:", data)
      const response = await fetch("/api/deal-stages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Error al crear etapa")
      }

      return result.data as DealStage
    },
    onSuccess: () => {
      console.log("[useCreateStage] Stage created successfully, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["deal-stages"] })
    },
    onError: (error) => {
      console.error("[useCreateStage] Error creating stage:", error)
    },
  })
}

export function useUpdateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDealStageInput }) => {
      console.log("[useUpdateStage] Updating stage:", id, data)
      const response = await fetch(`/api/deal-stages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Error al actualizar etapa")
      }

      return result.data as DealStage
    },
    onSuccess: () => {
      console.log("[useUpdateStage] Stage updated successfully, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["deal-stages"] })
    },
    onError: (error) => {
      console.error("[useUpdateStage] Error updating stage:", error)
    },
  })
}

export function useToggleStageActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      console.log("[useToggleStageActive] Toggling stage active:", id, isActive)
      const response = await fetch(`/api/deal-stages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Error al cambiar estado de etapa")
      }

      return result.data as DealStage
    },
    onSuccess: () => {
      console.log("[useToggleStageActive] Stage active toggled successfully, invalidating queries")
      queryClient.invalidateQueries({ queryKey: ["deal-stages"] })
    },
    onError: (error) => {
      console.error("[useToggleStageActive] Error toggling stage active:", error)
    },
  })
}
