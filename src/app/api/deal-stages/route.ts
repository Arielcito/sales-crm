import { NextResponse } from "next/server"
import { getDealStagesByUser } from "@/lib/services/deal-stage.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

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
