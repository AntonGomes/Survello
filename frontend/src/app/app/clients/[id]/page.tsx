"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { 
  Building2, 
  MapPin, 
  Users,
  Briefcase,
  Mail,
  Phone
} from "lucide-react"
import Link from "next/link"

import { readClientOptions } from "@/client/@tanstack/react-query.gen"
import { FeatureHeader } from "@/components/feature-header"
import { CreateContactDialog } from "@/components/create-contact-dialog"
import { CreateJobDialog } from "@/components/create-job-dialog"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const clientId = parseInt(params.id)
  
  const { data: client, isLoading, error } = useQuery({
    ...readClientOptions({ path: { client_id: clientId } })
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Client not found
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <FeatureHeader
        title={client.name}
        breadcrumbs={[
            { label: "Clients", href: "/app/clients" },
            { label: client.name }
        ]}
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>Client #{client.id}</span>
            </div>
            {client.address && (
                <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{client.address}</span>
                    </div>
                </>
            )}
        </div>
      </FeatureHeader>

      <div className="space-y-8 px-8 pb-8">
        
        {/* Contacts Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Contacts
                </h2>
                <CreateContactDialog clientId={client.id} />
            </div>
            {client.contacts && client.contacts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {client.contacts.map(contact => (
                        <Card key={contact.id} className="bg-muted/10">
                            <CardHeader className="py-4">
                                <CardTitle className="text-base">{contact.name}</CardTitle>
                                {contact.role_title && (
                                    <CardDescription>{contact.role_title}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="pb-4 text-sm space-y-2">
                                {contact.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <a href={`mailto:${contact.email}`} className="hover:text-foreground transition-colors">
                                            {contact.email}
                                        </a>
                                    </div>
                                )}
                                {contact.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>{contact.phone}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
                    No contacts listed for this client.
                </div>
            )}
        </div>

        <Separator />

        {/* Jobs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Jobs
            </h2>
            <CreateJobDialog 
              initialClientId={client.id} 
              trigger={<Button variant="outline" size="sm">Create Job</Button>}
            />
          </div>
          
          {client.jobs && client.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.jobs.map((job) => (
                <Link key={job.id} href={`/app/jobs/${job.id}`} className="block">
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base truncate">{job.name}</CardTitle>
                            <Badge variant="outline" className="scale-90 capitalize">{job.status || 'Unknown'}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">ID: #{job.id}</p>
                    </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
              No jobs found for this client.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
