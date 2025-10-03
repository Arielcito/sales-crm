"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Mail, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/types"
import { canManageUser } from "@/lib/utils"

interface ColumnActionsProps {
  user: User
  currentUser: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  allUsers: User[]
}

function ColumnActions({ user, currentUser, onEdit, onDelete, allUsers }: ColumnActionsProps) {
  const canManage = canManageUser(currentUser, user.level)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
          Copiar email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(user)} disabled={!canManage}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(user)} disabled={!canManage} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function createUsersColumns(
  currentUser: User,
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  allUsers: User[]
): ColumnDef<User>[] {
  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case 2:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case 3:
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case 4:
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Ejecutivo"
      case 2:
        return "Director"
      case 3:
        return "Senior"
      case 4:
        return "Junior"
      default:
        return "Desconocido"
    }
  }

  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Rol
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("role")}</span>
      },
    },
    {
      accessorKey: "level",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Nivel
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const level = row.getValue("level") as number
        return (
          <Badge variant="outline" className={getLevelBadgeColor(level)}>
            Nivel {level} - {getLevelLabel(level)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "managerId",
      header: "Gerente",
      cell: ({ row }) => {
        const user = row.original
        if (!user.managerId) return <span className="text-muted-foreground text-sm">Sin gerente</span>
        const manager = allUsers.find((u) => u.id === user.managerId)
        return <span className="text-sm">{manager?.name || "N/A"}</span>
      },
    },
    {
      accessorKey: "teamId",
      header: "Equipo",
      cell: ({ row }) => {
        const user = row.original
        if (!user.teamId) return <span className="text-muted-foreground text-sm">Sin equipo</span>
        return <span className="text-xs text-muted-foreground">{user.teamId.substring(0, 8)}...</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <ColumnActions
            user={row.original}
            currentUser={currentUser}
            onEdit={onEdit}
            onDelete={onDelete}
            allUsers={allUsers}
          />
        )
      },
    },
  ]
}
