import { NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser, validateManagerAssignment } from "@/lib/services/user.service"
import { getTeamById } from "@/lib/services/team.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { z } from "zod"

const reassignSchema = z.object({
  managerId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[API /users/:id/reassign] PATCH request received for:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /users/:id/reassign] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /users/:id/reassign] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const targetUser = await getUserById(id)

    if (!targetUser) {
      console.log("[API /users/:id/reassign] Target user not found")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = reassignSchema.parse(body)

    if (validatedData.managerId) {
      const newManager = await getUserById(validatedData.managerId)
      if (!newManager) {
        return NextResponse.json(
          { success: false, error: { code: "MANAGER_NOT_FOUND", message: "Manager no encontrado" } },
          { status: 404 }
        )
      }

      if (newManager.level !== 2) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_MANAGER", message: "El manager debe ser nivel 2" } },
          { status: 400 }
        )
      }
    }

    if (validatedData.teamId) {
      const team = await getTeamById(validatedData.teamId)
      if (!team) {
        return NextResponse.json(
          { success: false, error: { code: "TEAM_NOT_FOUND", message: "Equipo no encontrado" } },
          { status: 404 }
        )
      }
    }

    const validation = await validateManagerAssignment(
      id,
      validatedData.managerId ?? targetUser.managerId ?? null,
      targetUser.level,
      validatedData.teamId ?? targetUser.teamId ?? null
    )

    if (!validation.valid) {
      console.log("[API /users/:id/reassign] Validation failed:", validation.error)
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validation.error } },
        { status: 400 }
      )
    }

    if (currentUser.level === 2) {
      if (targetUser.level < 3) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "No puedes reasignar usuarios de nivel 1 o 2" } },
          { status: 403 }
        )
      }

      if (targetUser.managerId !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Solo puedes reasignar tus subordinados directos" } },
          { status: 403 }
        )
      }
    }

    console.log("[API /users/:id/reassign] Reassigning user:", id)

    const updatedUser = await updateUser(id, {
      managerId: validatedData.managerId,
      teamId: validatedData.teamId,
    })

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: { code: "UPDATE_FAILED", message: "Error al actualizar usuario" } },
        { status: 500 }
      )
    }

    console.log("[API /users/:id/reassign] User reassigned:", updatedUser.id)

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error: unknown) {
    console.error("[API /users/:id/reassign] Error:", error)

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
        error: { code: "INTERNAL_ERROR", message: "Error al reasignar usuario" }
      },
      { status: 500 }
    )
  }
}
