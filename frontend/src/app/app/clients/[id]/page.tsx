"use client"

import { useParams } from "next/navigation"
import { Building2, MapPin, Briefcase, Users, Calendar, TrendingUp } from "lucide-react"
import { format } from "date-fns"

import { FeatureHeader } from "@/components/feature-header"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { useClientQueries, useClientMutations, useClientComputedData } from "./use-client-detail"
import { ContactsTable } from "./client-contacts-table"
import { ClientJobsSection } from "./client-jobs-section"

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const clientId = parseInt(params.id)

  const { client, isLoading, error } = useClientQueries(clientId)
  const { handleSetKeyContact, handleDeleteContact } = useClientMutations(clientId)
  const { jobStats, keyContact, clientAgeDays } = useClientComputedData({
    jobs: client?.jobs,
    contacts: client?.contacts,
    keyContactId: client?.key_contact_id,
    createdAt: client?.created_at,
  })

  if (isLoading) return <div className="flex items-center justify-center p-8 h-full"><Spinner className="h-8 w-8" /></div>
  if (error || !client) return <div className="p-8 text-center text-muted-foreground">Client not found</div>

  return (
    <div className="flex flex-col gap-6">
      <FeatureHeader title={client.name} breadcrumbs={[{ label: "Clients", href: "/app/clients" }, { label: client.name }]}>
        <ClientHeaderMeta clientId={client.id} address={client.address} />
      </FeatureHeader>
      <div className="space-y-6 px-8 pb-8">
        <StatsGrid jobStats={jobStats} contactCount={client.contacts?.length ?? 0} keyContactName={keyContact?.name} clientAgeDays={clientAgeDays} createdAt={client.created_at} />
        <ContactsTable clientId={client.id} contacts={client.contacts} keyContactId={client.key_contact_id} resolvedKeyContactId={keyContact?.id} onSetKeyContact={handleSetKeyContact} onDeleteContact={handleDeleteContact} />
        <Separator />
        <ClientJobsSection clientId={client.id} jobs={client.jobs} />
      </div>
    </div>
  )
}

function ClientHeaderMeta({ clientId, address }: { clientId: number; address?: string | null }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
      <div className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /><span>Client #{clientId}</span></div>
      {address && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /><span>{address}</span></div>
        </>
      )}
    </div>
  )
}

interface StatsGridProps {
  jobStats: { total: number; active: number; completed: number; planned: number }
  contactCount: number
  keyContactName: string | undefined
  clientAgeDays: number
  createdAt: string
}

function StatsGrid({ jobStats, contactCount, keyContactName, clientAgeDays, createdAt }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />Total Jobs</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{jobStats.total}</span>
            {jobStats.active > 0 && <Badge variant="secondary" className="text-xs">{jobStats.active} active</Badge>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Job Status</CardDescription></CardHeader>
        <CardContent>
          <div className="flex gap-3 text-sm">
            <StatusDot color="bg-blue-500" label="Active" value={jobStats.active} />
            <StatusDot color="bg-green-500" label="Done" value={jobStats.completed} />
            <StatusDot color="bg-gray-400" label="Planned" value={jobStats.planned} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Contacts</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{contactCount}</span>
            {keyContactName && <span className="text-xs text-muted-foreground truncate">Key: {keyContactName}</span>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Client Since</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-medium">{format(new Date(createdAt), "MMM yyyy")}</span>
            <span className="text-xs text-muted-foreground">({clientAgeDays} days)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusDot({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
