import { NextResponse } from "next/server"
import { getAllDealStages } from "@/lib/services/deal-stage.service"

export async function GET() {
  try {
    console.log("[API /deal-stages] GET request received")

    const stages = await getAllDealStages()

    console.log("[API /deal-stages] Returning stages:", stages.length)

    return NextResponse.json({ success: true, data: stages })
  } catch (error) {
    console.error("[API /deal-stages] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener etapas" }
      },
      { status: 500 }
    )
  }
}
