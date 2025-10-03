import { z } from "zod"

export const createDealSchema = z.object({
  userId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  title: z.string().min(1, "El título es obligatorio"),
  currency: z.enum(["USD", "ARS"]),
  amountUsd: z.number().positive().optional(),
  amountArs: z.number().positive().optional(),
  exchangeRateId: z.string().uuid().optional(),
  stageId: z.string().uuid(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.coerce.date().optional(),
  notes: z.string().optional(),
})

export const updateDealSchema = z.object({
  title: z.string().min(1).optional(),
  currency: z.enum(["USD", "ARS"]).optional(),
  amountUsd: z.number().positive().optional(),
  amountArs: z.number().positive().optional(),
  exchangeRateId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.coerce.date().optional(),
  closedAt: z.coerce.date().optional(),
  lostReason: z.string().optional(),
  notes: z.string().optional(),
})

export const getDealQuerySchema = z.object({
  userId: z.string().uuid().optional(),
})

export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
export type GetDealQuery = z.infer<typeof getDealQuerySchema>
