import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().optional().default("vendedor"),
  level: z.number().int().min(1).max(4).optional().default(4),
  managerId: z.string().uuid().optional().nullable(),
  teamId: z.string().uuid().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = signupSchema.parse(body);

    // Verificar si el email ya existe
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Si tiene managerId, verificar que el manager exista
    if (validatedData.managerId) {
      const manager = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, validatedData.managerId))
        .limit(1);

      if (manager.length === 0) {
        return NextResponse.json(
          { error: "Manager not found" },
          { status: 400 }
        );
      }
    }

    // Si tiene teamId, verificar que el team exista
    if (validatedData.teamId) {
      const team = await db
        .select()
        .from(schema.teams)
        .where(eq(schema.teams.id, validatedData.teamId))
        .limit(1);

      if (team.length === 0) {
        return NextResponse.json(
          { error: "Team not found" },
          { status: 400 }
        );
      }
    }

    // Crear usuario usando Better Auth
    const signUpResult = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
      }),
    });

    if (!signUpResult.ok) {
      const error = await signUpResult.json();
      return NextResponse.json(
        { error: error.message || "Failed to create user" },
        { status: signUpResult.status }
      );
    }

    // Actualizar usuario con campos adicionales
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        role: validatedData.role,
        level: validatedData.level,
        managerId: validatedData.managerId || null,
        teamId: validatedData.teamId || null,
      })
      .where(eq(schema.users.email, validatedData.email))
      .returning();

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          level: updatedUser.level,
          managerId: updatedUser.managerId,
          teamId: updatedUser.teamId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
