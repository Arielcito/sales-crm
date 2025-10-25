import { NextResponse } from "next/server"
import { updateDealStage, toggleDealStageActive, getDealStageById } from "@/lib/services/deal-stage.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { updateDealStageSchema } from "@/lib/schemas/deal-stage"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[API /deal-stages/[id]] PUT request received for:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /deal-stages/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /deal-stages/[id]] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level !== 1) {
      console.log("[API /deal-stages/[id]] Insufficient permissions")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes permisos para editar etapas" } },
        { status: 403 }
      )
    }

    const existingStage = await getDealStageById(id)

    if (!existingStage) {
      console.log("[API /deal-stages/[id]] Stage not found")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Etapa no encontrada" } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateDealStageSchema.parse(body)

    const updatedStage = await updateDealStage(id, validatedData)

    if (!updatedStage) {
      console.log("[API /deal-stages/[id]] Failed to update stage")
      return NextResponse.json(
        { success: false, error: { code: "UPDATE_FAILED", message: "Error al actualizar etapa" } },
        { status: 500 }
      )
    }

    console.log("[API /deal-stages/[id]] Stage updated:", updatedStage.id)

    return NextResponse.json({ success: true, data: updatedStage })
  } catch (error) {
    console.error("[API /deal-stages/[id]] Error:", error)

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
        error: { code: "INTERNAL_ERROR", message: "Error al actualizar etapa" }
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[API /deal-stages/[id]] PATCH request received for:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /deal-stages/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /deal-stages/[id]] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level !== 1) {
      console.log("[API /deal-stages/[id]] Insufficient permissions")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes permisos para modificar etapas" } },
        { status: 403 }
      )
    }

    const existingStage = await getDealStageById(id)

    if (!existingStage) {
      console.log("[API /deal-stages/[id]] Stage not found")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Etapa no encontrada" } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "isActive debe ser booleano" } },
        { status: 400 }
      )
    }

    const updatedStage = await toggleDealStageActive(id, isActive)

    if (!updatedStage) {
      console.log("[API /deal-stages/[id]] Failed to toggle stage active")
      return NextResponse.json(
        { success: false, error: { code: "UPDATE_FAILED", message: "Error al cambiar estado de etapa" } },
        { status: 500 }
      )
    }

    console.log("[API /deal-stages/[id]] Stage active toggled:", updatedStage.id)

    return NextResponse.json({ success: true, data: updatedStage })
  } catch (error) {
    console.error("[API /deal-stages/[id]] Error:", error)

    if (error instanceof Error && error.message.includes("último stage activo")) {
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
        error: { code: "INTERNAL_ERROR", message: "Error al cambiar estado de etapa" }
      },
      { status: 500 }
    )
  }
}
