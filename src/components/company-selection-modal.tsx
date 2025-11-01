"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Building2, User, Briefcase, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"
import type { Company, Contact } from "@/lib/types"

interface CompanySelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  companies: Company[]
  contacts: Contact[]
}

export function CompanySelectionModal({
  isOpen,
  onClose,
  onSuccess,
  companies,
  contacts
}: CompanySelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [companies, searchTerm])

  const companyContacts = useMemo(() => {
    if (!selectedCompany) return []
    return contacts.filter((contact) => contact.companyId === selectedCompany.id)
  }, [contacts, selectedCompany])

  const handleRequestAccess = async () => {
    if (!selectedCompany) return

    setIsSubmitting(true)

    try {
      console.log("[CompanySelectionModal] Requesting access for company:", selectedCompany.id)

      await apiClient("/api/companies/requests", {
        method: "POST",
        body: JSON.stringify({
          companyId: selectedCompany.id,
          companyName: selectedCompany.name,
        }),
      })

      console.log("[CompanySelectionModal] Request submitted successfully")

      toast.success("Solicitud enviada", {
        description: `Se ha enviado la solicitud de acceso a ${selectedCompany.name}`
      })

      onSuccess()
      onClose()
      setSelectedCompany(null)
      setSearchTerm("")
    } catch (error) {
      console.error("[CompanySelectionModal] Error submitting request:", error)
      toast.error("Error al enviar solicitud", {
        description: "No se pudo enviar la solicitud. Por favor, intenta nuevamente."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedCompany(null)
    setSearchTerm("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Solicitar Acceso a Empresa</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar empresas por nombre o industria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {!selectedCompany ? (
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron empresas</p>
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <Card
                    key={company.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedCompany(company)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{company.name}</h3>
                          {company.industry && (
                            <p className="text-sm text-muted-foreground">{company.industry}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                        {selectedCompany.industry && (
                          <p className="text-sm text-muted-foreground">{selectedCompany.industry}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCompany(null)}
                    >
                      Cambiar empresa
                    </Button>
                  </div>

                  {selectedCompany.website && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Sitio web:</span> {selectedCompany.website}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contactos ({companyContacts.length})
                </h4>

                {companyContacts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay contactos registrados para esta empresa</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {companyContacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div>
                                <h5 className="font-semibold">{contact.name}</h5>
                                {contact.position && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Briefcase className="w-3 h-3" />
                                    {contact.position}
                                  </div>
                                )}
                              </div>

                              {contact.status && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {contact.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          {selectedCompany && (
            <Button onClick={handleRequestAccess} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Solicitar Acceso"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
