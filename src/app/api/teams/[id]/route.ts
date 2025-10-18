import { NextRequest, NextResponse } from "next/server"
import { updateTeam, deleteTeam } from "@/lib/services/team.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { z } from "zod"

const updateTeamSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  leaderId: z.string().uuid().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[API /teams/:id] PATCH request received for:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /teams/:id] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser || currentUser.level > 2) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo niveles 1 y 2 pueden editar equipos" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateTeamSchema.parse(body)

    const team = await updateTeam(id, validatedData)

    console.log("[API /teams/:id] Team updated:", team.id)

    return NextResponse.json({ success: true, data: team })
  } catch (error: unknown) {
    console.error("[API /teams/:id] Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Datos inválidos" }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al actualizar equipo" }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[API /teams/:id] DELETE request received for:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser || currentUser.level > 2) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo niveles 1 y 2 pueden eliminar equipos" } },
        { status: 403 }
      )
    }

    await deleteTeam(id)

    console.log("[API /teams/:id] Team deleted:", id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[API /teams/:id] Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al eliminar equipo" }
      },
      { status: 500 }
    )
  }
}
