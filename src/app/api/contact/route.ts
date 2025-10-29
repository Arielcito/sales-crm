import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contactRequests } from "@/lib/db/schema"
import { contactRequestSchema } from "@/lib/schemas/contact-request"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    console.log("[API /contact] POST request received")

    const body = await request.json()
    const validatedData = contactRequestSchema.parse(body)

    console.log("[API /contact] Creating contact request:", validatedData.email)

    const [contactRequest] = await db
      .insert(contactRequests)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company || null,
        phone: validatedData.phone || null,
        message: validatedData.message,
      })
      .returning()

    console.log("[API /contact] Contact request created:", contactRequest.id)

    return NextResponse.json({ success: true, data: contactRequest }, { status: 201 })
  } catch (error: unknown) {
    console.error("[API /contact] Error:", error)

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
        error: { code: "INTERNAL_ERROR", message: "Error al enviar mensaje" }
      },
      { status: 500 }
    )
  }
}
