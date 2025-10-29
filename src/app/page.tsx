"use client"

import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect } from "react"
import Link from "next/link"
import { KanbanDemo } from "@/components/landing/kanban-demo"
import { OrgChartDemo } from "@/components/landing/orgchart-demo"
import { FeatureCard } from "@/components/landing/feature-card"
import { ContactForm } from "@/components/landing/contact-form"
import {
  TrendingUp,
  Users,
  Shield,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

export default function Home() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SalPip
            </h1>
          </div>
          <Button asChild className="transition-all duration-300 hover:scale-105">
            <Link href="/auth/signin">
              Iniciar Sesión
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              La forma más inteligente de gestionar ventas
            </div>

            <h2 className="text-5xl md:text-7xl font-bold leading-tight">
              Potencia tu equipo con{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                gestión visual
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Pipeline interactivo, equipos organizados, permisos inteligentes y métricas en
              tiempo real. Todo en una plataforma moderna.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                className="text-lg h-14 px-8 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                asChild
              >
                <a href="#contacto">
                  Solicitar Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 transition-all duration-300 hover:scale-105"
                asChild
              >
                <a href="#features">Conocer Más</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 scroll-mt-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Features que transforman tu negocio
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas diseñadas para equipos modernos que buscan resultados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <FeatureCard
              icon={TrendingUp}
              title="Pipeline Visual Kanban"
              description="Arrastra y suelta negocios entre etapas. Soporte multi-moneda con conversión automática."
              gradient="from-blue-500/20 to-cyan-500/5"
            />
            <FeatureCard
              icon={Users}
              title="Gestión de Equipos"
              description="Organigrama interactivo con estructura jerárquica clara y asignación visual de roles."
              gradient="from-purple-500/20 to-pink-500/5"
            />
            <FeatureCard
              icon={Shield}
              title="Permisos Multi-nivel"
              description="4 niveles de acceso con visibilidad controlada por equipo y jerarquía automática."
              gradient="from-orange-500/20 to-amber-500/5"
            />
            <FeatureCard
              icon={BarChart3}
              title="Métricas en Tiempo Real"
              description="Dashboard con estadísticas actualizadas, filtros por fecha y análisis por equipo."
              gradient="from-green-500/20 to-emerald-500/5"
            />
          </div>
        </section>

        <section className="py-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Pipeline Visual Kanban</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gestiona tu pipeline de ventas con drag & drop. Interactivo y en tiempo real.
            </p>
          </div>

          <Card className="border-2 shadow-2xl overflow-hidden bg-gradient-to-br from-card to-card/50">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="bg-background/50 backdrop-blur-sm">
              <KanbanDemo />
            </div>
          </Card>
        </section>

        <section className="py-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Organigrama Inteligente</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visualiza la estructura de tu equipo con permisos jerárquicos automáticos.
            </p>
          </div>

          <Card className="border-2 shadow-2xl overflow-hidden bg-gradient-to-br from-card to-card/50">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="bg-background/50 backdrop-blur-sm">
              <OrgChartDemo />
            </div>
          </Card>
        </section>

        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Por qué elegir SalPip?
              </h3>
              <div className="space-y-4">
                {[
                  "Interface moderna y minimalista que tu equipo amará",
                  "Configuración lista en minutos, no días",
                  "Permisos automáticos basados en jerarquía",
                  "Multi-moneda con conversión en tiempo real",
                  "Dashboard con métricas que importan",
                  "Arquitectura moderna y escalable",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-lg text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 border-2 shadow-2xl bg-gradient-to-br from-card to-primary/5">
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold mb-2">Stack Tecnológico</h4>
                  <p className="text-muted-foreground">
                    Construido con las tecnologías más modernas y confiables
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Next.js 14",
                    "TypeScript",
                    "PostgreSQL",
                    "Drizzle ORM",
                    "Better Auth",
                    "React Query",
                    "Tailwind CSS",
                    "shadcn/ui",
                  ].map((tech, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-center font-medium transition-all duration-300 hover:scale-105 hover:bg-primary/10"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id="contacto" className="py-20 scroll-mt-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold mb-4">Conversemos</h3>
              <p className="text-xl text-muted-foreground">
                Cuéntanos sobre tu equipo y te mostraremos cómo SalPip puede ayudarte
              </p>
            </div>

            <Card className="p-8 border-2 shadow-2xl bg-gradient-to-br from-card to-primary/5">
              <ContactForm />
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-12 mt-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SalPip
            </h1>
          </div>
          <p className="text-muted-foreground mb-4">
            La plataforma moderna para gestión de ventas
          </p>
          <p className="text-sm text-muted-foreground">
            © 2025 SalPip. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
