import { NextRequest, NextResponse } from "next/server"
import { getAllTeams, createTeam } from "@/lib/services/team.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { z } from "zod"

const createTeamSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  leaderId: z.string().uuid().optional(),
})

export async function GET() {
  try {
    console.log("[API /teams] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /teams] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const teams = await getAllTeams()

    console.log("[API /teams] Returning teams:", teams.length)

    return NextResponse.json({ success: true, data: teams })
  } catch (error) {
    console.error("[API /teams] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener equipos" }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API /teams] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /teams] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /teams] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level > 2) {
      console.log("[API /teams] User not authorized to create teams")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo niveles 1 y 2 pueden crear equipos" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createTeamSchema.parse(body)

    console.log("[API /teams] Creating team:", validatedData.name)

    const team = await createTeam(validatedData)

    console.log("[API /teams] Team created:", team.id)

    return NextResponse.json({ success: true, data: team }, { status: 201 })
  } catch (error: unknown) {
    console.error("[API /teams] Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Datos inválidos",
            details: error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`)
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al crear equipo" }
      },
      { status: 500 }
    )
  }
}
