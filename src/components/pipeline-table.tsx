"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { StageStats, Currency } from "@/lib/types"

interface PipelineTableProps {
  stageStats: StageStats[]
  currency: Currency
  isLoading?: boolean
}

export function PipelineTable({ stageStats, currency, isLoading }: PipelineTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline por Etapa</CardTitle>
          <CardDescription>Cantidad y monto por cada etapa del pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currencySymbol = currency === "USD" ? "USD" : "ARS"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline por Etapa</CardTitle>
        <CardDescription>Cantidad y monto por cada etapa del pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Etapa</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stageStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            ) : (
              stageStats.map((stage) => (
                <TableRow key={stage.stageId}>
                  <TableCell className="font-medium">{stage.stageName}</TableCell>
                  <TableCell className="text-right">{stage.count}</TableCell>
                  <TableCell className="text-right">
                    {currencySymbol} {stage.totalAmount.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
