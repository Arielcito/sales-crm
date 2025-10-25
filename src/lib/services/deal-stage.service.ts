import { db } from "@/lib/db"
import { dealStages, deals } from "@/lib/db/schema"
import { eq, or, isNull, and } from "drizzle-orm"
import type { DealStage, User } from "@/lib/types"
import type { CreateDealStageInput, UpdateDealStageInput } from "@/lib/schemas/deal-stage"

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

export async function createDealStage(input: CreateDealStageInput, userId: string): Promise<DealStage> {
  console.log("[deal-stage.service] Creating deal stage:", input)

  const [newStage] = await db.insert(dealStages).values({
    name: input.name,
    order: input.order,
    color: input.color,
    isDefault: input.isDefault,
    isActive: input.isActive,
    createdBy: userId,
    companyOwnerId: input.companyOwnerId,
  }).returning()

  console.log("[deal-stage.service] Deal stage created:", newStage.id)

  return {
    id: newStage.id,
    name: newStage.name,
    order: newStage.order,
    color: newStage.color,
    isDefault: newStage.isDefault,
    isActive: newStage.isActive,
    createdBy: newStage.createdBy || undefined,
    companyOwnerId: newStage.companyOwnerId || undefined,
    createdAt: newStage.createdAt,
    updatedAt: newStage.updatedAt,
  }
}

export async function updateDealStage(id: string, input: UpdateDealStageInput): Promise<DealStage | null> {
  console.log("[deal-stage.service] Updating deal stage:", id, input)

  const [updatedStage] = await db.update(dealStages)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dealStages.id, id))
    .returning()

  if (!updatedStage) {
    console.log("[deal-stage.service] Deal stage not found for update")
    return null
  }

  console.log("[deal-stage.service] Deal stage updated:", updatedStage.id)

  return {
    id: updatedStage.id,
    name: updatedStage.name,
    order: updatedStage.order,
    color: updatedStage.color,
    isDefault: updatedStage.isDefault,
    isActive: updatedStage.isActive,
    createdBy: updatedStage.createdBy || undefined,
    companyOwnerId: updatedStage.companyOwnerId || undefined,
    createdAt: updatedStage.createdAt,
    updatedAt: updatedStage.updatedAt,
  }
}

export async function toggleDealStageActive(id: string, isActive: boolean): Promise<DealStage | null> {
  console.log("[deal-stage.service] Toggling deal stage active:", id, isActive)

  const activeStagesCount = await db.select().from(dealStages).where(eq(dealStages.isActive, true))

  if (!isActive && activeStagesCount.length <= 1) {
    console.log("[deal-stage.service] Cannot deactivate last active stage")
    throw new Error("No se puede inactivar el último stage activo")
  }

  const [updatedStage] = await db.update(dealStages)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(dealStages.id, id))
    .returning()

  if (!updatedStage) {
    console.log("[deal-stage.service] Deal stage not found for toggle")
    return null
  }

  console.log("[deal-stage.service] Deal stage active toggled:", updatedStage.id)

  return {
    id: updatedStage.id,
    name: updatedStage.name,
    order: updatedStage.order,
    color: updatedStage.color,
    isDefault: updatedStage.isDefault,
    isActive: updatedStage.isActive,
    createdBy: updatedStage.createdBy || undefined,
    companyOwnerId: updatedStage.companyOwnerId || undefined,
    createdAt: updatedStage.createdAt,
    updatedAt: updatedStage.updatedAt,
  }
}

export async function getNextStageOrder(): Promise<number> {
  console.log("[deal-stage.service] Getting next stage order")

  const stages = await db.select().from(dealStages).orderBy(dealStages.order)

  if (stages.length === 0) {
    return 0
  }

  const maxOrder = Math.max(...stages.map(s => s.order))
  return maxOrder + 1
}


