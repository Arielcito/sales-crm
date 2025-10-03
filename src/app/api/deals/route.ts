import { NextRequest, NextResponse } from "next/server"
import { getAllDeals, createDeal } from "@/lib/services/deal.service"
import { getUserById, getUsersByLevel } from "@/lib/services/user.service"
import { createDealSchema } from "@/lib/schemas/deal"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ZodError } from "zod"

export async function GET(_request: NextRequest) {
  try {
    console.log("[API /deals] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /deals] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /deals] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    console.log("[API /deals] Fetching deals for user level:", currentUser.level)

    const visibleUsers = await getUsersByLevel(currentUser)
    const visibleUserIds = visibleUsers.map(u => u.id)

    console.log("[API /deals] Visible users:", visibleUserIds.length)

    const deals = await getAllDeals({ userIds: visibleUserIds })

    console.log("[API /deals] Returning deals:", deals.length)

    return NextResponse.json({ success: true, data: deals })
  } catch (error) {
    console.error("[API /deals] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener los negocios" }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API /deals] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
      console.log("[API /deals] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createDealSchema.parse(body)

    console.log("[API /deals] Creating deal:", validatedData.title)

    const deal = await createDeal(validatedData)

    console.log("[API /deals] Deal created:", deal.id)

    return NextResponse.json({ success: true, data: deal }, { status: 201 })
  } catch (error: unknown) {
    console.error("[API /deals] Error:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Error de validación",
            details: error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`)
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al crear el negocio" }
      },
      { status: 500 }
    )
  }
}
