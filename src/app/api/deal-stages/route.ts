import { NextResponse } from "next/server"
import { getDealStagesByUser, createDealStage, getNextStageOrder } from "@/lib/services/deal-stage.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createDealStageSchema } from "@/lib/schemas/deal-stage"

export async function GET() {
  try {
    console.log("[API /deal-stages] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /deal-stages] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /deal-stages] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const stages = await getDealStagesByUser(currentUser)

    console.log("[API /deal-stages] Returning stages:", stages.length)

    return NextResponse.json({ success: true, data: stages })
  } catch (error) {
    console.error("[API /deal-stages] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener etapas" }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("[API /deal-stages] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /deal-stages] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /deal-stages] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level !== 1) {
      console.log("[API /deal-stages] Insufficient permissions")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes permisos para crear etapas" } },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.order) {
      body.order = await getNextStageOrder()
    }

    const validatedData = createDealStageSchema.parse(body)

    const newStage = await createDealStage(validatedData, currentUser.id)

    console.log("[API /deal-stages] Stage created:", newStage.id)

    return NextResponse.json({ success: true, data: newStage }, { status: 201 })
  } catch (error) {
    console.error("[API /deal-stages] Error:", error)

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: error.message }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al crear etapa" }
      },
      { status: 500 }
    )
  }
}
