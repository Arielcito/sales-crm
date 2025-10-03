import { NextRequest, NextResponse } from "next/server"
import { getDealById, updateDeal, deleteDeal } from "@/lib/services/deal.service"
import { updateDealSchema } from "@/lib/schemas/deal"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    console.log("[API /deals/:id] GET request for deal:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
      console.log("[API /deals/:id] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const deal = await getDealById(id)

    if (!deal) {
      console.log("[API /deals/:id] Deal not found")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Negocio no encontrado" } },
        { status: 404 }
      )
    }

    console.log("[API /deals/:id] Returning deal:", deal.id)

    return NextResponse.json({ success: true, data: deal })
  } catch (error) {
    console.error("[API /deals/:id] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener el negocio" }
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    console.log("[API /deals/:id] PATCH request for deal:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
      console.log("[API /deals/:id] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateDealSchema.parse(body)

    console.log("[API /deals/:id] Updating deal with data:", validatedData)

    const deal = await updateDeal(id, validatedData)

    if (!deal) {
      console.log("[API /deals/:id] Deal not found for update")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Negocio no encontrado" } },
        { status: 404 }
      )
    }

    console.log("[API /deals/:id] Deal updated:", deal.id)

    return NextResponse.json({ success: true, data: deal })
  } catch (error: any) {
    console.error("[API /deals/:id] Error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Error de validación",
            details: error.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`)
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al actualizar el negocio" }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    console.log("[API /deals/:id] DELETE request for deal:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
      console.log("[API /deals/:id] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const deleted = await deleteDeal(id)

    if (!deleted) {
      console.log("[API /deals/:id] Deal not found for deletion")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Negocio no encontrado" } },
        { status: 404 }
      )
    }

    console.log("[API /deals/:id] Deal deleted:", id)

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error) {
    console.error("[API /deals/:id] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al eliminar el negocio" }
      },
      { status: 500 }
    )
  }
}


