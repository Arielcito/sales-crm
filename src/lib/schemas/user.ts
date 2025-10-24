import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.string().min(2, "El rol es obligatorio"),
  level: z.number().int().min(1).max(4),
  managerId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
}).refine((data) => {
  if (data.level === 1 && data.teamId) {
    return false
  }
  if ((data.level === 3 || data.level === 4) && !data.teamId) {
    return false
  }
  return true
}, {
  message: "Nivel 1 no puede tener equipo. Niveles 3 y 4 deben tener equipo obligatoriamente",
  path: ["teamId"]
}).refine((data) => {
  if (data.level === 1 && data.managerId) {
    return false
  }
  if ((data.level === 3 || data.level === 4) && !data.managerId) {
    return false
  }
  return true
}, {
  message: "Nivel 1 no necesita manager. Niveles 3 y 4 deben tener manager obligatoriamente",
  path: ["managerId"]
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.string().optional(),
  level: z.number().int().min(1).max(4).optional(),
  managerId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  image: z.string().url().nullable().optional(),
}).refine((data) => {
  if (data.level === 1 && data.teamId) {
    return false
  }
  if ((data.level === 3 || data.level === 4) && data.teamId === null) {
    return false
  }
  return true
}, {
  message: "Nivel 1 no puede tener equipo. Niveles 3 y 4 deben tener equipo obligatoriamente",
  path: ["teamId"]
}).refine((data) => {
  if (data.level === 1 && data.managerId) {
    return false
  }
  if ((data.level === 3 || data.level === 4) && data.managerId === null) {
    return false
  }
  return true
}, {
  message: "Nivel 1 no necesita manager. Niveles 3 y 4 deben tener manager obligatoriamente",
  path: ["managerId"]
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
