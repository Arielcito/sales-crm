"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getDeals, getDealById, createDeal, updateDeal, deleteDeal } from "@/lib/api/deals"
import type { CreateDealInput, UpdateDealInput } from "@/lib/schemas/deal"
import type { Deal } from "@/lib/types"

export function useDeals(userId?: string, teamId?: string) {
  return useQuery({
    queryKey: ["deals", userId, teamId],
    queryFn: () => getDeals(userId, teamId),
    staleTime: 1000 * 60,
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: () => getDealById(id),
    enabled: !!id,
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDealInput) => createDeal(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["deals"] })
      await queryClient.refetchQueries({ queryKey: ["deals"] })
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealInput }) => updateDeal(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["deals"] })
      await queryClient.cancelQueries({ queryKey: ["deals", id] })

      const previousDeals = queryClient.getQueryData<Deal[]>(["deals"])
      const previousDeal = queryClient.getQueryData<Deal>(["deals", id])

      if (previousDeals) {
        queryClient.setQueryData<Deal[]>(["deals"], (old = []) =>
          old.map((deal) =>
            deal.id === id ? { ...deal, ...data } : deal
          )
        )
      }

      if (previousDeal) {
        queryClient.setQueryData<Deal>(["deals", id], { ...previousDeal, ...data })
      }

      return { previousDeals, previousDeal }
    },
    onError: (err, { id }, context) => {
      console.error("[useUpdateDeal] Error updating deal:", err)
      toast.error("Error al actualizar el negocio", {
        description: "No se pudo guardar los cambios. Por favor, intenta nuevamente."
      })
      if (context?.previousDeals) {
        queryClient.setQueryData(["deals"], context.previousDeals)
      }
      if (context?.previousDeal) {
        queryClient.setQueryData(["deals", id], context.previousDeal)
      }
    },
    onSuccess: (updatedDeal: Deal, { data }) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["deals", updatedDeal.id] })
      queryClient.invalidateQueries({ queryKey: ["deal-history", updatedDeal.id] })

      if (data.stageId) {
        toast.success("Negocio actualizado", {
          description: "El negocio se movió exitosamente a la nueva etapa."
        })
      }
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onMutate: async (id: string) => {
      console.log("[useDeleteDeal] Optimistically removing deal:", id)
      await queryClient.cancelQueries({ queryKey: ["deals"] })

      const previousDeals = queryClient.getQueryData<Deal[]>(["deals"])

      if (previousDeals) {
        queryClient.setQueryData<Deal[]>(["deals"], (old = []) =>
          old.filter((deal) => deal.id !== id)
        )
      }

      return { previousDeals }
    },
    onError: (err, id, context) => {
      console.error("[useDeleteDeal] Error deleting deal:", err)
      toast.error("Error al eliminar negociación", {
        description: "No se pudo eliminar la negociación. Por favor, intenta nuevamente."
      })
      if (context?.previousDeals) {
        queryClient.setQueryData(["deals"], context.previousDeals)
      }
    },
    onSuccess: (_, id) => {
      console.log("[useDeleteDeal] Deal deleted successfully:", id)
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      toast.success("Negociación eliminada", {
        description: "La negociación se eliminó exitosamente."
      })
    },
  })
}
