import { db } from "@/lib/db"
import { dealStages } from "@/lib/db/schema"
import { eq, or, isNull } from "drizzle-orm"
import type { DealStage, User } from "@/lib/types"

export async function getAllDealStages(): Promise<DealStage[]> {
  console.log("[deal-stage.service] Fetching all deal stages")

  const result = await db.select().from(dealStages).orderBy(dealStages.order)

  console.log("[deal-stage.service] Found deal stages:", result.length)

  return result.map(stage => ({
    id: stage.id,
    name: stage.name,
    order: stage.order,
    color: stage.color,
    isDefault: stage.isDefault,
    isActive: stage.isActive,
    createdBy: stage.createdBy || undefined,
    companyOwnerId: stage.companyOwnerId || undefined,
    createdAt: stage.createdAt,
    updatedAt: stage.updatedAt,
  }))
}

export async function getDealStagesByUser(currentUser: User): Promise<DealStage[]> {
  console.log("[deal-stage.service] Fetching deal stages for user level:", currentUser.level)

  if (currentUser.level === 1) {
    const result = await db.select().from(dealStages)
      .where(
        or(
          eq(dealStages.companyOwnerId, currentUser.id),
          isNull(dealStages.companyOwnerId)
        )
      )
      .orderBy(dealStages.order)

    return result.map(stage => ({
      id: stage.id,
      name: stage.name,
      order: stage.order,
      color: stage.color,
      isDefault: stage.isDefault,
      isActive: stage.isActive,
      createdBy: stage.createdBy || undefined,
      companyOwnerId: stage.companyOwnerId || undefined,
      createdAt: stage.createdAt,
      updatedAt: stage.updatedAt,
    }))
  }

  const result = await db.select().from(dealStages)
    .where(isNull(dealStages.companyOwnerId))
    .orderBy(dealStages.order)

  console.log("[deal-stage.service] Found global deal stages:", result.length)

  return result.map(stage => ({
    id: stage.id,
    name: stage.name,
    order: stage.order,
    color: stage.color,
    isDefault: stage.isDefault,
    isActive: stage.isActive,
    createdBy: stage.createdBy || undefined,
    companyOwnerId: stage.companyOwnerId || undefined,
    createdAt: stage.createdAt,
    updatedAt: stage.updatedAt,
  }))
}

export async function getDealStageById(id: string): Promise<DealStage | null> {
  console.log("[deal-stage.service] Fetching deal stage by id:", id)

  const result = await db.select().from(dealStages).where(eq(dealStages.id, id)).limit(1)

  if (result.length === 0) {
    console.log("[deal-stage.service] Deal stage not found")
    return null
  }

  const stage = result[0]

  return {
    id: stage.id,
    name: stage.name,
    order: stage.order,
    color: stage.color,
    isDefault: stage.isDefault,
    isActive: stage.isActive,
    createdBy: stage.createdBy || undefined,
    companyOwnerId: stage.companyOwnerId || undefined,
    createdAt: stage.createdAt,
    updatedAt: stage.updatedAt,
  }
}


