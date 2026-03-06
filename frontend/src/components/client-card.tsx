"use client"

import { Building2, Mail, Briefcase, MapPin, Users, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ClientRead } from "@/client"

interface ClientCardProps {
  client: ClientRead & { jobs?: { id: number; status?: string }[] }
}

function KeyContactSection({ contacts }: { contacts: ClientRead["contacts"] }) {
  const keyContact = contacts?.find(c => c.email) || contacts?.[0]
  if (!keyContact) {
    return <div className="p-3 rounded-lg bg-muted/30 border border-dashed"><p className="text-xs text-muted-foreground text-center">No contacts</p></div>
  }
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">Key Contact</p>
      <p className="font-medium text-sm">{keyContact.name}</p>
      {keyContact.role_title && <p className="text-xs text-muted-foreground">{keyContact.role_title}</p>}
    </div>
  )
}

function ClientStats({ contactCount, jobCount, activeJobCount }: { contactCount: number; jobCount: number; activeJobCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-3.5 w-3.5" /><span>{contactCount} contacts</span></div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Briefcase className="h-3.5 w-3.5" /><span>{jobCount} jobs</span>
        {activeJobCount > 0 && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">{activeJobCount} active</Badge>}
      </div>
    </div>
  )
}

function EmailButton({ email }: { email: string | null | undefined }) {
  return (
    <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
      {email ? (
        <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `mailto:${email}` }}>
          <Mail className="h-3.5 w-3.5 mr-1.5" />Email
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="flex-1" disabled><Mail className="h-3.5 w-3.5 mr-1.5" />No email</Button>
      )}
    </div>
  )
}

export function ClientCard({ client }: ClientCardProps) {
  const keyContact = client.contacts?.find(c => c.email) || client.contacts?.[0]
  const activeJobCount = client.jobs?.filter(j => j.status === "active").length ?? 0

  return (
    <Link href={`/app/clients/${client.id}`} className="block group focus:outline-none">
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{client.name}</CardTitle>
              {client.address && <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{client.address}</span></div>}
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <KeyContactSection contacts={client.contacts} />
          <ClientStats contactCount={client.contacts?.length ?? 0} jobCount={client.jobs?.length ?? 0} activeJobCount={activeJobCount} />
          <EmailButton email={keyContact?.email} />
        </CardContent>
      </Card>
    </Link>
  )
}
