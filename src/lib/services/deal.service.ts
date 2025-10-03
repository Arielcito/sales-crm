import { db } from "@/lib/db"
import { deals, dealStages } from "@/lib/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import type { Deal } from "@/lib/types"

interface GetDealsParams {
  userId?: string
  userIds?: string[]
}

export async function getAllDeals(params?: GetDealsParams): Promise<Deal[]> {
  console.log("[deal.service] Fetching deals with params:", params)

  let query = db.select().from(deals).$dynamic()

  if (params?.userId) {
    query = query.where(eq(deals.userId, params.userId))
  } else if (params?.userIds && params.userIds.length > 0) {
    query = query.where(inArray(deals.userId, params.userIds))
  }

  const result = await query

  console.log("[deal.service] Found deals:", result.length)

  return result.map(deal => ({
    id: deal.id,
    userId: deal.userId,
    contactId: deal.contactId || undefined,
    companyId: deal.companyId || undefined,
    title: deal.title,
    currency: deal.currency,
    amountUsd: deal.amountUsd ? parseFloat(deal.amountUsd) : undefined,
    amountArs: deal.amountArs ? parseFloat(deal.amountArs) : undefined,
    exchangeRateId: deal.exchangeRateId || undefined,
    stageId: deal.stageId,
    probability: deal.probability || undefined,
    expectedCloseDate: deal.expectedCloseDate || undefined,
    closedAt: deal.closedAt || undefined,
    lostReason: deal.lostReason || undefined,
    notes: deal.notes || undefined,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  }))
}

export async function getDealById(id: string): Promise<Deal | null> {
  console.log("[deal.service] Fetching deal by id:", id)

  const result = await db.select().from(deals).where(eq(deals.id, id)).limit(1)

  if (result.length === 0) {
    console.log("[deal.service] Deal not found")
    return null
  }

  const deal = result[0]

  return {
    id: deal.id,
    userId: deal.userId,
    contactId: deal.contactId || undefined,
    companyId: deal.companyId || undefined,
    title: deal.title,
    currency: deal.currency,
    amountUsd: deal.amountUsd ? parseFloat(deal.amountUsd) : undefined,
    amountArs: deal.amountArs ? parseFloat(deal.amountArs) : undefined,
    exchangeRateId: deal.exchangeRateId || undefined,
    stageId: deal.stageId,
    probability: deal.probability || undefined,
    expectedCloseDate: deal.expectedCloseDate || undefined,
    closedAt: deal.closedAt || undefined,
    lostReason: deal.lostReason || undefined,
    notes: deal.notes || undefined,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  }
}

interface CreateDealData {
  userId: string
  contactId?: string
  companyId?: string
  title: string
  currency: string
  amountUsd?: number
  amountArs?: number
  exchangeRateId?: string
  stageId: string
  probability?: number
  expectedCloseDate?: Date
  notes?: string
}

export async function createDeal(data: CreateDealData): Promise<Deal> {
  console.log("[deal.service] Creating deal:", data.title)

  const result = await db.insert(deals).values({
    userId: data.userId,
    contactId: data.contactId || null,
    companyId: data.companyId || null,
    title: data.title,
    currency: data.currency,
    amountUsd: data.amountUsd?.toString() || null,
    amountArs: data.amountArs?.toString() || null,
    exchangeRateId: data.exchangeRateId || null,
    stageId: data.stageId,
    probability: data.probability || 0,
    expectedCloseDate: data.expectedCloseDate || null,
    notes: data.notes || null,
  }).returning()

  const deal = result[0]

  console.log("[deal.service] Deal created:", deal.id)

  return {
    id: deal.id,
    userId: deal.userId,
    contactId: deal.contactId || undefined,
    companyId: deal.companyId || undefined,
    title: deal.title,
    currency: deal.currency,
    amountUsd: deal.amountUsd ? parseFloat(deal.amountUsd) : undefined,
    amountArs: deal.amountArs ? parseFloat(deal.amountArs) : undefined,
    exchangeRateId: deal.exchangeRateId || undefined,
    stageId: deal.stageId,
    probability: deal.probability || undefined,
    expectedCloseDate: deal.expectedCloseDate || undefined,
    closedAt: deal.closedAt || undefined,
    lostReason: deal.lostReason || undefined,
    notes: deal.notes || undefined,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  }
}

interface UpdateDealData {
  title?: string
  currency?: string
  amountUsd?: number
  amountArs?: number
  exchangeRateId?: string
  stageId?: string
  probability?: number
  expectedCloseDate?: Date
  closedAt?: Date
  lostReason?: string
  notes?: string
}

export async function updateDeal(id: string, data: UpdateDealData): Promise<Deal | null> {
  console.log("[deal.service] Updating deal:", id)

  const updateData: any = { updatedAt: new Date() }

  if (data.title !== undefined) updateData.title = data.title
  if (data.currency !== undefined) updateData.currency = data.currency
  if (data.amountUsd !== undefined) updateData.amountUsd = data.amountUsd?.toString() || null
  if (data.amountArs !== undefined) updateData.amountArs = data.amountArs?.toString() || null
  if (data.exchangeRateId !== undefined) updateData.exchangeRateId = data.exchangeRateId || null
  if (data.stageId !== undefined) updateData.stageId = data.stageId
  if (data.probability !== undefined) updateData.probability = data.probability
  if (data.expectedCloseDate !== undefined) updateData.expectedCloseDate = data.expectedCloseDate || null
  if (data.closedAt !== undefined) updateData.closedAt = data.closedAt || null
  if (data.lostReason !== undefined) updateData.lostReason = data.lostReason || null
  if (data.notes !== undefined) updateData.notes = data.notes || null

  const result = await db.update(deals).set(updateData).where(eq(deals.id, id)).returning()

  if (result.length === 0) {
    console.log("[deal.service] Deal not found for update")
    return null
  }

  const deal = result[0]

  console.log("[deal.service] Deal updated:", deal.id)

  return {
    id: deal.id,
    userId: deal.userId,
    contactId: deal.contactId || undefined,
    companyId: deal.companyId || undefined,
    title: deal.title,
    currency: deal.currency,
    amountUsd: deal.amountUsd ? parseFloat(deal.amountUsd) : undefined,
    amountArs: deal.amountArs ? parseFloat(deal.amountArs) : undefined,
    exchangeRateId: deal.exchangeRateId || undefined,
    stageId: deal.stageId,
    probability: deal.probability || undefined,
    expectedCloseDate: deal.expectedCloseDate || undefined,
    closedAt: deal.closedAt || undefined,
    lostReason: deal.lostReason || undefined,
    notes: deal.notes || undefined,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
  }
}

export async function deleteDeal(id: string): Promise<boolean> {
  console.log("[deal.service] Deleting deal:", id)

  const result = await db.delete(deals).where(eq(deals.id, id)).returning()

  console.log("[deal.service] Deal deleted:", result.length > 0)

  return result.length > 0
}

export async function convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount

  return amount
}
