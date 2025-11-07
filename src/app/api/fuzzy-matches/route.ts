import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { companyRequests, contacts, companies } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserById } from "@/lib/services/user.service"

export async function GET() {
  try {
    console.log("[API /fuzzy-matches] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /fuzzy-matches] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser || currentUser.level !== 1) {
      console.log("[API /fuzzy-matches] User not authorized")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo nivel 1 puede ver solicitudes" } },
        { status: 403 }
      )
    }

    const pendingRequests = await db
      .select()
      .from(companyRequests)
      .where(
        and(
          eq(companyRequests.requestType, "fuzzy_match"),
          eq(companyRequests.status, "pending")
        )
      )

    console.log("[API /fuzzy-matches] Found pending requests:", pendingRequests.length)

    const requestsWithDetails = await Promise.all(
      pendingRequests.map(async (request) => {
        let potentialDuplicate = null

        if (request.potentialDuplicateId) {
          if (request.entityType === "contact") {
            const contact = await db
              .select()
              .from(contacts)
              .where(eq(contacts.id, request.potentialDuplicateId))
              .limit(1)

            if (contact.length > 0) {
              potentialDuplicate = contact[0]
            }
          } else if (request.entityType === "company") {
            const company = await db
              .select()
              .from(companies)
              .where(eq(companies.id, request.potentialDuplicateId))
              .limit(1)

            if (company.length > 0) {
              potentialDuplicate = company[0]
            }
          }
        }

        return {
          ...request,
          potentialDuplicate,
        }
      })
    )

    return NextResponse.json({ success: true, data: requestsWithDetails })
  } catch (error) {
    console.error("[API /fuzzy-matches] Error:", error)
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
    console.log("[API /fuzzy-matches] POST request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /fuzzy-matches] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser || currentUser.level !== 1) {
      console.log("[API /fuzzy-matches] User not authorized")
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo nivel 1 puede aprobar solicitudes" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { requestId, action } = body

    if (!requestId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "requestId y action (approve/reject) son requeridos" }
        },
        { status: 400 }
      )
    }

    const requestData = await db
      .select()
      .from(companyRequests)
      .where(eq(companyRequests.id, requestId))
      .limit(1)

    if (requestData.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Solicitud no encontrada" } },
        { status: 404 }
      )
    }

    const fuzzyRequest = requestData[0]

    if (action === "approve") {
      console.log("[API /fuzzy-matches] Approving request, linking to existing entity:", fuzzyRequest.potentialDuplicateId)

      await db
        .update(companyRequests)
        .set({
          status: "approved",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        })
        .where(eq(companyRequests.id, requestId))

      return NextResponse.json({
        success: true,
        data: {
          message: "Solicitud aprobada. Entidad existente vinculada.",
          entityId: fuzzyRequest.potentialDuplicateId
        }
      })
    } else {
      console.log("[API /fuzzy-matches] Rejecting request, will create new entity")

      if (!fuzzyRequest.submittedData || typeof fuzzyRequest.submittedData !== 'object') {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_DATA", message: "Datos enviados no válidos" } },
          { status: 400 }
        )
      }

      const submittedData = fuzzyRequest.submittedData as Record<string, unknown>

      let newEntity

      if (fuzzyRequest.entityType === "contact") {
        const contactResult = await db.insert(contacts).values({
          name: submittedData.name as string,
          email: submittedData.email as string | undefined,
          phone: submittedData.phone as string | undefined,
          position: submittedData.position as string | undefined,
          status: (submittedData.status as string) || "lead",
          notes: submittedData.notes as string | undefined,
          companyId: submittedData.companyId as string | undefined,
          userId: fuzzyRequest.requestedBy,
        }).returning()

        newEntity = contactResult[0]
      } else if (fuzzyRequest.entityType === "company") {
        const companyResult = await db.insert(companies).values({
          name: submittedData.name as string,
          email: submittedData.email as string | undefined,
          phone: submittedData.phone as string | undefined,
          website: submittedData.website as string | undefined,
          address: submittedData.address as string | undefined,
          industry: submittedData.industry as string | undefined,
          employeeCount: submittedData.employeeCount as number | undefined,
          notes: submittedData.notes as string | undefined,
          assignedTeamId: submittedData.assignedTeamId as string | undefined,
          isGlobal: (submittedData.isGlobal as boolean) ?? false,
          createdBy: fuzzyRequest.requestedBy,
        }).returning()

        newEntity = companyResult[0]
      }

      await db
        .update(companyRequests)
        .set({
          status: "rejected",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        })
        .where(eq(companyRequests.id, requestId))

      console.log("[API /fuzzy-matches] New entity created:", newEntity?.id)

      return NextResponse.json({
        success: true,
        data: {
          message: "Solicitud rechazada. Nueva entidad creada.",
          entityId: newEntity?.id
        }
      })
    }
  } catch (error) {
    console.error("[API /fuzzy-matches] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al procesar solicitud" }
      },
      { status: 500 }
    )
  }
}
