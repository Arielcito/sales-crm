"use client"

import { useState, useMemo } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useCompanyRequests } from "@/hooks/use-company-requests"
import { useContactRequests } from "@/hooks/use-contact-requests"
import { RequestsFilter } from "@/components/requests-filter"
import { RequestsList } from "@/components/requests-list"
import { ContactAccessRequestCard } from "@/components/contact-access-request-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Building2, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RequestsPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("companies")
  const { data: companyRequests = [], isLoading: companyRequestsLoading } = useCompanyRequests()
  const { data: contactRequests = [], isLoading: contactRequestsLoading } = useContactRequests()

  const filteredCompanyRequests = useMemo(() => {
    if (selectedStatus === "all") return companyRequests
    return companyRequests.filter((request) => request.status === selectedStatus)
  }, [companyRequests, selectedStatus])

  const filteredContactRequests = useMemo(() => {
    if (selectedStatus === "all") return contactRequests
    return contactRequests.filter((request) => request.status === selectedStatus)
  }, [contactRequests, selectedStatus])

  const companyCounts = useMemo(() => ({
    all: companyRequests.length,
    pending: companyRequests.filter((r) => r.status === "pending").length,
    approved: companyRequests.filter((r) => r.status === "approved").length,
    rejected: companyRequests.filter((r) => r.status === "rejected").length,
  }), [companyRequests])

  const contactCounts = useMemo(() => ({
    all: contactRequests.length,
    pending: contactRequests.filter((r) => r.status === "pending").length,
    approved: contactRequests.filter((r) => r.status === "approved").length,
    rejected: contactRequests.filter((r) => r.status === "rejected").length,
  }), [contactRequests])

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!currentUser || currentUser.level !== 1) {
    router.push("/dashboard")
    return null
  }

  const emptyMessages: Record<string, string> = {
    all: "No hay solicitudes registradas",
    pending: "No hay solicitudes pendientes de revisión",
    approved: "No hay solicitudes aprobadas",
    rejected: "No hay solicitudes rechazadas",
  }

  return (
    <div className="h-screen overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Solicitudes</h1>
            <p className="text-muted-foreground">
              Gestiona todas las solicitudes de empresas y contactos
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="w-4 h-4" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <UserCircle className="w-4 h-4" />
              Acceso a Contactos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtrar solicitudes de empresas</CardTitle>
                <CardDescription>
                  Revisa y gestiona las solicitudes de empresas pendientes de aprobación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsFilter
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  counts={companyCounts}
                />
              </CardContent>
            </Card>

            <RequestsList
              requests={filteredCompanyRequests}
              isLoading={companyRequestsLoading}
              emptyMessage={emptyMessages[selectedStatus]}
            />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtrar solicitudes de acceso a contactos</CardTitle>
                <CardDescription>
                  Revisa y gestiona las solicitudes de acceso a datos de contactos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsFilter
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  counts={contactCounts}
                />
              </CardContent>
            </Card>

            {contactRequestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Cargando solicitudes...</p>
              </div>
            ) : filteredContactRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{emptyMessages[selectedStatus]}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContactRequests.map((request) => (
                  <ContactAccessRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
