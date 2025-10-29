"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockUsers, mockTeams } from "@/lib/mock-data"
import { Building2, Users } from "lucide-react"
import type { User } from "@/lib/types"

interface OrgNode {
  user: User
  children: OrgNode[]
  teamName?: string
}

export function OrgChartDemo() {
  const buildTree = (): OrgNode[] => {
    const userMap = new Map<string, OrgNode>()

    mockUsers.forEach(user => {
      userMap.set(user.id, {
        user,
        children: [],
        teamName: mockTeams.find(t => t.id === user.teamId)?.name,
      })
    })

    const roots: OrgNode[] = []

    mockUsers.forEach(user => {
      const node = userMap.get(user.id)!
      if (user.managerId) {
        const parent = userMap.get(user.managerId)
        parent?.children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  const tree = buildTree()

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50"
      case 2:
        return "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50"
      case 3:
        return "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50"
      default:
        return "bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-500/50"
    }
  }

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return { label: "Nivel 1", variant: "default" as const }
      case 2:
        return { label: "Nivel 2", variant: "secondary" as const }
      case 3:
        return { label: "Nivel 3", variant: "outline" as const }
      default:
        return { label: "Nivel 4", variant: "outline" as const }
    }
  }

  const renderNode = (node: OrgNode): React.ReactElement => {
    const levelBadge = getLevelBadge(node.user.level)

    return (
      <div key={node.user.id} className="flex flex-col items-center gap-4">
        <Card
          className={`w-64 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${getLevelColor(
            node.user.level
          )}`}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <Badge variant={levelBadge.variant} className="text-xs">
                  {levelBadge.label}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-base">{node.user.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{node.user.role}</p>
              </div>

              {node.teamName && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{node.teamName}</span>
                </div>
              )}

              {node.children.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {node.children.length} subordinado{node.children.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {node.children.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-0.5 bg-border" />
            <div className="flex gap-8 flex-wrap justify-center">
              {node.children.map(child => renderNode(child))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="inline-flex flex-col gap-8 min-w-full items-center p-8">
        {tree.map(root => renderNode(root))}
      </div>
    </div>
  )
}
