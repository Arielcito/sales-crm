"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getDeals, getDealById, createDeal, updateDeal, deleteDeal } from "@/lib/api/deals"
import type { CreateDealInput, UpdateDealInput } from "@/lib/schemas/deal"
import type { Deal } from "@/lib/types"

export function useDeals(userId?: string) {
  return useQuery({
    queryKey: ["deals", userId],
    queryFn: () => getDeals(userId),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealInput }) => updateDeal(id, data),
    onSuccess: (updatedDeal: Deal) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["deals", updatedDeal.id] })
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
    },
  })
}
