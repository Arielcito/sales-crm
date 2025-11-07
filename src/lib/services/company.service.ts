import { db } from "@/lib/db"
import { companies, companyRequests } from "@/lib/db/schema"
import { eq, desc, or } from "drizzle-orm"
import type { Company, User } from "@/lib/types"

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

interface BlindCreateCompanyResult {
  status: "created" | "linked" | "pending"
  companyId?: string
  requestId?: string
  company?: Company
  message: string
}

export async function blindCreateCompany(
  data: CreateCompanyData,
  createdBy: string
): Promise<BlindCreateCompanyResult> {
  console.log("[company.service] Blind create company:", data.name, data.email)

  if (data.email) {
    console.log("[company.service] Checking for exact email match:", data.email)
    const existingByEmail = await db
      .select()
      .from(companies)
      .where(eq(companies.email, data.email))
      .limit(1)

    if (existingByEmail.length > 0) {
      console.log("[company.service] Exact email match found:", existingByEmail[0].id)
      return {
        status: "linked",
        companyId: existingByEmail[0].id,
        company: {
          id: existingByEmail[0].id,
          name: existingByEmail[0].name,
          email: existingByEmail[0].email || undefined,
          phone: existingByEmail[0].phone || undefined,
          website: existingByEmail[0].website || undefined,
          address: existingByEmail[0].address || undefined,
          industry: existingByEmail[0].industry || undefined,
          employeeCount: existingByEmail[0].employeeCount || undefined,
          notes: existingByEmail[0].notes || undefined,
          createdBy: existingByEmail[0].createdBy,
          assignedTeamId: existingByEmail[0].assignedTeamId || undefined,
          isGlobal: existingByEmail[0].isGlobal,
          createdAt: existingByEmail[0].createdAt,
          updatedAt: existingByEmail[0].updatedAt,
        },
        message: "Empresa existente vinculada correctamente"
      }
    }
  }

  console.log("[company.service] Checking for fuzzy match by name")
  const allCompanies = await db.select().from(companies)

  for (const potential of allCompanies) {
    if (isFuzzyMatch(data.name, potential.name)) {
      console.log("[company.service] Fuzzy match found:", potential.id)

      const requestResult = await db.insert(companyRequests).values({
        requestedBy: createdBy,
        companyName: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        notes: data.notes,
        status: "pending",
        requestType: "fuzzy_match",
        entityType: "company",
        potentialDuplicateId: potential.id,
        submittedData: JSON.parse(JSON.stringify(data)),
      }).returning()

      console.log("[company.service] Fuzzy match request created:", requestResult[0].id)

      return {
        status: "pending",
        requestId: requestResult[0].id,
        message: "Se encontró una empresa similar. Pendiente de revisión del administrador."
      }
    }
  }

  console.log("[company.service] No duplicates found, creating new company")
  const newCompany = await createCompany(data, createdBy)

  return {
    status: "created",
    companyId: newCompany.id,
    company: newCompany,
    message: "Empresa creada correctamente"
  }
}

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


