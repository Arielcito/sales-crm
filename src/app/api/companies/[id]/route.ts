import { NextRequest, NextResponse } from "next/server"
import { updateCompany, deleteCompany, getCompanyById } from "@/lib/services/company.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    console.log("[API /companies/[id]] GET request for company:", id)

    const company = await getCompanyById(id)

    if (!company) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Empresa no encontrada" } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: company })
  } catch (error) {
    console.error("[API /companies/[id]] Error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al obtener la empresa" } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    console.log("[API /companies/[id]] PATCH request for company:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /companies/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const body = await request.json()

    console.log("[API /companies/[id]] Updating company:", id)

    const company = await updateCompany(id, body)

    console.log("[API /companies/[id]] Company updated:", company.id)

    return NextResponse.json({ success: true, data: company })
  } catch (error: unknown) {
    console.error("[API /companies/[id]] Error:", error)

    if (error instanceof Error && error.message === "Company not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Empresa no encontrada" } },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al actualizar la empresa" } },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    console.log("[API /companies/[id]] DELETE request for company:", id)

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /companies/[id]] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    await deleteCompany(id)

    console.log("[API /companies/[id]] Company deleted:", id)

    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    console.error("[API /companies/[id]] Error:", error)

    if (error instanceof Error && error.message === "Company not found") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Empresa no encontrada" } },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al eliminar la empresa" } },
      { status: 500 }
    )
  }
}
