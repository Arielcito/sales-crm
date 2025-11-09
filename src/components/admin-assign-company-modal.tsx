"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { apiClient } from "@/lib/api/client"
import { useQueryClient } from "@tanstack/react-query"
import type { Company, Team } from "@/lib/types"

interface AdminAssignCompanyModalProps {
  company: Company
  teams: Team[]
  onClose: () => void
}

export function AdminAssignCompanyModal({ company, teams, onClose }: AdminAssignCompanyModalProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assignedTeamId, setAssignedTeamId] = useState(company.assignedTeamId || "")
  const [isGlobal, setIsGlobal] = useState(company.isGlobal)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await apiClient("/api/admin/assign-company", {
        method: "POST",
        body: JSON.stringify({
          companyId: company.id,
          assignedTeamId: assignedTeamId || null,
          isGlobal,
        }),
      })

      toast.success("Empresa asignada correctamente")
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      onClose()
    } catch (error) {
      console.error("[AdminAssignCompanyModal] Error:", error)
      toast.error("Error al asignar empresa")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Empresa: <span className="font-medium text-foreground">{company.name}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTeamId">Equipo Asignado</Label>
            <Select
              value={assignedTeamId}
              onValueChange={setAssignedTeamId}
              disabled={isGlobal}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isGlobal"
              checked={isGlobal}
              onCheckedChange={(checked) => {
                setIsGlobal(checked as boolean)
                if (checked) {
                  setAssignedTeamId("")
                }
              }}
            />
            <Label
              htmlFor="isGlobal"
              className="text-sm font-normal cursor-pointer"
            >
              Visible para todos los usuarios (global)
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
