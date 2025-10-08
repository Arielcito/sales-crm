import { NextRequest, NextResponse } from "next/server"
import { getOrCreateExchangeRate } from "@/lib/services/exchange-rate.service"

interface DolarApiResponse {
  moneda: string
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

export async function GET() {
  try {
    console.log("[API /exchange-rate] Fetching exchange rate from dolarapi.com")

    const response = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate")
    }

    const data: DolarApiResponse = await response.json()

    console.log("[API /exchange-rate] Exchange rate fetched:", data.venta)

    return NextResponse.json({
      success: true,
      data: {
        usdToArs: data.venta.toString(),
      },
    })
  } catch (error) {
    console.error("[API /exchange-rate] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener la cotización" },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API /exchange-rate] POST request received")

    const body = await request.json()
    const { usdToArs } = body

    if (!usdToArs) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "usdToArs is required" },
        },
        { status: 400 }
      )
    }

    const exchangeRate = await getOrCreateExchangeRate(usdToArs)

    console.log("[API /exchange-rate] Exchange rate saved:", exchangeRate.id)

    return NextResponse.json({
      success: true,
      data: exchangeRate,
    })
  } catch (error) {
    console.error("[API /exchange-rate] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al guardar la cotización" },
      },
      { status: 500 }
    )
  }
}
