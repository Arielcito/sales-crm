"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users as UsersIcon, User } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useVisibleUsers } from "@/hooks/use-users"
import { useMemo } from "react"

export default function TeamsPage() {
  const { data: currentUser, isLoading } = useCurrentUser()
  const { data: allUsers = [], isLoading: isLoadingUsers } = useVisibleUsers(currentUser || { id: "", level: 0 } as any)

  const subordinates = useMemo(() => {
    if (!currentUser || (currentUser.level !== 2 && currentUser.level !== 3)) return []
    return allUsers.filter(user => user.managerId === currentUser.id)
  }, [currentUser, allUsers])

  const teamHierarchy = useMemo(() => {
    if (!currentUser || currentUser.level !== 2) return []

    const level3Users = allUsers.filter(user => user.managerId === currentUser.id && user.level === 3)

    return level3Users.map(level3User => ({
      supervisor: level3User,
      employees: allUsers.filter(user => user.managerId === level3User.id && user.level === 4)
    }))
  }, [currentUser, allUsers])

  if (isLoading || isLoadingUsers) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {currentUser?.level === 3 ? "Mi Equipo" : "Gestión de Equipos"}
            </h1>
            <p className="text-muted-foreground mt-1">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.level > 3) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <p className="text-destructive">No tienes permisos para acceder a esta página</p>
          <p className="text-sm text-muted-foreground mt-2">
            No tienes acceso a esta sección
          </p>
        </div>
      </div>
    )
  }

  if (currentUser.level === 2) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Equipo</h1>
              <p className="text-muted-foreground mt-1">
                Supervisores y empleados bajo tu liderazgo
              </p>
            </div>
          </div>

          {teamHierarchy.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No hay equipo asignado</p>
                  <p className="text-sm mt-2">
                    Aún no tienes supervisores ni empleados asignados
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamHierarchy.map(group => (
                <Card key={group.supervisor.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {group.supervisor.name}
                    </CardTitle>
                    <CardDescription>
                      Supervisor - {group.supervisor.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {group.employees.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Sin empleados asignados
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                          Empleados ({group.employees.length})
                        </p>
                        {group.employees.map(employee => (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.email}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">{employee.role}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (currentUser.level === 3) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Equipo</h1>
              <p className="text-muted-foreground mt-1">
                Personas bajo tu supervisión directa
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Subordinados Directos
              </CardTitle>
              <CardDescription>
                Usuarios que reportan directamente a ti
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subordinates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No hay subordinados</p>
                  <p className="text-sm mt-2">
                    Aún no tienes usuarios asignados bajo tu supervisión
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subordinates.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant="secondary">Nivel {user.level}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Equipos</h1>
            <p className="text-muted-foreground mt-1">
              Administra los equipos y asigna usuarios
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Equipo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              Equipos
            </CardTitle>
            <CardDescription>
              Funcionalidad de gestión de equipos en desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Próximamente</p>
              <p className="text-sm mt-2">
                La gestión completa de equipos estará disponible pronto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
