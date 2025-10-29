"use client"

import { useState, useMemo } from "react"
import { buildOrgChartTree, canReassignUser, type OrgChartNode } from "@/lib/services/orgchart.service"
import { OrgChartNodeComponent } from "./org-chart-node"
import { UserDetailModal } from "./user-detail-modal"
import { TeamFormModal } from "@/components/teams/team-form-modal"
import { useReassignUser } from "@/hooks/use-users"
import { toast } from "sonner"
import type { User, Team } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"

interface OrgChartProps {
  users: User[]
  teams: Team[]
  currentUser: User
  onCreateUser?: (managerId?: string, teamId?: string) => void
  onEditUser?: (user: User) => void
  onCreateTeam?: () => void
}

export function OrgChart({
  users,
  teams,
  currentUser,
  onCreateUser,
  onEditUser,
  onCreateTeam,
}: OrgChartProps) {
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [dropTarget, setDropTarget] = useState<User | null>(null)

  const reassignUser = useReassignUser()

  const tree = useMemo(() => buildOrgChartTree(users, teams), [users, teams])

  const filteredTree = useMemo(() => {
    if (teamFilter === "all") return tree

    const filterByTeam = (nodes: OrgChartNode[]): OrgChartNode[] => {
      return nodes
        .filter(node => {
          if (node.user.level === 1) return true
          if (node.user.teamId === teamFilter) return true
          return node.children.some(child => child.user.teamId === teamFilter)
        })
        .map(node => ({
          ...node,
          children: filterByTeam(node.children),
        }))
    }

    return filterByTeam(tree)
  }, [tree, teamFilter])

  const handleNodeClick = (node: OrgChartNode) => {
    setSelectedNode(node)
  }

  const handleDragStart = (user: User) => {
    setDraggedUser(user)
  }

  const handleDragOver = (e: React.DragEvent, targetUser: User) => {
    e.preventDefault()

    if (!draggedUser || draggedUser.id === targetUser.id) return

    const validation = canReassignUser(draggedUser, targetUser, currentUser)
    if (validation.valid) {
      setDropTarget(targetUser)
    }
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetUser: User) => {
    e.preventDefault()

    if (!draggedUser || draggedUser.id === targetUser.id) {
      setDraggedUser(null)
      setDropTarget(null)
      return
    }

    const validation = canReassignUser(draggedUser, targetUser, currentUser)

    if (!validation.valid) {
      toast.error(validation.error || "No se puede reasignar este usuario")
      setDraggedUser(null)
      setDropTarget(null)
      return
    }

    reassignUser.mutate(
      {
        id: draggedUser.id,
        managerId: targetUser.id,
        teamId: targetUser.teamId,
      },
      {
        onSuccess: () => {
          toast.success(`${draggedUser.name} reasignado a ${targetUser.name}`)
          setDraggedUser(null)
          setDropTarget(null)
        },
        onError: () => {
          setDraggedUser(null)
          setDropTarget(null)
        },
      }
    )
  }

  const renderNode = (node: OrgChartNode, index: number) => {
    const isDragging = draggedUser?.id === node.user.id
    const isOver = dropTarget?.id === node.user.id
    const canDrop = draggedUser
      ? canReassignUser(draggedUser, node.user, currentUser).valid
      : false

    return (
      <div key={node.user.id} className="flex flex-col items-center gap-4">
        <div
          draggable={node.user.level > 1}
          onDragStart={() => handleDragStart(node.user)}
          onDragOver={(e) => handleDragOver(e, node.user)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.user)}
          className="relative"
        >
          <OrgChartNodeComponent
            node={node}
            onNodeClick={handleNodeClick}
            isDragging={isDragging}
            isOver={isOver}
            canDrop={canDrop}
          />

          {node.user.level === 2 && currentUser.level <= 2 && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              onClick={(e) => {
                e.stopPropagation()
                onCreateUser?.(node.user.id, node.user.teamId || undefined)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar subordinado
            </Button>
          )}
        </div>

        {node.children.length > 0 && (
          <div className="flex flex-col items-center gap-2 pl-8 border-l-2 border-gray-200">
            <div className="flex flex-wrap gap-6 justify-center">
              {node.children.map((child, idx) => renderNode(child, idx))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const selectedManager = selectedNode?.user.managerId
    ? users.find(u => u.id === selectedNode.user.managerId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Organigrama</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los equipos</SelectItem>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentUser.level === 1 && onCreateTeam && (
            <Button onClick={onCreateTeam} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear Equipo
            </Button>
          )}
        </div>
      </div>

      {filteredTree.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay usuarios para mostrar</p>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="inline-flex flex-col gap-8 min-w-full items-center pt-4">
            {filteredTree.map((root, idx) => renderNode(root, idx))}
          </div>
        </div>
      )}

      <UserDetailModal
        user={selectedNode?.user || null}
        open={!!selectedNode && !selectedTeam}
        onOpenChange={(open) => !open && setSelectedNode(null)}
        onEdit={onEditUser}
        manager={selectedManager || null}
        team={selectedNode?.team || null}
        subordinatesCount={selectedNode?.children.length || 0}
      />

      <TeamFormModal
        team={selectedTeam}
        open={!!selectedTeam}
        onOpenChange={(open) => !open && setSelectedTeam(null)}
      />
    </div>
  )
}
