"use client"

import { useState, useMemo } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useContactRequests } from "@/hooks/use-contact-requests"
import { RequestsFilter } from "@/components/requests-filter"
import { ContactAccessRequestCard } from "@/components/contact-access-request-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RequestsPage() {
  const router = useRouter()
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const [selectedStatus, setSelectedStatus] = useState("all")
  const { data: contactRequests = [], isLoading: contactRequestsLoading } = useContactRequests()

  const filteredContactRequests = useMemo(() => {
    if (selectedStatus === "all") return contactRequests
    return contactRequests.filter((request) => request.status === selectedStatus)
  }, [contactRequests, selectedStatus])

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
            <h1 className="text-3xl font-bold">Solicitudes de Acceso a Contactos</h1>
            <p className="text-muted-foreground">
              Gestiona las solicitudes de acceso a datos sensibles de contactos
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar solicitudes</CardTitle>
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
      </div>
    </div>
  )
}
