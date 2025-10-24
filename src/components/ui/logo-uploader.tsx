"use client"

import { useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "sonner"

interface LogoUploaderProps {
  currentLogoUrl?: string | null
  onUpload: (url: string) => void
  onDelete?: () => void
  isUploading?: boolean
  isDeleting?: boolean
}

export function LogoUploader({
  currentLogoUrl,
  onUpload,
  onDelete,
  isUploading = false,
  isDeleting = false,
}: LogoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const { startUpload, isUploading: isUploadingToUT } = useUploadThing("logoUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        console.log("[LogoUploader] Upload complete:", res[0].url)
        setPreview(res[0].url)
      }
    },
    onUploadError: (error) => {
      console.error("[LogoUploader] Upload error:", error)
      toast.error("Error al subir el logo")
      setPreview(currentLogoUrl || null)
    },
  })

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen")
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("El archivo debe ser menor a 4MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const uploadResult = await startUpload([file])
    if (uploadResult?.[0]?.url) {
      onUpload(uploadResult[0].url)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDelete = () => {
    setPreview(null)
    onDelete?.()
  }

  const handleClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/png,image/jpeg,image/jpg,image/svg+xml"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileChange(file)
      }
    }
    input.click()
  }

  const loading = isUploading || isDeleting || isUploadingToUT

  return (
    <div className="space-y-2">
      <Label>Logo de la Empresa</Label>
      <p className="text-xs text-muted-foreground">
        PNG, JPG, JPEG o SVG. Máximo 4MB.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          loading && "opacity-50 pointer-events-none"
        )}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 bg-background border border-border rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Cambiar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Arrastra y suelta tu logo aquí
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                o haz clic para seleccionar
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar Archivo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
