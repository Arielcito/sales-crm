import { db } from "@/lib/db"
import { contactPermissions, contactAccessRequests, contacts, users, companies } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import type { Contact, User, ContactPermission, ContactAccessRequest } from "@/lib/types"

export async function hasContactPermission(userId: string, contactId: string, userLevel: number): Promise<boolean> {
  console.log("[contact-permission.service] Checking permission for user:", userId, "contact:", contactId, "level:", userLevel)

  if (userLevel === 1) {
    console.log("[contact-permission.service] Level 1 user has implicit access")
    return true
  }

  const permission = await db
    .select()
    .from(contactPermissions)
    .where(
      and(
        eq(contactPermissions.userId, userId),
        eq(contactPermissions.contactId, contactId)
      )
    )
    .limit(1)

  const hasAccess = permission.length > 0

  console.log("[contact-permission.service] Permission found:", hasAccess)

  return hasAccess
}

export async function maskSensitiveFields(contact: Contact, hasPermission: boolean): Promise<Contact> {
  if (hasPermission) {
    return contact
  }

  return {
    ...contact,
    email: undefined,
    phone: undefined,
    position: undefined,
    notes: undefined,
  }
}

export async function requestContactAccess(
  userId: string,
  contactId: string,
  reason?: string
): Promise<ContactAccessRequest> {
  console.log("[contact-permission.service] Creating access request for contact:", contactId, "by user:", userId)

  const existingRequest = await db
    .select()
    .from(contactAccessRequests)
    .where(
      and(
        eq(contactAccessRequests.requestedBy, userId),
        eq(contactAccessRequests.contactId, contactId),
        eq(contactAccessRequests.status, "pending")
      )
    )
    .limit(1)

  if (existingRequest.length > 0) {
    console.log("[contact-permission.service] Pending request already exists:", existingRequest[0].id)
    return {
      id: existingRequest[0].id,
      requestedBy: existingRequest[0].requestedBy,
      contactId: existingRequest[0].contactId,
      reason: existingRequest[0].reason || undefined,
      status: existingRequest[0].status,
      reviewedBy: existingRequest[0].reviewedBy || undefined,
      reviewedAt: existingRequest[0].reviewedAt || undefined,
      createdAt: existingRequest[0].createdAt,
      updatedAt: existingRequest[0].updatedAt,
    }
  }

  const result = await db.insert(contactAccessRequests).values({
    requestedBy: userId,
    contactId,
    reason,
    status: "pending",
  }).returning()

  const request = result[0]

  console.log("[contact-permission.service] Access request created:", request.id)

  return {
    id: request.id,
    requestedBy: request.requestedBy,
    contactId: request.contactId,
    reason: request.reason || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}

export async function getContactAccessRequests(): Promise<ContactAccessRequest[]> {
  console.log("[contact-permission.service] Fetching all contact access requests")

  const result = await db
    .select({
      id: contactAccessRequests.id,
      requestedBy: contactAccessRequests.requestedBy,
      contactId: contactAccessRequests.contactId,
      reason: contactAccessRequests.reason,
      status: contactAccessRequests.status,
      reviewedBy: contactAccessRequests.reviewedBy,
      reviewedAt: contactAccessRequests.reviewedAt,
      createdAt: contactAccessRequests.createdAt,
      updatedAt: contactAccessRequests.updatedAt,
      requestedByName: users.name,
      contactName: contacts.name,
      companyName: companies.name,
    })
    .from(contactAccessRequests)
    .leftJoin(users, eq(contactAccessRequests.requestedBy, users.id))
    .leftJoin(contacts, eq(contactAccessRequests.contactId, contacts.id))
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .orderBy(desc(contactAccessRequests.createdAt))

  console.log("[contact-permission.service] Found requests:", result.length)

  return result.map(request => ({
    id: request.id,
    requestedBy: request.requestedBy,
    contactId: request.contactId,
    reason: request.reason || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    requestedByName: request.requestedByName || undefined,
    contactName: request.contactName || undefined,
    companyName: request.companyName || undefined,
  }))
}

export async function getContactAccessRequestById(id: string): Promise<ContactAccessRequest | null> {
  console.log("[contact-permission.service] Fetching request by id:", id)

  const result = await db
    .select()
    .from(contactAccessRequests)
    .where(eq(contactAccessRequests.id, id))
    .limit(1)

  if (result.length === 0) {
    console.log("[contact-permission.service] Request not found")
    return null
  }

  const request = result[0]

  return {
    id: request.id,
    requestedBy: request.requestedBy,
    contactId: request.contactId,
    reason: request.reason || undefined,
    status: request.status,
    reviewedBy: request.reviewedBy || undefined,
    reviewedAt: request.reviewedAt || undefined,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }
}

export async function approveContactAccessRequest(
  requestId: string,
  reviewerId: string
): Promise<ContactAccessRequest> {
  console.log("[contact-permission.service] Approving request:", requestId, "by reviewer:", reviewerId)

  const request = await getContactAccessRequestById(requestId)

  if (!request) {
    throw new Error("Request not found")
  }

  if (request.status !== "pending") {
    throw new Error("Request has already been reviewed")
  }

  const [updatedRequest] = await db
    .update(contactAccessRequests)
    .set({
      status: "approved",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(contactAccessRequests.id, requestId))
    .returning()

  await db.insert(contactPermissions).values({
    userId: request.requestedBy,
    contactId: request.contactId,
    grantedBy: reviewerId,
  })

  console.log("[contact-permission.service] Permission granted to user:", request.requestedBy, "for contact:", request.contactId)

  return {
    id: updatedRequest.id,
    requestedBy: updatedRequest.requestedBy,
    contactId: updatedRequest.contactId,
    reason: updatedRequest.reason || undefined,
    status: updatedRequest.status,
    reviewedBy: updatedRequest.reviewedBy || undefined,
    reviewedAt: updatedRequest.reviewedAt || undefined,
    createdAt: updatedRequest.createdAt,
    updatedAt: updatedRequest.updatedAt,
  }
}

export async function rejectContactAccessRequest(
  requestId: string,
  reviewerId: string
): Promise<ContactAccessRequest> {
  console.log("[contact-permission.service] Rejecting request:", requestId, "by reviewer:", reviewerId)

  const request = await getContactAccessRequestById(requestId)

  if (!request) {
    throw new Error("Request not found")
  }

  if (request.status !== "pending") {
    throw new Error("Request has already been reviewed")
  }

  const [updatedRequest] = await db
    .update(contactAccessRequests)
    .set({
      status: "rejected",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(contactAccessRequests.id, requestId))
    .returning()

  console.log("[contact-permission.service] Request rejected:", requestId)

  return {
    id: updatedRequest.id,
    requestedBy: updatedRequest.requestedBy,
    contactId: updatedRequest.contactId,
    reason: updatedRequest.reason || undefined,
    status: updatedRequest.status,
    reviewedBy: updatedRequest.reviewedBy || undefined,
    reviewedAt: updatedRequest.reviewedAt || undefined,
    createdAt: updatedRequest.createdAt,
    updatedAt: updatedRequest.updatedAt,
  }
}

export async function getUserContactPermissions(userId: string): Promise<ContactPermission[]> {
  console.log("[contact-permission.service] Fetching permissions for user:", userId)

  const result = await db
    .select()
    .from(contactPermissions)
    .where(eq(contactPermissions.userId, userId))

  console.log("[contact-permission.service] Found permissions:", result.length)

  return result.map(permission => ({
    id: permission.id,
    userId: permission.userId,
    contactId: permission.contactId,
    grantedBy: permission.grantedBy,
    grantedAt: permission.grantedAt,
    createdAt: permission.createdAt,
  }))
}
