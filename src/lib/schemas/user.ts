import { z } from "zod"

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.string().optional(),
  level: z.number().int().min(1).max(4).optional(),
  managerId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  image: z.string().url().nullable().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
