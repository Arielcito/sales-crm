import { NextRequest, NextResponse } from "next/server"
import { getAllCompanies, createCompany } from "@/lib/services/company.service"
import { createCompanySchema } from "@/lib/schemas/company"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ZodError } from "zod"

export async function GET() {
  try {
    console.log("[API /companies] GET request received")

    const companies = await getAllCompanies()

    console.log("[API /companies] Returning companies:", companies.length)

    return NextResponse.json({ success: true, data: companies })
  } catch (error) {
    console.error("[API /companies] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener empresas" }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API /companies] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /companies] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCompanySchema.parse(body)

    console.log("[API /companies] Creating company:", validatedData.name)

    const company = await createCompany(validatedData, session.user.id)

    console.log("[API /companies] Company created:", company.id)

    return NextResponse.json({ success: true, data: company }, { status: 201 })
  } catch (error: unknown) {
    console.error("[API /companies] Error:", error)

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
        error: { code: "INTERNAL_ERROR", message: "Error al crear la empresa" }
      },
      { status: 500 }
    )
  }
}
