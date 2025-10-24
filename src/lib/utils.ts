import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function canManageUser(currentUser: User, targetUserLevel: number): boolean {
  if (currentUser.level === 1) {
    return true
  }

  if (currentUser.level === 2) {
    return targetUserLevel === 3 || targetUserLevel === 4
  }

  return false
}

export function getAvailableLevels(currentUserLevel: number): number[] {
  if (currentUserLevel === 1) {
    return [2, 3, 4]
  }

  if (currentUserLevel === 2) {
    return [3, 4]
  }

  return []
}
