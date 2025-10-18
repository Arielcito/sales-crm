"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BrandingPreviewProps {
  name: string
  logoUrl?: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  sidebarColor: string
}

export function BrandingPreview({
  name,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  sidebarColor,
}: BrandingPreviewProps) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-lg">Vista Previa</h3>

      <div className="rounded-lg overflow-hidden border border-border">
        <div
          className="p-4 flex items-center gap-3"
          style={{ backgroundColor: `hsl(${sidebarColor})` }}
        >
          {logoUrl ? (
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `hsl(${primaryColor})` }}
            >
              <div
                className="w-5 h-5 rounded-md"
                style={{ backgroundColor: `hsl(${primaryColor} / 0.2)` }}
              ></div>
            </div>
          )}
          <div>
            <h4 className="font-bold text-sm" style={{ color: "hsl(203 23% 82%)" }}>
              {name}
            </h4>
            <p className="text-xs" style={{ color: "hsl(203 23% 82% / 0.6)" }}>
              Sales Pipeline
            </p>
          </div>
        </div>

        <div className="p-6 bg-background space-y-4">
          <div className="flex gap-2">
            <div
              className="px-4 py-2 rounded-md text-white text-sm font-medium"
              style={{ backgroundColor: `hsl(${primaryColor})` }}
            >
              Primary
            </div>
            <div
              className="px-4 py-2 rounded-md text-sm font-medium border"
              style={{
                backgroundColor: `hsl(${secondaryColor})`,
                borderColor: `hsl(${secondaryColor})`,
              }}
            >
              Secondary
            </div>
            <div
              className="px-4 py-2 rounded-md text-white text-sm font-medium"
              style={{ backgroundColor: `hsl(${accentColor})` }}
            >
              Accent
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2 rounded-full bg-muted w-full"></div>
            <div className="h-2 rounded-full bg-muted w-3/4"></div>
            <div className="h-2 rounded-full bg-muted w-1/2"></div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Primary:</span>
          <code className="font-mono">{primaryColor}</code>
        </div>
        <div className="flex justify-between">
          <span>Secondary:</span>
          <code className="font-mono">{secondaryColor}</code>
        </div>
        <div className="flex justify-between">
          <span>Accent:</span>
          <code className="font-mono">{accentColor}</code>
        </div>
        <div className="flex justify-between">
          <span>Sidebar:</span>
          <code className="font-mono">{sidebarColor}</code>
        </div>
      </div>
    </Card>
  )
}
