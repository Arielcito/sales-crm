import { NextRequest, NextResponse } from "next/server"
import { approveContactAccessRequest, rejectContactAccessRequest } from "@/lib/services/contact-permission.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[API /contact-requests/:id] PATCH request received for:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /contact-requests/:id] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /contact-requests/:id] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level !== 1) {
      console.log("[API /contact-requests/:id] User not authorized to review requests")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo nivel 1 puede revisar solicitudes de acceso" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const action = body.action

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ACTION", message: "Acción inválida" } },
        { status: 400 }
      )
    }

    const contactAccessRequest = action === "approve"
      ? await approveContactAccessRequest(id, session.user.id)
      : await rejectContactAccessRequest(id, session.user.id)

    console.log("[API /contact-requests/:id] Request", action, ":", contactAccessRequest.id)

    return NextResponse.json({ success: true, data: contactAccessRequest })
  } catch (error: unknown) {
    console.error("[API /contact-requests/:id] Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al actualizar solicitud de acceso" }
      },
      { status: 500 }
    )
  }
}
