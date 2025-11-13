"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { ContactAccessRequestModal } from "./contact-access-request-modal"

interface ContactSensitiveFieldProps {
  value?: string
  contactId: string
  fieldName: string
  className?: string
}

export function ContactSensitiveField({
  value,
  contactId,
  fieldName,
  className = "",
}: ContactSensitiveFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (value) {
    return <span className={className}>{value}</span>
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`h-auto p-0 text-xs text-muted-foreground hover:text-primary ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        <Lock className="mr-1 h-3 w-3" />
        Solicitar acceso
      </Button>
      <ContactAccessRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contactId={contactId}
        fieldName={fieldName}
      />
    </>
  )
}
