import { NextRequest, NextResponse } from "next/server"
import { brandingService } from "@/lib/services/branding.service"
import { updateBrandingSchema } from "@/lib/schemas/branding"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const branding = await brandingService.getOrCreate()

    return NextResponse.json({
      success: true,
      data: branding,
    })
  } catch (error) {
    console.error("[GET /api/branding] Error fetching branding:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch branding configuration",
        },
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      )
    }

    const [user] = await db
      .select({ level: users.level })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!user || user.level !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only admin users can modify branding",
          },
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateBrandingSchema.parse(body)

    const updatedBranding = await brandingService.update(
      validatedData,
      session.user.id
    )

    return NextResponse.json({
      success: true,
      data: updatedBranding,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid branding data",
            details: error.message,
          },
        },
        { status: 400 }
      )
    }

    console.error("[PATCH /api/branding] Error updating branding:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: "Failed to update branding configuration",
        },
      },
      { status: 500 }
    )
  }
}
