import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { createUserSchema } from "@/lib/schemas/user"
import { getAllUsers, getUserById } from "@/lib/services/user.service"
import { canManageUser } from "@/lib/utils"
import { ZodError } from "zod"

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

export async function POST(request: NextRequest) {
  try {
    console.log("[API /users] POST request received")

    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No autenticado" } },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(session.user.id)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado" } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    if (!canManageUser(currentUser, validatedData.level)) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes permisos para crear usuarios de este nivel" } },
        { status: 403 }
      )
    }

    if (validatedData.level === 1 && currentUser.level !== 1) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo el Super Admin puede crear otro nivel 1" } },
        { status: 403 }
      )
    }

    if (validatedData.level === 2 && currentUser.level !== 1) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Solo el nivel 1 puede crear líderes de equipo (nivel 2)" } },
        { status: 403 }
      )
    }

    const [existingUser] = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_EXISTS", message: "El email ya está registrado" } },
        { status: 400 }
      )
    }

    const signUpResult = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
      }),
    })

    if (!signUpResult.ok) {
      const error = await signUpResult.json()
      return NextResponse.json(
        { success: false, error: { code: "AUTH_ERROR", message: error.message || "Error al crear usuario" } },
        { status: signUpResult.status }
      )
    }

    const [updatedUser] = await db.update(users).set({
      role: validatedData.role,
      level: validatedData.level,
      managerId: validatedData.managerId || null,
      teamId: validatedData.teamId || null,
    }).where(eq(users.email, validatedData.email)).returning()

    console.log("[API /users] User created:", updatedUser.id)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        level: updatedUser.level,
        managerId: updatedUser.managerId,
        teamId: updatedUser.teamId,
        image: updatedUser.image,
      }
    }, { status: 201 })
  } catch (error: unknown) {
    console.error("[API /users] Error:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: error.issues } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error al crear usuario" } },
      { status: 500 }
    )
  }
}
