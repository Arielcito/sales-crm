import { apiClient } from "./client"
import type { Deal } from "@/lib/types"
import type { CreateDealInput, UpdateDealInput } from "@/lib/schemas/deal"

export async function getDeals(userId?: string, teamId?: string): Promise<Deal[]> {
  const params = new URLSearchParams()
  if (userId) params.set("userId", userId)
  if (teamId) params.set("teamId", teamId)

  const url = `/api/deals${params.toString() ? `?${params.toString()}` : ""}`
  return apiClient<Deal[]>(url)
}

export async function getDealById(id: string): Promise<Deal> {
  return apiClient<Deal>(`/api/deals/${id}`)
}

export async function createDeal(data: CreateDealInput): Promise<Deal> {
  return apiClient<Deal>("/api/deals", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateDeal(id: string, data: UpdateDealInput): Promise<Deal> {
  return apiClient<Deal>(`/api/deals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteDeal(id: string): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(`/api/deals/${id}`, {
    method: "DELETE",
  })
}
