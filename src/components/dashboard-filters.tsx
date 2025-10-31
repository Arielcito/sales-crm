"use client"

import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Currency } from "@/lib/types"
import type { TeamLeader } from "@/hooks/use-teams"

interface DashboardFiltersProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
  selectedTeamLeaderId?: string
  onTeamLeaderChange?: (teamLeaderId: string) => void
  teamLeaders?: TeamLeader[]
  showTeamFilter?: boolean
}

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
  currency,
  onCurrencyChange,
  selectedTeamLeaderId,
  onTeamLeaderChange,
  teamLeaders = [],
  showTeamFilter = false,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <DateRangePicker
        date={dateRange}
        onDateChange={onDateRangeChange}
        className="w-full sm:w-auto"
      />

      <div className="flex gap-2">
        <Button
          variant={currency === "USD" ? "default" : "outline"}
          size="sm"
          onClick={() => onCurrencyChange("USD")}
          className="transition-all"
        >
          USD
        </Button>
        <Button
          variant={currency === "ARS" ? "default" : "outline"}
          size="sm"
          onClick={() => onCurrencyChange("ARS")}
          className="transition-all"
        >
          ARS
        </Button>
      </div>

      {showTeamFilter && onTeamLeaderChange && (
        <Select value={selectedTeamLeaderId} onValueChange={onTeamLeaderChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Todos los equipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los equipos</SelectItem>
            {teamLeaders.map((leader) => (
              <SelectItem key={leader.id} value={leader.id}>
                {leader.name}{leader.teamName ? ` (${leader.teamName})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
