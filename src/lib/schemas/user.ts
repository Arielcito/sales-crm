import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.string().min(2, "El rol es obligatorio"),
  level: z.number().int().min(1).max(4),
  managerId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.string().optional(),
  level: z.number().int().min(1).max(4).optional(),
  managerId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  image: z.string().url().nullable().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
