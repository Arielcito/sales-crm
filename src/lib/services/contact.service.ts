import { db } from "@/lib/db"
import { contacts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { Contact } from "@/lib/types"

export async function getAllContacts(): Promise<Contact[]> {
  console.log("[contact.service] Fetching all contacts")

  const result = await db.select().from(contacts)

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
