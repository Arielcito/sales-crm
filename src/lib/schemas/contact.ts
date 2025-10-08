import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(["lead", "prospect", "customer", "inactive"]).default("lead"),
  notes: z.string().optional(),
})

export const createContactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(["lead", "prospect", "customer", "inactive"]).default("lead"),
  notes: z.string().optional(),
  companyId: z.string().uuid("ID de empresa inválido").optional(),
})

export const dealSchema = z.object({
  contactId: z.string().uuid().optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  amount: z.string().optional(),
  stage: z.enum(["prospecting", "qualification", "proposal", "negotiation", "closed-won", "closed-lost"]).default("prospecting"),
  probability: z.string().optional(),
  expectedCloseDate: z.date().optional(),
  notes: z.string().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
export type DealInput = z.infer<typeof dealSchema>
