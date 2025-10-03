import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { User } from "@/lib/types"

export async function getAllUsers(): Promise<User[]> {
  console.log("[user.service] Fetching all users")

  const result = await db.select().from(users)

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

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1)

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
  console.log("[user.service] Fetching users by level for user:", currentUser.id)

  const allUsers = await getAllUsers()

  if (currentUser.level === 1) {
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

  const visibleUsers = allUsers.filter(u => visibleUserIds.has(u.id))

  console.log("[user.service] Visible users:", visibleUsers.length)

  return visibleUsers
}


