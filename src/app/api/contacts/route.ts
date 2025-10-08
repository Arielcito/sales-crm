import { NextRequest, NextResponse } from "next/server"
import { getAllContacts, createContact } from "@/lib/services/contact.service"
import { createContactSchema } from "@/lib/schemas/contact"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ZodError } from "zod"

export async function GET() {
  try {
    console.log("[API /contacts] GET request received")

    const contacts = await getAllContacts()

    console.log("[API /contacts] Returning contacts:", contacts.length)

    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error("[API /contacts] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener contactos" }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API /contacts] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /contacts] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createContactSchema.parse(body)

    console.log("[API /contacts] Creating contact:", validatedData.name)

    const contact = await createContact(validatedData, session.user.id)

    console.log("[API /contacts] Contact created:", contact.id)

    return NextResponse.json({ success: true, data: contact }, { status: 201 })
  } catch (error: unknown) {
    console.error("[API /contacts] Error:", error)

    if (error instanceof ZodError) {
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
        error: { code: "INTERNAL_ERROR", message: "Error al crear el contacto" }
      },
      { status: 500 }
    )
  }
}
