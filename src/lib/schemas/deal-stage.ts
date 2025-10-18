import { z } from "zod"

export const createDealStageSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  order: z.number().int().min(0, "El orden debe ser un número positivo"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color hexadecimal inválido").default("#3b82f6"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  companyOwnerId: z.string().uuid().optional().nullable(),
})

export const updateDealStageSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  order: z.number().int().min(0, "El orden debe ser un número positivo").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color hexadecimal inválido").optional(),
  isActive: z.boolean().optional(),
})

export type CreateDealStageInput = z.infer<typeof createDealStageSchema>
export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>
