import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserById, getUsersByLevel } from "@/lib/services/user.service"

export async function GET(request: NextRequest) {
  try {
    console.log("[API /users/by-level] GET request received")

    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const visibleUsers = await getUsersByLevel(currentUser)

    console.log("[API /users/by-level] Returning visible users:", visibleUsers.length)

    return NextResponse.json({ success: true, data: visibleUsers })
  } catch (error) {
    console.error("[API /users/by-level] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener usuarios" }
      },
      { status: 500 }
    )
  }
}
