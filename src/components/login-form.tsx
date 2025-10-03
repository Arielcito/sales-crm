"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/lib/types"
import { useUsers } from "@/hooks/use-users"

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [selectedEmail, setSelectedEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { data: demoUsers = [] } = useUsers()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmail) return

    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = demoUsers.find((demoUser) => demoUser.email === selectedEmail)
    if (user) onLogin(user as User)

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center space-y-3 md:space-y-4 pb-4 md:pb-6">
          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-lg"></div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">CRM Demo</CardTitle>
          <CardDescription className="text-muted-foreground text-balance text-sm md:text-base">
            Selecciona un usuario demo para explorar diferentes niveles de permisos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="user-select" className="text-sm font-medium">
                Usuario Demo
              </Label>
              <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                <SelectTrigger className="h-10 md:h-12">
                  <SelectValue placeholder="Selecciona un usuario demo" />
                </SelectTrigger>
                <SelectContent>
                  {demoUsers.map((user) => (
                    <SelectItem key={user.id} value={user.email} className="py-2 md:py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">{user.name}</span>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {user.role} (Nivel {user.level})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-10 md:h-12 button-primary font-semibold text-sm md:text-base"
              disabled={!selectedEmail || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Acceder al CRM"
              )}
            </Button>
          </form>

          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted/50 rounded-lg space-y-2 md:space-y-3">
            <p className="font-semibold text-xs md:text-sm text-foreground">Niveles de Permisos:</p>
            <ul className="space-y-1 md:space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-chart-1 rounded-full mt-1 flex-shrink-0"></div>
                <span className="text-balance">
                  <strong>Nivel 1 (CEO):</strong> Ver todos los negocios y usuarios
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full mt-1 flex-shrink-0"></div>
                <span className="text-balance">
                  <strong>Nivel 2 (Director):</strong> Ver negocios del equipo
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-chart-3 rounded-full mt-1 flex-shrink-0"></div>
                <span className="text-balance">
                  <strong>Nivel 3 (Senior):</strong> Ver reportes directos
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-chart-4 rounded-full mt-1 flex-shrink-0"></div>
                <span className="text-balance">
                  <strong>Nivel 4 (Junior):</strong> Ver solo negocios propios
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
