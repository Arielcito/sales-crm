import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dealHistory, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params

    console.log("[DealHistory API] Fetching history for deal:", dealId)

    const history = await db
      .select({
        id: dealHistory.id,
        dealId: dealHistory.dealId,
        userId: dealHistory.userId,
        fromStageId: dealHistory.fromStageId,
        toStageId: dealHistory.toStageId,
        changeType: dealHistory.changeType,
        fieldName: dealHistory.fieldName,
        oldValue: dealHistory.oldValue,
        newValue: dealHistory.newValue,
        notes: dealHistory.notes,
        createdAt: dealHistory.createdAt,
        userName: users.name,
      })
      .from(dealHistory)
      .leftJoin(users, eq(dealHistory.userId, users.id))
      .where(eq(dealHistory.dealId, dealId))
      .orderBy(desc(dealHistory.createdAt))

    console.log("[DealHistory API] Found history records:", history.length)

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error) {
    console.error("[DealHistory API] Error fetching history:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Error al obtener el historial del deal",
          details: error instanceof Error ? [error.message] : [],
        },
      },
      { status: 500 }
    )
  }
}
