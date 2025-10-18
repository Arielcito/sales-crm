"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "220 90% 56%"

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const lRounded = Math.round(l * 100)

  return `${h} ${s}% ${lRounded}%`
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const parseHsl = (hsl: string) => {
    const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/)
    if (!match) return { h: 220, s: 90, l: 56 }
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3]),
    }
  }

  const { h, s, l } = parseHsl(value)
  const hexColor = hslToHex(h, s, l)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    const newHsl = hexToHsl(newHex)
    onChange(newHsl)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`color-${label}`}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-3 items-center">
        <div className="relative">
          <input
            type="color"
            id={`color-${label}`}
            value={hexColor}
            onChange={handleColorChange}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-border"
          />
        </div>
        <div className="flex-1 space-y-1">
          <Input
            value={hexColor}
            readOnly
            className="font-mono text-sm"
          />
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
            }}
            placeholder="220 90% 56%"
            className="font-mono text-sm"
          />
        </div>
      </div>
    </div>
  )
}
