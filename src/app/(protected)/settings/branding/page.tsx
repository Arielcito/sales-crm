"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/ui/color-picker"
import { LogoUploader } from "@/components/ui/logo-uploader"
import { BrandingPreview } from "@/components/ui/branding-preview"
import { Spinner } from "@/components/ui/spinner"
import {
  useBranding,
  useUpdateBranding,
  useUploadLogo,
  useDeleteLogo,
} from "@/hooks/use-branding"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BrandingPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const { data: branding, isLoading: isLoadingBranding } = useBranding()
  const updateBranding = useUpdateBranding()
  const uploadLogo = useUploadLogo()
  const deleteLogo = useDeleteLogo()

  const [formData, setFormData] = useState({
    name: "",
    primaryColor: "217 91% 60%",
    secondaryColor: "214 32% 91%",
    accentColor: "142 71% 45%",
    sidebarColor: "215 25% 27%",
  })

  useEffect(() => {
    if (branding) {
      setFormData({
        name: branding.name,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        sidebarColor: branding.sidebarColor,
      })
    }
  }, [branding])

  if (isLoadingUser || isLoadingBranding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (currentUser?.level !== 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground mb-4">
            Solo los administradores pueden acceder a esta página.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Volver al Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateBranding.mutateAsync(formData)
      toast.success("Branding actualizado correctamente")
    } catch (error) {
      toast.error("Error al actualizar el branding")
      console.error("[BrandingPage] Update error:", error)
    }
  }

  const handleLogoUpload = async (url: string) => {
    try {
      await uploadLogo.mutateAsync(url)
      toast.success("Logo subido correctamente")
    } catch (error) {
      toast.error("Error al subir el logo")
      console.error("[BrandingPage] Upload error:", error)
    }
  }

  const handleLogoDelete = async () => {
    try {
      await deleteLogo.mutateAsync()
      toast.success("Logo eliminado correctamente")
    } catch (error) {
      toast.error("Error al eliminar el logo")
      console.error("[BrandingPage] Delete error:", error)
    }
  }

  const isSaving = updateBranding.isPending || uploadLogo.isPending || deleteLogo.isPending

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Personalización de Marca</h1>
          <p className="text-muted-foreground">
            Configure el logo, nombre y colores de su plataforma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="SalPip"
                  required
                />
              </div>

              <LogoUploader
                currentLogoUrl={branding?.logoUrl}
                onUpload={handleLogoUpload}
                onDelete={handleLogoDelete}
                isUploading={uploadLogo.isPending}
                isDeleting={deleteLogo.isPending}
              />

              <div className="space-y-4">
                <h3 className="font-semibold">Colores de la Marca</h3>

                <ColorPicker
                  label="Color Primario"
                  value={formData.primaryColor}
                  onChange={(value) =>
                    setFormData({ ...formData, primaryColor: value })
                  }
                  description="Usado en botones principales y elementos destacados"
                />

                <ColorPicker
                  label="Color Secundario"
                  value={formData.secondaryColor}
                  onChange={(value) =>
                    setFormData({ ...formData, secondaryColor: value })
                  }
                  description="Usado en fondos secundarios y elementos sutiles"
                />

                <ColorPicker
                  label="Color de Acento"
                  value={formData.accentColor}
                  onChange={(value) =>
                    setFormData({ ...formData, accentColor: value })
                  }
                  description="Usado en acciones positivas y estados de éxito"
                />

                <ColorPicker
                  label="Color del Sidebar"
                  value={formData.sidebarColor}
                  onChange={(value) =>
                    setFormData({ ...formData, sidebarColor: value })
                  }
                  description="Color de fondo de la barra lateral"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 h-fit">
          <BrandingPreview
            name={formData.name}
            logoUrl={branding?.logoUrl}
            primaryColor={formData.primaryColor}
            secondaryColor={formData.secondaryColor}
            accentColor={formData.accentColor}
            sidebarColor={formData.sidebarColor}
          />
        </div>
      </div>
      </div>
    </div>
  )
}
