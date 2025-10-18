import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import { brandingService } from "@/lib/services/branding.service"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]

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

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No file provided",
          },
        },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid file type. Only PNG, JPG, JPEG, and SVG are allowed",
          },
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "File size exceeds 5MB limit",
          },
        },
        { status: 400 }
      )
    }

    const existingBranding = await brandingService.getOrCreate()
    if (existingBranding.logoUrl) {
      const oldPath = existingBranding.logoUrl.split("/").pop()
      if (oldPath) {
        await supabaseAdmin.storage.from("branding-logos").remove([oldPath])
      }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `logo-${Date.now()}.${fileExt}`
    const fileBuffer = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("branding-logos")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("[POST /api/branding/upload-logo] Upload error:", uploadError)
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

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("branding-logos")
      .getPublicUrl(uploadData.path)

    const logoUrl = publicUrlData.publicUrl

    const updatedBranding = await brandingService.updateLogo(logoUrl, session.user.id)

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
      const filePath = existingBranding.logoUrl.split("/").pop()
      if (filePath) {
        await supabaseAdmin.storage.from("branding-logos").remove([filePath])
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
