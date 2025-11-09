import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { companies } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserById } from "@/lib/services/user.service"

export async function POST(request: NextRequest) {
  try {
    console.log("[API /admin/assign-company] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /admin/assign-company] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser || currentUser.level !== 1) {
      console.log("[API /admin/assign-company] User not authorized")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo nivel 1 puede asignar empresas" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { companyId, assignedTeamId, isGlobal } = body

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "companyId es requerido" } },
        { status: 400 }
      )
    }

    console.log("[API /admin/assign-company] Assigning company:", companyId, "to team:", assignedTeamId, "isGlobal:", isGlobal)

    const result = await db
      .update(companies)
      .set({
        assignedTeamId: assignedTeamId || null,
        isGlobal: isGlobal ?? false,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Empresa no encontrada" } },
        { status: 404 }
      )
    }

    console.log("[API /admin/assign-company] Company assigned successfully")

    return NextResponse.json({
      success: true,
      data: {
        id: result[0].id,
        name: result[0].name,
        assignedTeamId: result[0].assignedTeamId || undefined,
        isGlobal: result[0].isGlobal,
        message: "Empresa asignada correctamente"
      }
    })
  } catch (error) {
    console.error("[API /admin/assign-company] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al asignar empresa" }
      },
      { status: 500 }
    )
  }
}
