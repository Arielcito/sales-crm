"use client"

import { useState, useMemo } from "react"
import { DateRange } from "react-day-picker"
import { subYears, endOfDay } from "date-fns"
import type { Currency } from "@/lib/types"

export interface DashboardFilters {
  dateRange: DateRange | undefined
  currency: Currency
  selectedTeamLeaderId: string
}

export function useDashboardFilters() {
  const defaultDateRange: DateRange = useMemo(() => {
    const now = new Date()
    return {
      from: subYears(now, 1),
      to: endOfDay(now),
    }
  }, [])

  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [selectedTeamLeaderId, setSelectedTeamLeaderId] = useState<string>("all")

  return {
    dateRange,
    setDateRange,
    currency,
    setCurrency,
    selectedTeamLeaderId,
    setSelectedTeamLeaderId,
  }
}
