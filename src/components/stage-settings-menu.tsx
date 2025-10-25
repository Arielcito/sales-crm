"use client"

import { MoreVertical, Edit, Plus, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { DealStage } from "@/lib/types"

interface StageSettingsMenuProps {
  stage: DealStage
  onEdit: (stage: DealStage) => void
  onCreate: () => void
  onToggleActive: (stage: DealStage) => void
  isAdmin: boolean
}

export function StageSettingsMenu({ stage, onEdit, onCreate, onToggleActive, isAdmin }: StageSettingsMenuProps) {
  if (!isAdmin) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onEdit(stage)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar etapa</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Nueva etapa</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleActive(stage)}
          className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
        >
          <EyeOff className="mr-2 h-4 w-4" />
          <span>{stage.isActive ? "Inactivar" : "Activar"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
