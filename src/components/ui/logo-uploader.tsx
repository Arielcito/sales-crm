"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface LogoUploaderProps {
  currentLogoUrl?: string | null
  onUpload: (file: File) => void
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onUpload(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onDelete?.()
  }

  return (
    <div className="space-y-2">
      <Label>Logo de la Empresa</Label>
      <p className="text-xs text-muted-foreground">
        PNG, JPG, JPEG o SVG. Máximo 5MB.
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
          (isUploading || isDeleting) && "opacity-50 pointer-events-none"
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
              >
                <Upload className="w-4 h-4 mr-2" />
                Cambiar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
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
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar Archivo
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
