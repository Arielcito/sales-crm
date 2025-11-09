"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompanies } from "@/hooks/use-companies"
import { useContacts } from "@/hooks/use-contacts"
import { useCreateDeal } from "@/hooks/use-deals"
import { useDealStages } from "@/hooks/use-deal-stages"
import { useUsers } from "@/hooks/use-users"
import { useExchangeRate, useConvertCurrency } from "@/hooks/use-exchange-rate"
import type { User, Currency } from "@/lib/types"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"
import { ArrowRight, Plus, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NewCompanyModal } from "@/components/new-company-modal"

interface NewDealModalProps {
  currentUser: User
  onClose: () => void
  onSuccess: () => void
}

export function NewDealModal({ currentUser, onClose, onSuccess }: NewDealModalProps) {
  const { data: companies = [] } = useCompanies()
  const { data: contacts = [] } = useContacts()
  const { data: dealStages = [] } = useDealStages()
  const { data: users = [] } = useUsers()
  const createDealMutation = useCreateDeal()
  const { data: exchangeRate } = useExchangeRate()
  const { convertAmount } = useConvertCurrency()

  const [step, setStep] = useState<"company" | "contact" | "deal">("company")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false)

  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [selectedContactId, setSelectedContactId] = useState("")
  const [isCreatingNewContact, setIsCreatingNewContact] = useState(false)

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  })

  const [dealData, setDealData] = useState({
    title: "",
    amountUsd: "",
    currency: "USD" as Currency,
    expectedCloseDate: "",
    userId: currentUser.id,
    stageId: dealStages[0]?.id || "",
  })

  const visibleUsers = useMemo(() => {
    if (currentUser.level === 1) {
      return users
    }

    return users.filter(user =>
      user.teamId === currentUser.teamId && user.level >= currentUser.level
    )
  }, [users, currentUser])

  const companyContacts = useMemo(() => {
    if (!selectedCompanyId) return []

    return contacts.filter(contact => contact.companyId === selectedCompanyId)
  }, [contacts, selectedCompanyId])

  const selectedCompany = companies.find(c => c.id === selectedCompanyId)
  const selectedContact = contacts.find(c => c.id === selectedContactId)

  const displayContactName = selectedContact?.name || contactData.name

  const handleCompanyCreated = () => {
    setShowNewCompanyModal(false)
  }

  const handleCompanySelected = () => {
    if (!selectedCompanyId) {
      toast.error("Selecciona una empresa")
      return
    }
    setStep("contact")
  }

  const handleContactNext = () => {
    if (!selectedContactId && !isCreatingNewContact) {
      toast.error("Selecciona un contacto o crea uno nuevo")
      return
    }

    if (isCreatingNewContact && !contactData.name.trim()) {
      toast.error("El nombre del contacto es obligatorio")
      return
    }

    setStep("deal")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let finalContactId: string

      if (selectedContactId) {
        console.log("[NewDealModal] Using selected contact:", selectedContactId)
        finalContactId = selectedContactId
      } else if (isCreatingNewContact) {
        setStatusMessage("Creando contacto...")
        console.log("[NewDealModal] Blind creating contact:", contactData.name)

        const contactResult = await apiClient<{
          status: string
          contactId?: string
          requestId?: string
          message: string
          contact?: { id: string }
        }>("/api/contacts", {
          method: "POST",
          body: JSON.stringify({
            ...contactData,
            companyId: selectedCompanyId,
          }),
        })

        console.log("[NewDealModal] Contact creation result:", contactResult.status)

        if (contactResult.status === "created") {
          finalContactId = contactResult.contact!.id
          toast.success(contactResult.message)
        } else if (contactResult.status === "linked") {
          finalContactId = contactResult.contactId!
          toast.info(contactResult.message)
        } else if (contactResult.status === "pending") {
          finalContactId = contactResult.contactId!
          toast.warning(contactResult.message)
          console.log("[NewDealModal] Contact pending validation, ID:", finalContactId)
        } else {
          throw new Error("Invalid contact creation status")
        }
      } else {
        throw new Error("No contact selected or created")
      }

      setStatusMessage("Creando negociación...")

      const amount = Number.parseFloat(dealData.amountUsd)

      if (!exchangeRate?.usdToArs) {
        console.error("[NewDealModal] No exchange rate available")
        toast.error("No se pudo obtener el tipo de cambio")
        return
      }

      console.log("[NewDealModal] Creating deal with exchange rate:", exchangeRate.usdToArs)

      const savedExchangeRate = await apiClient<{ id: string }>("/api/exchange-rate", {
        method: "POST",
        body: JSON.stringify({ usdToArs: exchangeRate.usdToArs }),
      })

      console.log("[NewDealModal] Exchange rate saved with ID:", savedExchangeRate.id)

      const amountUsd = dealData.currency === "USD"
        ? amount
        : convertAmount(amount, "ARS", "USD")

      const amountArs = dealData.currency === "ARS"
        ? amount
        : convertAmount(amount, "USD", "ARS")

      console.log("[NewDealModal] Amounts - USD:", amountUsd, "ARS:", amountArs)

      await createDealMutation.mutateAsync({
        title: dealData.title,
        amountUsd,
        amountArs,
        currency: dealData.currency,
        dollarRate: parseFloat(exchangeRate.usdToArs),
        exchangeRateId: savedExchangeRate.id,
        expectedCloseDate: dealData.expectedCloseDate ? new Date(dealData.expectedCloseDate) : undefined,
        userId: dealData.userId,
        stageId: dealData.stageId,
        companyId: selectedCompanyId,
        contactId: finalContactId,
      })

      toast.success("Negociación creada exitosamente")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("[NewDealModal] Error creating deal:", error)
      toast.error("Error al crear la negociación")
    } finally {
      setIsSubmitting(false)
      setStatusMessage("")
    }
  }

  const steps = [
    { key: "company", label: "Empresa", number: 1 },
    { key: "contact", label: "Contacto", number: 2 },
    { key: "deal", label: "Negociación", number: 3 },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Negociación</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-6">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      index <= currentStepIndex
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <span className="text-sm">✓</span>
                    ) : (
                      <span className="text-sm font-semibold">{s.number}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      index < currentStepIndex ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {statusMessage && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}

          {step === "company" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Seleccionar Empresa *</Label>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa existente" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      o
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowNewCompanyModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Crear Nueva Empresa
                </Button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleCompanySelected}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "contact" && (
            <form onSubmit={(e) => { e.preventDefault(); handleContactNext(); }} className="space-y-6">
              <Alert>
                <AlertDescription>
                  <strong>Empresa seleccionada:</strong> {selectedCompany?.name}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Añadir Contacto a la Negociación</h3>

                {!isCreatingNewContact ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="contactId">Seleccionar Contacto *</Label>
                      <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar contacto existente" />
                        </SelectTrigger>
                        <SelectContent>
                          {companyContacts.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No hay contactos disponibles para esta empresa
                            </div>
                          ) : (
                            companyContacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name} {contact.email ? `(${contact.email})` : ""}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          o
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        setIsCreatingNewContact(true)
                        setSelectedContactId("")
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Crear Nuevo Contacto
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">Creando nuevo contacto</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsCreatingNewContact(false)
                          setContactData({ name: "", email: "", phone: "", position: "" })
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Nombre del Contacto *</Label>
                        <Input
                          id="contactName"
                          value={contactData.name}
                          onChange={(e) => setContactData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email del Contacto</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="juan@empresa.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Teléfono</Label>
                        <Input
                          id="contactPhone"
                          value={contactData.phone}
                          onChange={(e) => setContactData((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+54 11 1234-5678"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPosition">Cargo/Área</Label>
                        <Input
                          id="contactPosition"
                          value={contactData.position}
                          onChange={(e) => setContactData((prev) => ({ ...prev, position: e.target.value }))}
                          placeholder="Gerente de TI"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep("company")}>
                  Atrás
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          )}

          {step === "deal" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Alert>
                <AlertDescription>
                  <strong>Empresa:</strong> {selectedCompany?.name}<br />
                  <strong>Contacto:</strong> {displayContactName}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Detalles de la Negociación</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Nombre del Proyecto *</Label>
                    <Input
                      id="title"
                      value={dealData.title}
                      onChange={(e) => setDealData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Sistema CRM Personalizado"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId">Usuario Responsable</Label>
                    <Select
                      value={dealData.userId}
                      onValueChange={(value) => setDealData((prev) => ({ ...prev, userId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {visibleUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} - {user.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amountUsd">Monto *</Label>
                    <Input
                      id="amountUsd"
                      type="number"
                      value={dealData.amountUsd}
                      onChange={(e) => setDealData((prev) => ({ ...prev, amountUsd: e.target.value }))}
                      placeholder="150000"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={dealData.currency}
                      onValueChange={(value: Currency) => setDealData((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                        <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedCloseDate">Fecha Límite *</Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      value={dealData.expectedCloseDate}
                      onChange={(e) => setDealData((prev) => ({ ...prev, expectedCloseDate: e.target.value }))}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stageId">Etapa Inicial</Label>
                    <Select
                      value={dealData.stageId}
                      onValueChange={(value) => setDealData((prev) => ({ ...prev, stageId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dealStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep("contact")}>
                  Atrás
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Negociación"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {showNewCompanyModal && (
        <NewCompanyModal
          onClose={() => setShowNewCompanyModal(false)}
          onSuccess={handleCompanyCreated}
        />
      )}
    </>
  )
}
