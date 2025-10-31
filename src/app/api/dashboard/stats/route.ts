import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { deals, dealStages, users, teams } from "@/lib/db/schema"
import { inArray, sql, and, gte, lte, isNull } from "drizzle-orm"
import { getUserById, getUsersByLevel } from "@/lib/services/user.service"
import type { DashboardStatsExtended, StageStats, TeamStats } from "@/lib/types"

const OPEN_NEGOTIATIONS_STAGES = [
  "Oportunidad identificada",
  "Cotización generada y enviada",
  "Aprobación pendiente",
  "Orden de compra generada"
]

const ONGOING_PROJECTS_STAGES = [
  "Anticipo pagado",
  "Proyectos en curso",
  "Facturación final"
]

const FINISHED_PROJECTS_STAGE = "Proyectos terminados"
const LOST_PROJECTS_STAGE = "Proyectos perdidos"

export async function GET(request: NextRequest) {
  try {
    console.log("[API /dashboard/stats] GET request received")

    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      console.log("[API /dashboard/stats] No session found")
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autorizado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)

    if (!currentUser) {
      console.log("[API /dashboard/stats] Current user not found")
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    const currency = searchParams.get("currency") || "USD"
    const teamLeaderId = searchParams.get("teamLeaderId")

    console.log("[API /dashboard/stats] Filters - from:", fromDate, "to:", toDate, "currency:", currency, "teamLeaderId:", teamLeaderId)

    let visibleUsers = await getUsersByLevel(currentUser)

    if (teamLeaderId) {
      const teamLeader = visibleUsers.find(u => u.id === teamLeaderId)
      if (teamLeader && teamLeader.teamId) {
        visibleUsers = visibleUsers.filter(u => u.teamId === teamLeader.teamId)
        console.log("[API /dashboard/stats] Filtered by team leader:", teamLeaderId, "team:", teamLeader.teamId)
      } else if (teamLeader) {
        visibleUsers = [teamLeader]
        console.log("[API /dashboard/stats] Leader has no team, showing only leader's deals")
      }
    }

    const visibleUserIds = visibleUsers.map(u => u.id)

    console.log("[API /dashboard/stats] Visible users:", visibleUserIds.length)

    const dateConditions = []
    if (fromDate) {
      dateConditions.push(gte(deals.createdAt, new Date(fromDate)))
    }
    if (toDate) {
      dateConditions.push(lte(deals.createdAt, new Date(toDate)))
    }

    const baseWhere = dateConditions.length > 0
      ? and(
          visibleUserIds.length > 0 ? inArray(deals.userId, visibleUserIds) : sql`1=0`,
          ...dateConditions
        )
      : (visibleUserIds.length > 0 ? inArray(deals.userId, visibleUserIds) : sql`1=0`)

    const allStages = await db.select().from(dealStages).orderBy(dealStages.order)

    const amountField = currency === "USD" ? deals.amountUsd : deals.amountArs

    const dealsWithStagesAndTeams = await db
      .select({
        dealId: deals.id,
        userId: deals.userId,
        amount: amountField,
        stageName: dealStages.name,
        stageId: deals.stageId,
        teamId: users.teamId,
        userName: users.name,
      })
      .from(deals)
      .leftJoin(dealStages, sql`${deals.stageId} = ${dealStages.id}`)
      .leftJoin(users, sql`${deals.userId} = ${users.id}`)
      .where(baseWhere)

    const teamData = await db
      .select({
        teamId: teams.id,
        teamName: teams.name,
      })
      .from(teams)

    const teamMap = new Map(teamData.map(t => [t.teamId, t.teamName]))

    let openNegotiationsCount = 0
    let openNegotiationsAmount = 0
    let ongoingProjectsCount = 0
    let ongoingProjectsAmount = 0
    let finishedProjectsCount = 0
    let finishedProjectsAmount = 0
    let lostProjectsCount = 0
    let lostProjectsAmount = 0

    const stageStatsMap = new Map<string, { count: number; amount: number; name: string }>()
    const openNegTeamMap = new Map<string | null, { count: number; amount: number; name: string }>()
    const ongoingProjTeamMap = new Map<string | null, { count: number; amount: number; name: string }>()

    allStages.forEach(stage => {
      stageStatsMap.set(stage.id, { count: 0, amount: 0, name: stage.name })
    })

    for (const deal of dealsWithStagesAndTeams) {
      const amount = Number(deal.amount) || 0
      const stageName = deal.stageName || ""

      if (stageStatsMap.has(deal.stageId)) {
        const stats = stageStatsMap.get(deal.stageId)!
        stats.count += 1
        stats.amount += amount
      }

      if (OPEN_NEGOTIATIONS_STAGES.includes(stageName)) {
        openNegotiationsCount += 1
        openNegotiationsAmount += amount

        const teamKey = deal.teamId || null
        if (!openNegTeamMap.has(teamKey)) {
          const teamName = teamKey ? (teamMap.get(teamKey) || "Sin equipo") : "Sin equipo"
          openNegTeamMap.set(teamKey, { count: 0, amount: 0, name: teamName })
        }
        const teamStats = openNegTeamMap.get(teamKey)!
        teamStats.count += 1
        teamStats.amount += amount

        if (currentUser.level === 2) {
          const userKey = deal.userId
          if (!openNegTeamMap.has(userKey)) {
            openNegTeamMap.set(userKey, { count: 0, amount: 0, name: deal.userName || "Usuario" })
          }
          const userStats = openNegTeamMap.get(userKey)!
          userStats.count += 1
          userStats.amount += amount
        }
      }

      if (ONGOING_PROJECTS_STAGES.includes(stageName)) {
        ongoingProjectsCount += 1
        ongoingProjectsAmount += amount

        const teamKey = deal.teamId || null
        if (!ongoingProjTeamMap.has(teamKey)) {
          const teamName = teamKey ? (teamMap.get(teamKey) || "Sin equipo") : "Sin equipo"
          ongoingProjTeamMap.set(teamKey, { count: 0, amount: 0, name: teamName })
        }
        const teamStats = ongoingProjTeamMap.get(teamKey)!
        teamStats.count += 1
        teamStats.amount += amount

        if (currentUser.level === 2) {
          const userKey = deal.userId
          if (!ongoingProjTeamMap.has(userKey)) {
            ongoingProjTeamMap.set(userKey, { count: 0, amount: 0, name: deal.userName || "Usuario" })
          }
          const userStats = ongoingProjTeamMap.get(userKey)!
          userStats.count += 1
          userStats.amount += amount
        }
      }

      if (stageName === FINISHED_PROJECTS_STAGE) {
        finishedProjectsCount += 1
        finishedProjectsAmount += amount
      }

      if (stageName === LOST_PROJECTS_STAGE) {
        lostProjectsCount += 1
        lostProjectsAmount += amount
      }
    }

    const stageStats: StageStats[] = Array.from(stageStatsMap.entries()).map(([stageId, stats]) => ({
      stageId,
      stageName: stats.name,
      count: stats.count,
      totalAmount: stats.amount,
    }))

    const openNegTeamStats: TeamStats[] = Array.from(openNegTeamMap.entries()).map(([teamId, stats]) => ({
      teamId,
      teamName: stats.name,
      count: stats.count,
      totalAmount: stats.amount,
    }))

    const ongoingProjTeamStats: TeamStats[] = Array.from(ongoingProjTeamMap.entries()).map(([teamId, stats]) => ({
      teamId,
      teamName: stats.name,
      count: stats.count,
      totalAmount: stats.amount,
    }))

    const result: DashboardStatsExtended = {
      openNegotiations: {
        count: openNegotiationsCount,
        amount: openNegotiationsAmount,
      },
      ongoingProjects: {
        count: ongoingProjectsCount,
        amount: ongoingProjectsAmount,
      },
      finishedProjects: {
        count: finishedProjectsCount,
        amount: finishedProjectsAmount,
      },
      lostProjects: {
        count: lostProjectsCount,
        amount: lostProjectsAmount,
      },
      stageStats,
      teamStats: {
        openNegotiations: openNegTeamStats,
        ongoingProjects: ongoingProjTeamStats,
      },
    }

    console.log("[API /dashboard/stats] Stats calculated successfully")

    return NextResponse.json({
      success: true,
      data: result,
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
