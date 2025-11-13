import { NextRequest, NextResponse } from "next/server"
import { updateContact, deleteContact, getContactById } from "@/lib/services/contact.service"
import { getUserById } from "@/lib/services/user.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    console.log("[API /contacts/[id]] GET request for contact:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /contacts/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /contacts/[id]] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const contact = await getContactById(id, currentUser)

    if (!contact) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contacto no encontrado" } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: contact })
  } catch (error) {
    console.error("[API /contacts/[id]] Error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al obtener el contacto" } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    console.log("[API /contacts/[id]] PATCH request for contact:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /contacts/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const body = await request.json()

    console.log("[API /contacts/[id]] Updating contact:", id)

    const contact = await updateContact(id, body)

    console.log("[API /contacts/[id]] Contact updated:", contact.id)

    return NextResponse.json({ success: true, data: contact })
  } catch (error: unknown) {
    console.error("[API /contacts/[id]] Error:", error)

    if (error instanceof Error && error.message === "Contact not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contacto no encontrado" } },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al actualizar el contacto" } },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    console.log("[API /contacts/[id]] DELETE request for contact:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /contacts/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    await deleteContact(id)

    console.log("[API /contacts/[id]] Contact deleted:", id)

    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    console.error("[API /contacts/[id]] Error:", error)

    if (error instanceof Error && error.message === "Contact not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contacto no encontrado" } },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al eliminar el contacto" } },
      { status: 500 }
    )
  }
}
