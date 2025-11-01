import { db } from "@/lib/db"
import { companyRequests } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import type { CompanyRequest } from "@/lib/types"

export async function getAllCompanyRequests(): Promise<CompanyRequest[]> {
  console.log("[company-request.service] Fetching all company requests")

  const result = await db.select().from(companyRequests).orderBy(desc(companyRequests.createdAt))

  console.log("[company-request.service] Found company requests:", result.length)

  return result.map(request => ({
    id: request.id,
    requestedBy: request.requestedBy,
    companyId: request.companyId || undefined,
    companyName: request.companyName,
    email: request.email || undefined,
    phone: request.phone || undefined,
    website: request.website || undefined,
    industry: request.industry || undefined,
    notes: request.notes || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }))
}

export async function getPendingCompanyRequests(): Promise<CompanyRequest[]> {
  console.log("[company-request.service] Fetching pending company requests")

  const result = await db.select()
    .from(companyRequests)
    .where(eq(companyRequests.status, "pending"))
    .orderBy(desc(companyRequests.createdAt))

  console.log("[company-request.service] Found pending requests:", result.length)

  return result.map(request => ({
    id: request.id,
    requestedBy: request.requestedBy,
    companyId: request.companyId || undefined,
    companyName: request.companyName,
    email: request.email || undefined,
    phone: request.phone || undefined,
    website: request.website || undefined,
    industry: request.industry || undefined,
    notes: request.notes || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }))
}

export async function getCompanyRequestById(id: string): Promise<CompanyRequest | null> {
  console.log("[company-request.service] Fetching company request by id:", id)

  const result = await db.select().from(companyRequests).where(eq(companyRequests.id, id)).limit(1)

  if (result.length === 0) {
    console.log("[company-request.service] Company request not found")
    return null
  }

  const request = result[0]

  return {
    id: request.id,
    requestedBy: request.requestedBy,
    companyId: request.companyId || undefined,
    companyName: request.companyName,
    email: request.email || undefined,
    phone: request.phone || undefined,
    website: request.website || undefined,
    industry: request.industry || undefined,
    notes: request.notes || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}

interface CreateCompanyRequestData {
  companyId?: string | null
  companyName: string
  industry?: string
  website?: string
  email?: string
  phone?: string
  notes?: string
}

export async function createCompanyRequest(data: CreateCompanyRequestData, requestedBy: string): Promise<CompanyRequest> {
  console.log("[company-request.service] Creating company request:", data.companyName, "by:", requestedBy)

  const result = await db.insert(companyRequests).values({
    companyId: data.companyId,
    companyName: data.companyName,
    industry: data.industry,
    website: data.website,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
    requestedBy,
    status: "pending",
  }).returning()

  const request = result[0]

  console.log("[company-request.service] Company request created with id:", request.id)

  return {
    id: request.id,
    requestedBy: request.requestedBy,
    companyId: request.companyId || undefined,
    companyName: request.companyName,
    email: request.email || undefined,
    phone: request.phone || undefined,
    website: request.website || undefined,
    industry: request.industry || undefined,
    notes: request.notes || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}

export async function approveCompanyRequest(id: string, reviewedBy: string): Promise<CompanyRequest> {
  console.log("[company-request.service] Approving company request:", id)

  const result = await db.update(companyRequests)
    .set({
      status: "approved",
      reviewedBy,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(companyRequests.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Company request not found")
  }

  const request = result[0]

  console.log("[company-request.service] Company request approved:", request.id)

  return {
    id: request.id,
    requestedBy: request.requestedBy,
    companyId: request.companyId || undefined,
    companyName: request.companyName,
    email: request.email || undefined,
    phone: request.phone || undefined,
    website: request.website || undefined,
    industry: request.industry || undefined,
    notes: request.notes || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}

export async function rejectCompanyRequest(id: string, reviewedBy: string): Promise<CompanyRequest> {
  console.log("[company-request.service] Rejecting company request:", id)

  const result = await db.update(companyRequests)
    .set({
      status: "rejected",
      reviewedBy,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(companyRequests.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Company request not found")
  }

  const request = result[0]

  console.log("[company-request.service] Company request rejected:", request.id)

  return {
    id: request.id,
    requestedBy: request.requestedBy,
    companyId: request.companyId || undefined,
    companyName: request.companyName,
    email: request.email || undefined,
    phone: request.phone || undefined,
    website: request.website || undefined,
    industry: request.industry || undefined,
    notes: request.notes || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}
