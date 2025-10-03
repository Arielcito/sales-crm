"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Kanban,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react"
import { signOut } from "@/lib/auth-client"
import type { User, NavigationItem, ViewType } from "@/lib/types"

interface AppSidebarProps {
  currentUser: User
}

export function AppSidebar({ currentUser }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems: NavigationItem[] = [
    { id: "dashboard", label: "Panel de Control", icon: LayoutDashboard },
    { id: "kanban", label: "Pipeline de Ventas", icon: Kanban },
    { id: "companies", label: "Empresas y Contactos", icon: Building2 },
    { id: "users", label: "Gestión de Usuarios", icon: Users, levelRequired: 1 },
    { id: "currency", label: "Cotizaciones", icon: Settings },
  ]

  const handleViewChange = (view: ViewType) => {
    router.push(`/${view}`)
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/signin")
  }

  const getActiveView = (): ViewType | null => {
    const path = pathname.split("/")[1] as ViewType
    return navigationItems.find((item) => item.id === path)?.id || null
  }

  const activeView = getActiveView()

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-5 h-5 bg-primary-foreground rounded-md"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">CRM Pro</h1>
            <p className="text-xs text-sidebar-foreground/60">Sales Pipeline</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                if (item.levelRequired && currentUser.level !== item.levelRequired) {
                  return null
                }

                const Icon = item.icon
                const isActive = activeView === item.id

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleViewChange(item.id)}
                      isActive={isActive}
                      className={`h-11 px-4 transition-all duration-200 ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left text-sm">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-2" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-xl p-4 mb-3">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60">{currentUser.role}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary/20 text-primary border-0 text-xs font-medium w-full justify-center"
          >
            Nivel {currentUser.level}
          </Badge>
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start h-10 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="text-sm">Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
