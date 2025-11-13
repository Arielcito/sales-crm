import { db } from "@/lib/db"
import { contacts, companyRequests, companies } from "@/lib/db/schema"
import { eq, desc, and, or, sql } from "drizzle-orm"
import type { Contact, User } from "@/lib/types"
import { hasContactPermission, maskSensitiveFields } from "./contact-permission.service"

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1
      }
    }
  }

  return dp[m][n]
}

function isFuzzyMatch(name1: string, name2: string, threshold = 0.75): boolean {
  const normalizedName1 = name1.toLowerCase().trim()
  const normalizedName2 = name2.toLowerCase().trim()

  const distance = levenshteinDistance(normalizedName1, normalizedName2)
  const maxLength = Math.max(normalizedName1.length, normalizedName2.length)
  const similarity = 1 - distance / maxLength

  return similarity >= threshold
}

interface BlindCreateContactResult {
  status: "created" | "linked" | "pending"
  contactId?: string
  requestId?: string
  contact?: Contact
  message: string
}

export async function blindCreateContact(
  data: CreateContactData,
  userId: string
): Promise<BlindCreateContactResult> {
  console.log("[contact.service] Blind create contact:", data.name, data.email)

  if (data.email) {
    console.log("[contact.service] Checking for exact email match:", data.email)
    const existingByEmail = await db
      .select()
      .from(contacts)
      .where(eq(contacts.email, data.email))
      .limit(1)

    if (existingByEmail.length > 0) {
      console.log("[contact.service] Exact email match found:", existingByEmail[0].id)
      return {
        status: "linked",
        contactId: existingByEmail[0].id,
        contact: {
          id: existingByEmail[0].id,
          userId: existingByEmail[0].userId,
          companyId: existingByEmail[0].companyId || undefined,
          name: existingByEmail[0].name,
          email: existingByEmail[0].email || undefined,
          phone: existingByEmail[0].phone || undefined,
          position: existingByEmail[0].position || undefined,
          status: existingByEmail[0].status,
          notes: existingByEmail[0].notes || undefined,
          createdAt: existingByEmail[0].createdAt,
          updatedAt: existingByEmail[0].updatedAt,
        },
        message: "Contacto existente vinculado correctamente"
      }
    }
  }

  if (data.companyId) {
    console.log("[contact.service] Checking for fuzzy match by name+company")
    const potentialDuplicates = await db
      .select()
      .from(contacts)
      .where(eq(contacts.companyId, data.companyId))

    for (const potential of potentialDuplicates) {
      if (isFuzzyMatch(data.name, potential.name)) {
        console.log("[contact.service] Fuzzy match found:", potential.id)

        const temporalContact = await createContact({
          ...data,
          status: "pending_validation",
        }, userId)

        console.log("[contact.service] Temporal contact created:", temporalContact.id)

        const requestResult = await db.insert(companyRequests).values({
          requestedBy: userId,
          companyName: data.name,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
          status: "pending",
          requestType: "fuzzy_match",
          entityType: "contact",
          potentialDuplicateId: potential.id,
          submittedData: JSON.parse(JSON.stringify({ ...data, temporalContactId: temporalContact.id })),
        }).returning()

        console.log("[contact.service] Fuzzy match request created:", requestResult[0].id)

        return {
          status: "pending",
          requestId: requestResult[0].id,
          contactId: temporalContact.id,
          contact: temporalContact,
          message: "Contacto creado temporalmente. Se encontró un contacto similar que será revisado por el administrador."
        }
      }
    }
  }

  console.log("[contact.service] No duplicates found, creating new contact")
  const newContact = await createContact(data, userId)

  return {
    status: "created",
    contactId: newContact.id,
    contact: newContact,
    message: "Contacto creado correctamente"
  }
}

export async function getAllContacts(): Promise<Contact[]> {
  console.log("[contact.service] Fetching all contacts")

  const result = await db.select().from(contacts).orderBy(desc(contacts.createdAt))

  console.log("[contact.service] Found contacts:", result.length)

  return result.map(contact => ({
    id: contact.id,
    userId: contact.userId,
    companyId: contact.companyId || undefined,
    name: contact.name,
    email: contact.email || undefined,
    phone: contact.phone || undefined,
    position: contact.position || undefined,
    status: contact.status,
    notes: contact.notes || undefined,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  }))
}

