"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">SalPip</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">SalPip - Sales Pipeline</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Construido con Next.js, Better Auth, Drizzle ORM, shadcn/ui, Zod y React Query
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Comenzar</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Contactos</CardTitle>
              <CardDescription>
                Mantén el seguimiento de todos tus contactos y relaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organiza tus contactos con campos personalizados, etiquetas y notas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline de Negocios</CardTitle>
              <CardDescription>
                Gestiona tu pipeline de ventas de manera eficiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rastrea los negocios a través de diferentes etapas y cierra más ventas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticación Segura</CardTitle>
              <CardDescription>
                Seguridad de nivel empresarial con Better Auth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Múltiples métodos de autenticación incluyendo email y OAuth
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

