import { z } from "zod"

export const createCompanySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  industry: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  employeeCount: z.number().int().positive().optional(),
  notes: z.string().optional(),
  assignedTeamId: z.string().uuid().optional().nullable(),
  isGlobal: z.boolean().default(false),
})

export const createCompanyRequestSchema = z.object({
  companyId: z.string().uuid().optional().nullable(),
  companyName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  industry: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type CreateCompanyRequestInput = z.infer<typeof createCompanyRequestSchema>
