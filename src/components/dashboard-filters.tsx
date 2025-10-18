"use client"

import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import type { Currency } from "@/lib/types"

interface DashboardFiltersProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
}

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
  currency,
  onCurrencyChange,
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
    </div>
  )
}
