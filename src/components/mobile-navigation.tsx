"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Kanban, Users, Settings, LogOut, Menu, X, Building2 } from "lucide-react"
import type { User } from "@/lib/types"

interface MobileNavigationProps {
  currentUser: User
  activeView: string
  onViewChange: (view: string) => void
  onLogout: () => void
}

export function MobileNavigation({ currentUser, activeView, onViewChange, onLogout }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { id: "dashboard", label: "Panel de Control", icon: BarChart3 },
    { id: "kanban", label: "Pipeline de Ventas", icon: Kanban },
    { id: "companies", label: "Empresas y Contactos", icon: Building2 },
    { id: "users", label: "Gestión de Usuarios", icon: Users, levelRequired: 1 },
    { id: "currency", label: "Cotizaciones", icon: Settings },
  ]

  const handleViewChange = (view: string) => {
    onViewChange(view)
    setIsOpen(false)
  }

  return (
    <div className="md:hidden border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
          </div>
          <h1 className="text-lg font-bold text-foreground">CRM Pro</h1>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h2 className="text-lg font-semibold">Menú</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="p-1">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="py-4 border-b border-border">
                <div className="text-sm mb-2">
                  <span className="text-muted-foreground">Bienvenido,</span>{" "}
                  <span className="font-semibold text-foreground">{currentUser.name}</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                  Nivel {currentUser.level} - {currentUser.role}
                </Badge>
              </div>

              <nav className="flex-1 py-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    if (item.levelRequired && currentUser.level !== item.levelRequired) {
                      return null
                    }

                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={activeView === item.id ? "default" : "ghost"}
                        className={`w-full justify-start space-x-3 h-12 ${
                          activeView === item.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => handleViewChange(item.id)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </nav>

              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-start space-x-3 h-12 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
                  onClick={() => {
                    onLogout()
                    setIsOpen(false)
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