export async function getContactsByUser(currentUser: User): Promise<Contact[]> {
  console.log("[contact.service] Fetching contacts for user level:", currentUser.level, "teamId:", currentUser.teamId)

  const result = await db
    .select({
      contact: contacts,
      company: companies,
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .orderBy(desc(contacts.createdAt))

  const allContactsRaw = result.map(row => ({
    id: row.contact.id,
    userId: row.contact.userId,
    companyId: row.contact.companyId || undefined,
    name: row.contact.name,
    email: row.contact.email || undefined,
    phone: row.contact.phone || undefined,
    position: row.contact.position || undefined,
    status: row.contact.status,
    notes: row.contact.notes || undefined,
    createdAt: row.contact.createdAt,
    updatedAt: row.contact.updatedAt,
  }))

  const contactsWithPermissions = await Promise.all(
    allContactsRaw.map(async (contact) => {
      const hasPermission = await hasContactPermission(currentUser.id, contact.id, currentUser.level)
      return await maskSensitiveFields(contact, hasPermission)
    })
  )

  console.log("[contact.service] Contacts with permissions applied:", contactsWithPermissions.length)

  return contactsWithPermissions
}

export async function getContactById(id: string, currentUser?: User): Promise<Contact | null> {
  console.log("[contact.service] Fetching contact by id:", id)

  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1)

  if (result.length === 0) {
    console.log("[contact.service] Contact not found")
    return null
  }

  const contact = result[0]

  const contactData = {
    id: contact.id,
    userId: contact.userId,
    companyId: contact.companyId || undefined,
    name: contact.name,
    email: contact.email || undefined,
    phone: contact.phone || undefined,
    position: contact.position || undefined,
    status: contact.status,
    notes: contact.notes || undefined,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  }

  if (!currentUser) {
    return contactData
  }

  const hasPermission = await hasContactPermission(currentUser.id, contact.id, currentUser.level)
  return await maskSensitiveFields(contactData, hasPermission)
}

interface CreateContactData {
  name: string
  email?: string
  phone?: string
  position?: string
  status?: string
  notes?: string
  companyId?: string
}

export async function createContact(data: CreateContactData, userId: string): Promise<Contact> {
  console.log("[contact.service] Creating contact:", data.name)

  const result = await db.insert(contacts).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    position: data.position,
    status: data.status || "lead",
    notes: data.notes,
    companyId: data.companyId,
    userId,
  }).returning()

  const contact = result[0]

  console.log("[contact.service] Contact created with id:", contact.id)

  return {
    id: contact.id,
    userId: contact.userId,
    companyId: contact.companyId || undefined,
    name: contact.name,
    email: contact.email || undefined,
    phone: contact.phone || undefined,
    position: contact.position || undefined,
    status: contact.status,
    notes: contact.notes || undefined,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  }
}

interface UpdateContactData {
  name?: string
  email?: string
  phone?: string
  position?: string
  status?: string
  notes?: string
  companyId?: string
}

export async function updateContact(id: string, data: UpdateContactData): Promise<Contact> {
  console.log("[contact.service] Updating contact:", id)

  const result = await db.update(contacts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Contact not found")
  }

  const contact = result[0]

  console.log("[contact.service] Contact updated:", contact.id)

  return {
    id: contact.id,
    userId: contact.userId,
    companyId: contact.companyId || undefined,
    name: contact.name,
    email: contact.email || undefined,
    phone: contact.phone || undefined,
    position: contact.position || undefined,
    status: contact.status,
    notes: contact.notes || undefined,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  }
}

export async function deleteContact(id: string): Promise<void> {
  console.log("[contact.service] Deleting contact:", id)

  const result = await db.delete(contacts)
    .where(eq(contacts.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Contact not found")
  }

  console.log("[contact.service] Contact deleted:", id)
}
