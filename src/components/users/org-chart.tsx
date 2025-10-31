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

  const renderUserCard = (user: User) => {
    const isDragging = draggedUser?.id === user.id
    const isOver = dropTarget?.id === user.id
    const canDrop = draggedUser
      ? canReassignUser(draggedUser, user, currentUser).valid
      : false

    const node: OrgChartNode = {
      user,
      children: [],
      depth: 0,
      position: 0,
    }

    return (
      <div
        key={user.id}
        draggable={user.level > 1}
        onDragStart={() => handleDragStart(user)}
        onDragOver={(e) => handleDragOver(e, user)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, user)}
        className="relative"
      >
        <OrgChartNodeComponent
          node={node}
          onNodeClick={handleNodeClick}
          isDragging={isDragging}
          isOver={isOver}
          canDrop={canDrop}
        />

        {user.level === 2 && currentUser.level <= 2 && (
          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full"
            onClick={(e) => {
              e.stopPropagation()
              onCreateUser?.(user.id, user.teamId || undefined)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar subordinado
          </Button>
        )}
      </div>
    )
  }

  const level2Groups = useMemo(() => {
    const groups: Array<{
      level2User: User
      level3Users: User[]
      level4Users: User[]
      team: Team | null
    }> = []

    filteredTree.forEach(rootNode => {
      const collectLevel2 = (node: OrgChartNode) => {
        if (node.user.level === 2) {
          const level3Users: User[] = []
          const level4Users: User[] = []

          node.children.forEach(child => {
            console.log("[OrgChart] Processing child:", child.user.name, "level:", child.user.level, "children:", child.children.length)

            if (child.user.level === 3) {
              level3Users.push(child.user)

              child.children.forEach(grandchild => {
                console.log("[OrgChart] Processing grandchild:", grandchild.user.name, "level:", grandchild.user.level)
                if (grandchild.user.level === 4) {
                  level4Users.push(grandchild.user)
                }
              })
            } else if (child.user.level === 4) {
              console.log("[OrgChart] Found direct level 4 under level 2:", child.user.name)
              level4Users.push(child.user)
            }
          })

          console.log("[OrgChart] Summary for", node.user.name, "- Level 3:", level3Users.length, "Level 4:", level4Users.length)

          groups.push({
            level2User: node.user,
            level3Users,
            level4Users,
            team: node.user.teamId ? teams.find(t => t.id === node.user.teamId) || null : null,
          })
        }

        node.children.forEach(collectLevel2)
      }

      if (rootNode.user.level === 1) {
        rootNode.children.forEach(collectLevel2)
      } else {
        collectLevel2(rootNode)
      }
    })

    return groups
  }, [filteredTree, teams])

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
        <div className="space-y-8">
          {filteredTree.filter(node => node.user.level === 1).map((rootNode) => (
            <div key={rootNode.user.id} className="flex justify-center">
              {renderUserCard(rootNode.user)}
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {level2Groups.map((group) => (
              <Card key={group.level2User.id} className="p-6 flex flex-col gap-6">
                <div className="text-center border-b pb-3">
                  <h3 className="font-semibold text-lg">
                    {group.team?.name || "Equipo de " + group.level2User.name.split(" ")[0]}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Manager
                  </div>
                  {renderUserCard(group.level2User)}
                </div>

                {group.level3Users.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Supervisores
                    </div>
                    {group.level3Users.map(user => (
                      <div key={user.id}>{renderUserCard(user)}</div>
                    ))}
                  </div>
                )}

                {group.level4Users.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Empleados
                    </div>
                    {group.level4Users.map(user => (
                      <div key={user.id}>{renderUserCard(user)}</div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
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
