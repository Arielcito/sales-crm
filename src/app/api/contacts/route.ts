import { NextResponse } from "next/server"
import { getAllContacts } from "@/lib/services/contact.service"

export async function GET() {
  try {
    console.log("[API /contacts] GET request received")

    const contacts = await getAllContacts()

    console.log("[API /contacts] Returning contacts:", contacts.length)

    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error("[API /contacts] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener contactos" }
      },
      { status: 500 }
    )
  }
}
