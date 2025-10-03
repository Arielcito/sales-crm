import { NextResponse } from "next/server"
import { getAllUsers } from "@/lib/services/user.service"

export async function GET() {
  try {
    console.log("[API /users] GET request received")

    const users = await getAllUsers()

    console.log("[API /users] Returning users:", users.length)

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error("[API /users] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Error al obtener usuarios" }
      },
      { status: 500 }
    )
  }
}
