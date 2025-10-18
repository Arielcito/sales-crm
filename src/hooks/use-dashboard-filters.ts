"use client"

import { useState, useMemo } from "react"
import { DateRange } from "react-day-picker"
import { startOfYear, endOfDay } from "date-fns"
import type { Currency } from "@/lib/types"

export interface DashboardFilters {
  dateRange: DateRange | undefined
  currency: Currency
}

export function useDashboardFilters() {
  const defaultDateRange: DateRange = useMemo(() => {
    const now = new Date()
    return {
      from: startOfYear(now),
      to: endOfDay(now),
    }
  }, [])

  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange)
  const [currency, setCurrency] = useState<Currency>("USD")

  return {
    dateRange,
    setDateRange,
    currency,
    setCurrency,
  }
}
