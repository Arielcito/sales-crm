"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Users, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User as UserType, Team } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const levelColors = {
  1: "bg-purple-100 text-purple-700 border-purple-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
  3: "bg-green-100 text-green-700 border-green-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
}

const levelLabels = {
  1: "Nivel 1 - Ejecutivo",
  2: "Nivel 2 - Líder de Equipo",
  3: "Nivel 3 - Senior",
  4: "Nivel 4 - Junior",
}

interface UserDetailModalProps {
  user: UserType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (user: UserType) => void
  manager?: UserType | null
  team?: Team | null
  subordinatesCount?: number
}

export function UserDetailModal({
  user,
  open,
  onOpenChange,
  onEdit,
  manager,
  team,
  subordinatesCount = 0,
}: UserDetailModalProps) {
  if (!user) return null

  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback className="bg-muted text-lg">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "mt-2",
                  levelColors[user.level as keyof typeof levelColors]
                )}
              >
                {levelLabels[user.level as keyof typeof levelLabels]}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Rol:</span>
              <span className="font-medium">{user.role}</span>
            </div>

            {team && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Equipo:</span>
                <span className="font-medium">{team.name}</span>
              </div>
            )}

            {manager && (
              <div className="flex items-center gap-3 text-sm">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reporta a:</span>
                <span className="font-medium">{manager.name}</span>
              </div>
            )}

            {subordinatesCount > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Subordinados:</span>
                <span className="font-medium">
                  {subordinatesCount} {subordinatesCount === 1 ? "persona" : "personas"}
                </span>
              </div>
            )}
          </div>

          {onEdit && (
            <>
              <Separator />
              <Button onClick={() => onEdit(user)} className="w-full">
                Editar Usuario
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
