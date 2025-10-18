import { z } from "zod"

const hslColorRegex = /^(\d{1,3})\s+(\d{1,3})%\s+(\d{1,3})%$/

export const brandingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(hslColorRegex, "Invalid HSL format (e.g., '220 90% 56%')"),
  secondaryColor: z.string().regex(hslColorRegex, "Invalid HSL format"),
  accentColor: z.string().regex(hslColorRegex, "Invalid HSL format"),
  sidebarColor: z.string().regex(hslColorRegex, "Invalid HSL format"),
})

export const updateBrandingSchema = brandingSchema.partial()

export type BrandingFormData = z.infer<typeof brandingSchema>
export type UpdateBrandingData = z.infer<typeof updateBrandingSchema>
