import { NextRequest, NextResponse } from "next/server"
import { updateTeam, deleteTeam, getTeamById } from "@/lib/services/team.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { z } from "zod"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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

    if (!currentUser || currentUser.level > 1) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo nivel 1 puede eliminar equipos" } },
        { status: 403 }
      )
    }

    const team = await getTeamById(id)
    if (!team) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Equipo no encontrado" } },
        { status: 404 }
      )
    }

    const teamMembers = await db.query.users.findMany({
      where: eq(users.teamId, id)
    })

    if (teamMembers.length > 0) {
      console.log("[API /teams/:id] Team has members, cannot delete")
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TEAM_HAS_MEMBERS",
            message: `No se puede eliminar el equipo porque tiene ${teamMembers.length} miembro(s) asignado(s)`
          }
        },
        { status: 400 }
      )
    }

    await deleteTeam(id)

    console.log("[API /teams/:id] Team deleted:", id)

    return NextResponse.json({ success: true, data: { id } })
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
