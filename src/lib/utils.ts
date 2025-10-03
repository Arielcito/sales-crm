import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function canManageUser(currentUser: User, targetUserLevel: number): boolean {
  return targetUserLevel > currentUser.level
}

export function getAvailableLevels(currentUserLevel: number): number[] {
  const levels: number[] = []
  for (let i = currentUserLevel + 1; i <= 4; i++) {
    levels.push(i)
  }
  return levels
}
