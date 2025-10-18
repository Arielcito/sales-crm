import { db } from "@/lib/db"
import { teams, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import type { Team } from "@/lib/types"

export async function getAllTeams(): Promise<Team[]> {
  console.log("[team.service] Fetching all teams")

  const result = await db.select().from(teams).orderBy(desc(teams.createdAt))

  console.log("[team.service] Found teams:", result.length)

  return result.map(team => ({
    id: team.id,
    name: team.name,
    description: team.description || undefined,
    leaderId: team.leaderId || undefined,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }))
}

export async function getTeamById(id: string): Promise<Team | null> {
  console.log("[team.service] Fetching team by id:", id)

  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1)

  if (result.length === 0) {
    console.log("[team.service] Team not found")
    return null
  }

  const team = result[0]

  return {
    id: team.id,
    name: team.name,
    description: team.description || undefined,
    leaderId: team.leaderId || undefined,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }
}

interface CreateTeamData {
  name: string
  description?: string
  leaderId?: string
}

export async function createTeam(data: CreateTeamData): Promise<Team> {
  console.log("[team.service] Creating team:", data.name)

  const result = await db.insert(teams).values({
    name: data.name,
    description: data.description,
    leaderId: data.leaderId,
  }).returning()

  const team = result[0]

  console.log("[team.service] Team created with id:", team.id)

  return {
    id: team.id,
    name: team.name,
    description: team.description || undefined,
    leaderId: team.leaderId || undefined,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }
}

interface UpdateTeamData {
  name?: string
  description?: string
  leaderId?: string | null
}

export async function updateTeam(id: string, data: UpdateTeamData): Promise<Team> {
  console.log("[team.service] Updating team:", id)

  const result = await db.update(teams)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Team not found")
  }

  const team = result[0]

  console.log("[team.service] Team updated:", team.id)

  return {
    id: team.id,
    name: team.name,
    description: team.description || undefined,
    leaderId: team.leaderId || undefined,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }
}

export async function deleteTeam(id: string): Promise<void> {
  console.log("[team.service] Deleting team:", id)

  const result = await db.delete(teams)
    .where(eq(teams.id, id))
    .returning()

  if (result.length === 0) {
    throw new Error("Team not found")
  }

  console.log("[team.service] Team deleted:", id)
}

export async function assignUserToTeam(userId: string, teamId: string | null): Promise<void> {
  console.log("[team.service] Assigning user to team:", userId, "->", teamId)

  await db.update(users)
    .set({ teamId, updatedAt: new Date() })
    .where(eq(users.id, userId))

  console.log("[team.service] User assigned to team")
}
