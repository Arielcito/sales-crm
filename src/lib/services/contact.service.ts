import { db } from "@/lib/db"
import { contacts } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import type { Contact } from "@/lib/types"

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

export async function getContactById(id: string): Promise<Contact | null> {
  console.log("[contact.service] Fetching contact by id:", id)

  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1)

  if (result.length === 0) {
    console.log("[contact.service] Contact not found")
    return null
  }

  const contact = result[0]

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
