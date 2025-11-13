import { NextRequest, NextResponse } from "next/server"
import { requestContactAccess } from "@/lib/services/contact-permission.service"
import { getContactById } from "@/lib/services/contact.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: contactId } = await context.params
    console.log("[API /contacts/[id]/request-access] POST request for contact:", contactId)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /contacts/[id]/request-access] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /contacts/[id]/request-access] User not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level === 1) {
      console.log("[API /contacts/[id]/request-access] Level 1 users don't need to request access")
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Los usuarios de nivel 1 tienen acceso automático" } },
        { status: 400 }
      )
    }

    const contact = await getContactById(contactId)

    if (!contact) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contacto no encontrado" } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { reason } = body

    const accessRequest = await requestContactAccess(currentUser.id, contactId, reason)

    console.log("[API /contacts/[id]/request-access] Access request created:", accessRequest.id)

    return NextResponse.json({ success: true, data: accessRequest })
  } catch (error) {
    console.error("[API /contacts/[id]/request-access] Error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al solicitar acceso" } },
      { status: 500 }
    )
  }
}
