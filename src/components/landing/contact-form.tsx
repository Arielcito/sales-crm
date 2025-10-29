"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send, CheckCircle2 } from "lucide-react"
import { contactRequestSchema, type ContactRequestInput } from "@/lib/schemas/contact-request"
import { toast } from "sonner"

export function ContactForm() {
  const [formData, setFormData] = useState<ContactRequestInput>({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const validatedData = contactRequestSchema.parse(formData)

      setIsSubmitting(true)

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || "Error al enviar mensaje")
      }

      setIsSuccess(true)
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
      })

      toast.success("¡Mensaje enviado! Te contactaremos pronto.")

      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error("[ContactForm] Error:", error)
      toast.error(error instanceof Error ? error.message : "Error al enviar mensaje")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            name="company"
            placeholder="Nombre de tu empresa"
            value={formData.company}
            onChange={handleChange}
            disabled={isSubmitting}
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+54 11 1234-5678"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            className="transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Mensaje <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Cuéntanos cómo podemos ayudarte..."
          value={formData.message}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          rows={5}
          className="resize-none transition-all duration-300"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || isSuccess}
        className="w-full transition-all duration-300"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            ¡Enviado!
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensaje
          </>
        )}
      </Button>
    </form>
  )
}
