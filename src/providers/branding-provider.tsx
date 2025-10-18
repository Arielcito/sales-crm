"use client"

import { createContext, useContext, useEffect } from "react"
import { useBranding } from "@/hooks/use-branding"

interface BrandingContextType {
  name: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  sidebarColor: string
  isLoading: boolean
}

const BrandingContext = createContext<BrandingContextType | null>(null)

function hslToHex(hslString: string): string {
  const match = hslString.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/)
  if (!match) return hslString

  let h = parseInt(match[1])
  let s = parseInt(match[2]) / 100
  let l = parseInt(match[3]) / 100

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

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: branding, isLoading } = useBranding()

  useEffect(() => {
    if (!branding) return

    const root = document.documentElement

    const hasCustomBranding =
      branding.primaryColor !== "217 91% 60%" ||
      branding.secondaryColor !== "214 32% 91%" ||
      branding.accentColor !== "142 71% 45%" ||
      branding.sidebarColor !== "215 25% 27%"

    if (hasCustomBranding) {
      root.style.setProperty("--primary", hslToHex(branding.primaryColor))
      root.style.setProperty("--accent", hslToHex(branding.accentColor))
      root.style.setProperty("--sidebar", hslToHex(branding.sidebarColor))
      root.style.setProperty("--secondary", hslToHex(branding.secondaryColor))
    }
  }, [branding])

  const value: BrandingContextType = {
    name: branding?.name || "SalPip",
    logoUrl: branding?.logoUrl || null,
    primaryColor: branding?.primaryColor || "217 91% 60%",
    secondaryColor: branding?.secondaryColor || "214 32% 91%",
    accentColor: branding?.accentColor || "142 71% 45%",
    sidebarColor: branding?.sidebarColor || "215 25% 27%",
    isLoading,
  }

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBrandingContext() {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error("useBrandingContext must be used within BrandingProvider")
  }
  return context
}
