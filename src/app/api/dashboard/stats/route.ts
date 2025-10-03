import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { deals, contacts, dealStages } from "@/lib/db/schema"
import { eq, inArray, sql, and } from "drizzle-orm"
import { getUsersByLevel } from "@/lib/services/user.service"

export async function GET(request: NextRequest) {
  try {
    console.log("[API /dashboard/stats] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
      console.log("[API /dashboard/stats] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as any).role as string,
      level: (session.user as any).level as number,
      managerId: (session.user as any).managerId as string | undefined,
      teamId: (session.user as any).teamId as string | undefined,
      image: session.user.image || undefined,
    }

    console.log("[API /dashboard/stats] Fetching stats for user level:", currentUser.level)

    const visibleUsers = await getUsersByLevel(currentUser)
    const visibleUserIds = visibleUsers.map(u => u.id)

    console.log("[API /dashboard/stats] Visible users:", visibleUserIds.length)

    const [contactsCount, dealsData, dealsByStageData] = await Promise.all([
      db.select({ count: sql<number>`COALESCE(count(*), 0)::int` })
        .from(contacts)
        .where(visibleUserIds.length > 0 ? inArray(contacts.userId, visibleUserIds) : sql`1=0`),

      db.select({
        count: sql<number>`COALESCE(count(*), 0)::int`,
        totalUsd: sql<number>`COALESCE(sum(COALESCE(${deals.amountUsd}::numeric, 0)), 0)`,
        totalArs: sql<number>`COALESCE(sum(COALESCE(${deals.amountArs}::numeric, 0)), 0)`,
      })
        .from(deals)
        .where(visibleUserIds.length > 0 ? inArray(deals.userId, visibleUserIds) : sql`1=0`),

      db.select({
        stageId: deals.stageId,
        count: sql<number>`COALESCE(count(*), 0)::int`,
        totalUsd: sql<number>`COALESCE(sum(COALESCE(${deals.amountUsd}::numeric, 0)), 0)`,
      })
        .from(deals)
        .where(visibleUserIds.length > 0 ? inArray(deals.userId, visibleUserIds) : sql`1=0`)
        .groupBy(deals.stageId),
    ])

    const totalContacts = Number(contactsCount[0]?.count) || 0
    const totalDeals = Number(dealsData[0]?.count) || 0
    const totalRevenueUsd = Number(dealsData[0]?.totalUsd) || 0
    const totalRevenueArs = Number(dealsData[0]?.totalArs) || 0

    const dealsByStage: Record<string, number> = {}
    const revenueByStage: Record<string, number> = {}

    dealsByStageData.forEach(stage => {
      dealsByStage[stage.stageId] = Number(stage.count) || 0
      revenueByStage[stage.stageId] = Number(stage.totalUsd) || 0
    })

    console.log("[API /dashboard/stats] Stats calculated - Contacts:", totalContacts, "Deals:", totalDeals)

    return NextResponse.json({
      success: true,
      data: {
        totalContacts,
        totalDeals,
        totalRevenueUsd,
        totalRevenueArs,
        dealsByStage,
        revenueByStage,
      }
    })
  } catch (error) {
    console.error("[API /dashboard/stats] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener estadísticas" }
      },
      { status: 500 }
    )
  }
}
