import type { User, Team } from "@/lib/types"

export interface OrgChartNode {
  user: User
  children: OrgChartNode[]
  team?: Team
  depth: number
  position: number
}

export function buildOrgChartTree(
  users: User[],
  teams: Team[]
): OrgChartNode[] {
  console.log("[buildOrgChartTree] Building tree with users:", users.length, "teams:", teams.length)

  const userMap = new Map<string, User>(users.map(u => [u.id, u]))
  const teamMap = new Map<string, Team>(teams.map(t => [t.id, t]))
  const nodeMap = new Map<string, OrgChartNode>()

  users.forEach(user => {
    nodeMap.set(user.id, {
      user,
      children: [],
      team: user.teamId ? teamMap.get(user.teamId) : undefined,
      depth: 0,
      position: 0,
    })
  })

  const roots: OrgChartNode[] = []

  users.forEach(user => {
    const node = nodeMap.get(user.id)!

    if (!user.managerId) {
      roots.push(node)
    } else {
      const managerNode = nodeMap.get(user.managerId)
      if (managerNode) {
        managerNode.children.push(node)
      } else {
        roots.push(node)
      }
    }
  })

  roots.sort((a, b) => a.user.level - b.user.level)

  function calculateDepthAndPosition(
    node: OrgChartNode,
    depth: number,
    position: number
  ): number {
    node.depth = depth
    node.position = position

    node.children.sort((a, b) => {
      if (a.user.level !== b.user.level) {
        return a.user.level - b.user.level
      }
      if (a.team?.name && b.team?.name) {
        return a.team.name.localeCompare(b.team.name)
      }
      return a.user.name.localeCompare(b.user.name)
    })

    let currentPosition = position
    node.children.forEach(child => {
      currentPosition = calculateDepthAndPosition(child, depth + 1, currentPosition)
    })

    return currentPosition + 1
  }

  let currentPosition = 0
  roots.forEach(root => {
    currentPosition = calculateDepthAndPosition(root, 0, currentPosition)
  })

  console.log("[buildOrgChartTree] Tree built with roots:", roots.length)

  return roots
}

export function groupNodesByTeam(
  nodes: OrgChartNode[]
): Map<string, OrgChartNode[]> {
  const teamGroups = new Map<string, OrgChartNode[]>()

  function processNode(node: OrgChartNode) {
    const teamId = node.team?.id || "no-team"

    if (!teamGroups.has(teamId)) {
      teamGroups.set(teamId, [])
    }

    teamGroups.get(teamId)!.push(node)

    node.children.forEach(processNode)
  }

  nodes.forEach(processNode)

  return teamGroups
}

export function findNodePath(
  nodes: OrgChartNode[],
  userId: string
): OrgChartNode[] {
  function search(
    currentNodes: OrgChartNode[],
    path: OrgChartNode[]
  ): OrgChartNode[] | null {
    for (const node of currentNodes) {
      if (node.user.id === userId) {
        return [...path, node]
      }

      const result = search(node.children, [...path, node])
      if (result) {
        return result
      }
    }

    return null
  }

  return search(nodes, []) || []
}

export function canReassignUser(
  sourceUser: User,
  targetManager: User,
  currentUser: User
): { valid: boolean; error?: string } {
  if (sourceUser.level === 1) {
    return { valid: false, error: "No se puede reasignar usuarios de nivel 1" }
  }

  if (targetManager.level !== 2) {
    return { valid: false, error: "Solo se puede reasignar a managers de nivel 2" }
  }

  if (currentUser.level === 2) {
    if (sourceUser.managerId !== currentUser.id) {
      return { valid: false, error: "Solo puedes reasignar tus subordinados directos" }
    }
  }

  if (sourceUser.level < 3) {
    if (currentUser.level !== 1) {
      return { valid: false, error: "Solo nivel 1 puede reasignar usuarios de nivel 2" }
    }
  }

  return { valid: true }
}
