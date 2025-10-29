"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { User } from "lucide-react"
import type { OrgChartNode } from "@/lib/services/orgchart.service"
import { cn } from "@/lib/utils"

const levelColors = {
  1: "bg-purple-100 text-purple-700 border-purple-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
  3: "bg-green-100 text-green-700 border-green-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
}

const levelLabels = {
  1: "Nivel 1",
  2: "Nivel 2",
  3: "Nivel 3",
  4: "Nivel 4",
}

interface OrgChartNodeProps {
  node: OrgChartNode
  onNodeClick?: (node: OrgChartNode) => void
  isDragging?: boolean
  isOver?: boolean
  canDrop?: boolean
}

export function OrgChartNodeComponent({
  node,
  onNodeClick,
  isDragging,
  isOver,
  canDrop,
}: OrgChartNodeProps) {
  const { user } = node
  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card
      onClick={() => onNodeClick?.(node)}
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2",
        isDragging && "opacity-50 scale-95",
        isOver && canDrop && "border-green-500 scale-105",
        isOver && !canDrop && "border-red-500",
        !isOver && "border-gray-200"
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="bg-muted">
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                levelColors[user.level as keyof typeof levelColors]
              )}
            >
              {levelLabels[user.level as keyof typeof levelLabels]}
            </Badge>
            {node.children.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {node.children.length} subordinado{node.children.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
