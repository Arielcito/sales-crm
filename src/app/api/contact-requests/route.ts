import { NextResponse } from "next/server"
import { getContactAccessRequests } from "@/lib/services/contact-permission.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
  try {
    console.log("[API /contact-requests] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /contact-requests] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /contact-requests] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level !== 1) {
      console.log("[API /contact-requests] User not authorized to view requests")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo nivel 1 puede ver solicitudes de acceso" } },
        { status: 403 }
      )
    }

    const requests = await getContactAccessRequests()

    console.log("[API /contact-requests] Returning contact access requests:", requests.length)

    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error("[API /contact-requests] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener solicitudes de acceso" }
      },
      { status: 500 }
    )
  }
}
