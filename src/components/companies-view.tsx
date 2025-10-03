"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, Plus, Search, Users, Mail, Phone, Briefcase, Globe, Pencil, Trash2 } from "lucide-react"
import { useCompanies, useDeleteCompany } from "@/hooks/use-companies"
import { useContacts, useDeleteContact } from "@/hooks/use-contacts"
import type { User, Company, Contact } from "@/lib/types"
import { NewCompanyModal } from "@/components/new-company-modal"
import { NewContactModal } from "@/components/new-contact-modal"
import { EditCompanyModal } from "@/components/edit-company-modal"
import { EditContactModal } from "@/components/edit-contact-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CompaniesViewProps {
  currentUser: User
}

export function CompaniesView({ currentUser }: CompaniesViewProps) {
  const { data: companies = [], isLoading: companiesLoading } = useCompanies()
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  const deleteCompanyMutation = useDeleteCompany()
  const deleteContactMutation = useDeleteContact()

  const [searchTerm, setSearchTerm] = useState("")
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false)
  const [showNewContactModal, setShowNewContactModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [companies, searchTerm])

  const handleCompanyCreated = () => {
    setShowNewCompanyModal(false)
  }

  const handleContactCreated = () => {
    setShowNewContactModal(false)
    setSelectedCompany(null)
  }

  const handleCompanyUpdated = () => {
    setEditingCompany(null)
  }

  const handleContactUpdated = () => {
    setEditingContact(null)
  }

  const handleDeleteCompany = async (company: Company) => {
    try {
      await deleteCompanyMutation.mutateAsync(company.id)
      setDeletingCompany(null)
    } catch (error) {
      console.error("[CompaniesView] Error deleting company:", error)
      alert("No se puede eliminar la empresa porque tiene contactos o negociaciones asociadas")
      setDeletingCompany(null)
    }
  }

  const handleDeleteContact = async (contact: Contact) => {
    try {
      await deleteContactMutation.mutateAsync(contact.id)
      setDeletingContact(null)
    } catch (error) {
      console.error("[CompaniesView] Error deleting contact:", error)
      alert("No se puede eliminar el contacto porque tiene negociaciones asociadas")
      setDeletingContact(null)
    }
  }

  const getCompanyContacts = (companyId: string) => {
    return contacts.filter((contact) => contact.companyId === companyId)
  }

  if (companiesLoading || contactsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Empresas y Contactos</h1>
            <p className="text-muted-foreground mt-1">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Empresas y Contactos</h1>
          <p className="text-muted-foreground mt-1">Gestiona las empresas y sus contactos</p>
        </div>
        <Button onClick={() => setShowNewCompanyModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar empresas por nombre o industria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {filteredCompanies.map((company) => {
          const companyContacts = getCompanyContacts(company.id)
          return (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        {company.industry && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {company.industry}
                          </span>
                        )}
                        {company.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {company.website}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCompany(company)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingCompany(company)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">Contactos</h3>
                    <Badge variant="secondary">{companyContacts.length}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCompany(company)
                      setShowNewContactModal(true)
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar Contacto
                  </Button>
                </div>

                {companyContacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay contactos registrados para esta empresa
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {companyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.position}</p>
                          </div>
                          {contact.status && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {contact.status}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => setEditingContact(contact)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeletingContact(contact)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {filteredCompanies.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron empresas" : "No hay empresas registradas"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {showNewCompanyModal && (
        <NewCompanyModal onClose={() => setShowNewCompanyModal(false)} onSuccess={handleCompanyCreated} />
      )}

      {showNewContactModal && selectedCompany && (
        <NewContactModal
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
          onClose={() => {
            setShowNewContactModal(false)
            setSelectedCompany(null)
          }}
          onSuccess={handleContactCreated}
        />
      )}

      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSuccess={handleCompanyUpdated}
        />
      )}

      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSuccess={handleContactUpdated}
        />
      )}

      {deletingCompany && (
        <AlertDialog open onOpenChange={() => setDeletingCompany(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar la empresa &quot;{deletingCompany.name}&quot;? Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteCompany(deletingCompany)}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {deletingContact && (
        <AlertDialog open onOpenChange={() => setDeletingContact(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar el contacto &quot;{deletingContact.name}&quot;? Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteContact(deletingContact)}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
