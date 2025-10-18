import { db } from "@/lib/db"
import { companies } from "@/lib/db/schema"
import { eq, desc, or } from "drizzle-orm"
import type { Company, User } from "@/lib/types"

export async function getAllCompanies(): Promise<Company[]> {
  console.log("[company.service] Fetching all companies")

  const result = await db.select().from(companies).orderBy(desc(companies.createdAt))

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
    assignedTeamId: company.assignedTeamId || undefined,
    isGlobal: company.isGlobal,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }))
}

export async function getCompaniesByUser(currentUser: User): Promise<Company[]> {
  console.log("[company.service] Fetching companies for user level:", currentUser.level, "teamId:", currentUser.teamId)

  const allCompanies = await getAllCompanies()

  if (currentUser.level === 1) {
    console.log("[company.service] Level 1 user, returning all companies")
    return allCompanies
  }

  const visibleCompanies = allCompanies.filter(company =>
    company.isGlobal ||
    (currentUser.teamId && company.assignedTeamId === currentUser.teamId)
  )

  console.log("[company.service] Visible companies:", visibleCompanies.length)

  return visibleCompanies
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
    assignedTeamId: company.assignedTeamId || undefined,
    isGlobal: company.isGlobal,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }
}

interface CreateCompanyData {
  name: string
  industry?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  employeeCount?: number
  notes?: string
  assignedTeamId?: string | null
  isGlobal?: boolean
}

export async function createCompany(data: CreateCompanyData, createdBy: string): Promise<Company> {
  console.log("[company.service] Creating company:", data.name, "assignedTeamId:", data.assignedTeamId, "isGlobal:", data.isGlobal)

  const result = await db.insert(companies).values({
    name: data.name,
    industry: data.industry,
    website: data.website,
    email: data.email,
    phone: data.phone,
    address: data.address,
    employeeCount: data.employeeCount,
    notes: data.notes,
    assignedTeamId: data.assignedTeamId,
    isGlobal: data.isGlobal ?? false,
    createdBy,
  }).returning()

  const company = result[0]

  console.log("[company.service] Company created with id:", company.id)

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
    assignedTeamId: company.assignedTeamId || undefined,
    isGlobal: company.isGlobal,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }
}

interface UpdateCompanyData {
  name?: string
  industry?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  employeeCount?: number
  notes?: string
  assignedTeamId?: string | null
  isGlobal?: boolean
}

export async function updateCompany(id: string, data: UpdateCompanyData): Promise<Company> {
  console.log("[company.service] Updating company:", id)

  const result = await db.update(companies)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Company not found")
  }

  const company = result[0]

  console.log("[company.service] Company updated:", company.id)

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
    assignedTeamId: company.assignedTeamId || undefined,
    isGlobal: company.isGlobal,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }
}

export async function deleteCompany(id: string): Promise<void> {
  console.log("[company.service] Deleting company:", id)

  const result = await db.delete(companies)
    .where(eq(companies.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Company not found")
  }

  console.log("[company.service] Company deleted:", id)
}


