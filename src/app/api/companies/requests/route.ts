import { NextRequest, NextResponse } from "next/server"
import { getPendingCompanyRequests, createCompanyRequest } from "@/lib/services/company-request.service"
import { getUserById } from "@/lib/services/user.service"
import { createCompanyRequestSchema } from "@/lib/schemas/company"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ZodError } from "zod"

export async function GET() {
  try {
    console.log("[API /companies/requests] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /companies/requests] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /companies/requests] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level !== 1) {
      console.log("[API /companies/requests] User not authorized to view requests")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo nivel 1 puede ver solicitudes" } },
        { status: 403 }
      )
    }

    const requests = await getPendingCompanyRequests()

    console.log("[API /companies/requests] Returning requests:", requests.length)

    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error("[API /companies/requests] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener solicitudes" }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API /companies/requests] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /companies/requests] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /companies/requests] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    if (currentUser.level === 1) {
      console.log("[API /companies/requests] Level 1 users don't need to request companies")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Nivel 1 puede crear empresas directamente" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createCompanyRequestSchema.parse(body)

    console.log("[API /companies/requests] Creating request:", validatedData.companyName)

    const companyRequest = await createCompanyRequest(validatedData, session.user.id)

    console.log("[API /companies/requests] Request created:", companyRequest.id)

    return NextResponse.json({ success: true, data: companyRequest }, { status: 201 })
  } catch (error: unknown) {
    console.error("[API /companies/requests] Error:", error)

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
        error: { code: "INTERNAL_ERROR", message: "Error al crear solicitud" }
      },
      { status: 500 }
    )
  }
}
