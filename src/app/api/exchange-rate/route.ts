import { NextResponse } from "next/server"
import { getCurrentExchangeRate } from "@/lib/services/exchange-rate.service"

export async function GET() {
  try {
    const data = await getCurrentExchangeRate()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener tipo de cambio:", error)
    return NextResponse.json({
      success: false,
      error: { code: "EXCHANGE_RATE_ERROR", message: "Error al obtener tipo de cambio" }
    }, { status: 500 })
  }
}
