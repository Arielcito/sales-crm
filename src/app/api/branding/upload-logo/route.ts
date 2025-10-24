import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { brandingService } from "@/lib/services/branding.service"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { UTApi } from "uploadthing/server"

const utapi = new UTApi()

export async function POST(request: NextRequest) {
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
            message: "Only admin users can upload logos",
          },
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No URL provided",
          },
        },
        { status: 400 }
      )
    }

    const existingBranding = await brandingService.getOrCreate()
    if (existingBranding.logoUrl) {
      try {
        const fileKey = existingBranding.logoUrl.split("/").pop()
        if (fileKey) {
          await utapi.deleteFiles(fileKey)
        }
      } catch (error) {
        console.error("[POST /api/branding/upload-logo] Delete old logo error:", error)
      }
    }

    const updatedBranding = await brandingService.updateLogo(url, session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        logoUrl: updatedBranding.logoUrl,
      },
    })
  } catch (error) {
    console.error("[POST /api/branding/upload-logo] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message: "Failed to upload logo",
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
            message: "Only admin users can delete logos",
          },
        },
        { status: 403 }
      )
    }

    const existingBranding = await brandingService.getOrCreate()

    if (existingBranding.logoUrl) {
      try {
        const fileKey = existingBranding.logoUrl.split("/").pop()
        if (fileKey) {
          await utapi.deleteFiles(fileKey)
        }
      } catch (error) {
        console.error("[DELETE /api/branding/upload-logo] Delete file error:", error)
      }
    }

    await brandingService.updateLogo(null, session.user.id)

    return NextResponse.json({
      success: true,
      data: null,
    })
  } catch (error) {
    console.error("[DELETE /api/branding/upload-logo] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: "Failed to delete logo",
        },
      },
      { status: 500 }
    )
  }
}
