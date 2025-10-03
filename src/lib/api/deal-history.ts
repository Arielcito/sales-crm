import { apiClient } from "./client"

export interface DealHistoryItem {
  id: string
  dealId: string
  userId: string
  fromStageId?: string | null
  toStageId?: string | null
  changeType: string
  fieldName?: string | null
  oldValue?: string | null
  newValue?: string | null
  notes?: string | null
  createdAt: Date
  userName?: string | null
}

export async function getDealHistory(dealId: string): Promise<DealHistoryItem[]> {
  return apiClient<DealHistoryItem[]>(`/api/deals/${dealId}/history`)
}
