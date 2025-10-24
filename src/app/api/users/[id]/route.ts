import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { updateUserSchema } from "@/lib/schemas/user"
import { deleteUser, getUserById, updateUser, validateManagerAssignment } from "@/lib/services/user.service"
import { canManageUser } from "@/lib/utils"
import { ZodError } from "zod"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params
    const id = params?.id

    if (!id) {
      console.log("[API /users/[id]] Missing user id in params")
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "ID de usuario no proporcionado" } },
        { status: 400 }
      )
    }
    console.log("[API /users/[id]] GET request for user:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /users/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const user = await getUserById(id)

    if (!user) {
      console.log("[API /users/[id]] User not found")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    console.log("[API /users/[id]] Returning user:", user.id)

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("[API /users/[id]] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener el usuario" }
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params
    const id = params?.id

    if (!id) {
      console.log("[API /users/[id]] Missing user id in params")
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "ID de usuario no proporcionado" } },
        { status: 400 }
      )
    }
    console.log("[API /users/[id]] PATCH request for user:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /users/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /users/[id]] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level >= 3 && currentUser.id !== id) {
      console.log("[API /users/[id]] Insufficient permissions")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes permisos para modificar este usuario" } },
        { status: 403 }
      )
    }

    const existingUser = await getUserById(id)

    if (!existingUser) {
      console.log("[API /users/[id]] User not found")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const newLevel = validatedData.level ?? existingUser.level
    const newManagerId = validatedData.managerId !== undefined
      ? validatedData.managerId
      : (existingUser.managerId ?? null)
    const newTeamId = validatedData.teamId !== undefined
      ? validatedData.teamId
      : (existingUser.teamId ?? null)

    const validation = await validateManagerAssignment(id, newManagerId, newLevel, newTeamId)

    if (!validation.valid) {
      console.log("[API /users/[id]] Manager assignment validation failed:", validation.error)
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validation.error } },
        { status: 400 }
      )
    }

    console.log("[API /users/[id]] Updating user:", id)

    const updatedUser = await updateUser(id, validatedData)

    if (!updatedUser) {
      console.log("[API /users/[id]] User not found for update")
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    console.log("[API /users/[id]] User updated:", updatedUser.id)

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error: unknown) {
    console.error("[API /users/[id]] Error:", error)

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
        error: { code: "INTERNAL_ERROR", message: "Error al actualizar el usuario" }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params
    const id = params?.id

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "ID de usuario no proporcionado" } },
        { status: 400 }
      )
    }
    console.log("[API /users/[id]] DELETE request for user:", id)

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario actual no encontrado" } },
        { status: 404 }
      )
    }

    const targetUser = await getUserById(id)
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (!canManageUser(currentUser, targetUser.level)) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes permisos para eliminar este usuario" } },
        { status: 403 }
      )
    }

    const deleted = await deleteUser(id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "DELETE_ERROR", message: "Error al eliminar usuario" } },
        { status: 500 }
      )
    }

    console.log("[API /users/[id]] User deleted:", id)

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error("[API /users/[id]] Error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al eliminar usuario" } },
      { status: 500 }
    )
  }
}
