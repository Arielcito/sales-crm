import { db } from "@/lib/db"
import { companies } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { Company } from "@/lib/types"

export async function getAllCompanies(): Promise<Company[]> {
  console.log("[company.service] Fetching all companies")

  const result = await db.select().from(companies)

  console.log("[company.service] Found companies:", result.length)

  return result.map(company => ({
    id: company.id,
    name: company.name,
    email: company.email || undefined,
    phone: company.phone || undefined,
    website: company.website || undefined,
    address: company.address || undefined,
    industry: company.industry || undefined,
    employeeCount: company.employeeCount || undefined,
    notes: company.notes || undefined,
    createdBy: company.createdBy,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }))
}

export async function getCompanyById(id: string): Promise<Company | null> {
  console.log("[company.service] Fetching company by id:", id)

  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1)

  if (result.length === 0) {
    console.log("[company.service] Company not found")
    return null
  }

  const company = result[0]

  return {
    id: company.id,
    name: company.name,
    email: company.email || undefined,
    phone: company.phone || undefined,
    website: company.website || undefined,
    address: company.address || undefined,
    industry: company.industry || undefined,
    employeeCount: company.employeeCount || undefined,
    notes: company.notes || undefined,
    createdBy: company.createdBy,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }
}


