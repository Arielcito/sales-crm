import { db } from "@/lib/db"
import { organizationBranding } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { UpdateBrandingData } from "@/lib/schemas/branding"

export const brandingService = {
  async get() {
    const result = await db.select().from(organizationBranding).limit(1)
    return result[0] || null
  },

  async getOrCreate() {
    let branding = await this.get()

    if (!branding) {
      const newBranding = await db
        .insert(organizationBranding)
        .values({})
        .returning()

      branding = newBranding[0]
    }

    return branding
  },

  async update(data: UpdateBrandingData, userId?: string) {
    const existingBranding = await this.getOrCreate()

    const updated = await db
      .update(organizationBranding)
      .set({
        ...data,
        updatedAt: new Date(),
        ...(userId && { createdBy: userId }),
      })
      .where(eq(organizationBranding.id, existingBranding.id))
      .returning()

    return updated[0]
  },

  async updateLogo(logoUrl: string | null, userId?: string) {
    const existingBranding = await this.getOrCreate()

    const updated = await db
      .update(organizationBranding)
      .set({
        logoUrl,
        updatedAt: new Date(),
        ...(userId && { createdBy: userId }),
      })
      .where(eq(organizationBranding.id, existingBranding.id))
      .returning()

    return updated[0]
  },
}
