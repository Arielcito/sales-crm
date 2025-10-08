"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRecentContacts } from "@/hooks/use-recent-activity"
import { User, Mail, Phone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

export function RecentContactsList() {
  const { data: contacts, isLoading, error } = useRecentContacts(5)
  const router = useRouter()

  const handleContactClick = (contactId: string) => {
    router.push(`/companies?contactId=${contactId}`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contactos Recientes</CardTitle>
          <CardDescription>Tus últimos contactos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contactos Recientes</CardTitle>
          <CardDescription>Tus últimos contactos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Error al cargar contactos</p>
        </CardContent>
      </Card>
    )
  }

  if (!contacts || contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contactos Recientes</CardTitle>
          <CardDescription>Tus últimos contactos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay contactos todavía</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contactos Recientes</CardTitle>
        <CardDescription>Tus últimos contactos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact.id)}
              className="flex items-start space-x-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{contact.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {contact.email && (
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </span>
                  )}
                  {contact.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
