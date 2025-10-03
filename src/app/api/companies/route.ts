import { NextResponse } from "next/server"
import { getAllCompanies } from "@/lib/services/company.service"

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
