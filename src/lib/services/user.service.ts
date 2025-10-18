import { eq, and, or, isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import type { UpdateUserInput } from "@/lib/schemas/user"
import type { User } from "@/lib/types"

export async function getAllUsers(): Promise<User[]> {
  console.log("[user.service] Fetching all users")

  const result = await db.select().from(users).where(
    or(eq(users.banned, false), isNull(users.banned))
  )

  console.log("[user.service] Found users:", result.length)

  return result.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    level: user.level,
    managerId: user.managerId || undefined,
    teamId: user.teamId || undefined,
    image: user.image || undefined,
  }))
}

export async function getUserById(id: string): Promise<User | null> {
  console.log("[user.service] Fetching user by id:", id)

  const result = await db.select().from(users).where(
    and(
      eq(users.id, id),
      or(eq(users.banned, false), isNull(users.banned))
    )
  ).limit(1)

  if (result.length === 0) {
    console.log("[user.service] User not found")
    return null
  }

  const user = result[0]

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    level: user.level,
    managerId: user.managerId || undefined,
    teamId: user.teamId || undefined,
    image: user.image || undefined,
  }
}

export async function getUsersByLevel(currentUser: User): Promise<User[]> {
  console.log("[user.service] Fetching users by level for user:", currentUser.id, "teamId:", currentUser.teamId)

  const allUsers = await getAllUsers()

  if (currentUser.level === 1) {
    console.log("[user.service] Level 1 user, returning all users")
    return allUsers
  }

  const visibleUserIds = new Set<string>([currentUser.id])

  function addSubordinates(managerId: string) {
    const subordinates = allUsers.filter(u => u.managerId === managerId)
    subordinates.forEach(sub => {
      if (!visibleUserIds.has(sub.id)) {
        visibleUserIds.add(sub.id)
        addSubordinates(sub.id)
      }
    })
  }

  addSubordinates(currentUser.id)

  if (currentUser.teamId) {
    const teamUsers = allUsers.filter(u => u.teamId === currentUser.teamId && u.level >= currentUser.level)
    teamUsers.forEach(u => visibleUserIds.add(u.id))
  }

  const visibleUsers = allUsers.filter(u => visibleUserIds.has(u.id))

  console.log("[user.service] Visible users:", visibleUsers.length)

  return visibleUsers
}

export async function getUsersByTeam(currentUser: User): Promise<User[]> {
  console.log("[user.service] Fetching team users for user:", currentUser.id, "teamId:", currentUser.teamId)

  const allUsers = await getAllUsers()

  if (currentUser.level === 1) {
    return allUsers
  }

  if (!currentUser.teamId) {
    return [currentUser]
  }

  const teamUsers = allUsers.filter(u =>
    u.teamId === currentUser.teamId && u.level >= currentUser.level
  )

  console.log("[user.service] Team users:", teamUsers.length)

  return teamUsers
}

export async function validateManagerAssignment(userId: string, managerId: string | null, userLevel: number): Promise<{ valid: boolean; error?: string }> {
  console.log("[user.service] Validating manager assignment for user:", userId, "manager:", managerId, "level:", userLevel)

  if (!managerId) {
    if (userLevel === 1) {
      return { valid: true }
    }
    return { valid: false, error: "Users with level 2-4 must have a manager assigned" }
  }

  const manager = await getUserById(managerId)

  if (!manager) {
    return { valid: false, error: "Manager not found" }
  }

  if (manager.id === userId) {
    return { valid: false, error: "User cannot be their own manager" }
  }

  if (userLevel >= 3 && manager.level > 2) {
    return { valid: false, error: "Users with level 3-4 must report to a manager with level 2 or higher" }
  }

  return { valid: true }
}

export async function getManagerChain(userId: string): Promise<User[]> {
  console.log("[user.service] Getting manager chain for user:", userId)

  const chain: User[] = []
  let currentUserId: string | undefined = userId

  while (currentUserId) {
    const user = await getUserById(currentUserId)
    if (!user) break

    chain.push(user)

    if (!user.managerId || user.level === 1) break
    currentUserId = user.managerId
  }

  console.log("[user.service] Manager chain length:", chain.length)

  return chain
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User | null> {
  console.log("[user.service] Updating user:", id)

  const updateData: Record<string, unknown> = { updatedAt: new Date() }

  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.role !== undefined) updateData.role = data.role
  if (data.level !== undefined) updateData.level = data.level
  if (data.managerId !== undefined) updateData.managerId = data.managerId
  if (data.teamId !== undefined) updateData.teamId = data.teamId
  if (data.image !== undefined) updateData.image = data.image

  const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning()

  if (result.length === 0) {
    console.log("[user.service] User not found for update")
    return null
  }

  const user = result[0]

  console.log("[user.service] User updated:", user.id)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    level: user.level,
    managerId: user.managerId || undefined,
    teamId: user.teamId || undefined,
    image: user.image || undefined,
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  console.log("[user.service] Deleting user:", id)

  const result = await db.update(users).set({ banned: true, updatedAt: new Date() }).where(eq(users.id, id)).returning()

  if (result.length === 0) {
    console.log("[user.service] User not found for deletion")
    return false
  }

  console.log("[user.service] User deleted:", id)
  return true
}


