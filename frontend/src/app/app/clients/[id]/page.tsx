"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { 
  Building2, 
  MapPin, 
  Users,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Star,
  TrendingUp,
  MoreHorizontal,
  Trash2,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { readClientOptions, setKeyContactMutation, deleteClientContactMutation } from "@/client/@tanstack/react-query.gen"
import { FeatureHeader } from "@/components/feature-header"
import { CreateContactDialog } from "@/components/create-contact-dialog"
import { CreateJobDialog } from "@/components/create-job-dialog"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const clientId = parseInt(params.id)
  const queryClient = useQueryClient()
  
  const { data: client, isLoading, error } = useQuery({
    ...readClientOptions({ path: { client_id: clientId } })
  })

  const { mutate: setKeyContact } = useMutation({
    ...setKeyContactMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readClientOptions({ path: { client_id: clientId } }).queryKey,
      })
      toast.success("Key contact updated")
    },
    onError: () => {
      toast.error("Failed to update key contact")
    },
  })

  const { mutate: deleteContact } = useMutation({
    ...deleteClientContactMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readClientOptions({ path: { client_id: clientId } }).queryKey,
      })
      toast.success("Contact removed")
    },
    onError: () => {
      toast.error("Failed to remove contact")
    },
  })

  // Compute job statistics
  const jobStats = useMemo(() => {
    if (!client?.jobs) return { total: 0, active: 0, completed: 0, planned: 0 }
    const jobs = client.jobs
    return {
      total: jobs.length,
      active: jobs.filter(j => j.status === "active").length,
      completed: jobs.filter(j => j.status === "completed").length,
      planned: jobs.filter(j => j.status === "planned").length,
    }
  }, [client?.jobs])

  // Get the key contact
  const keyContact = useMemo(() => {
    if (!client?.contacts) return null
    if (client.key_contact_id) {
      return client.contacts.find(c => c.id === client.key_contact_id) || null
    }
    // Fallback: first contact with email
    return client.contacts.find(c => c.email) || client.contacts[0] || null
  }, [client?.contacts, client?.key_contact_id])

  // Calculate client age in days
  const clientAgeDays = useMemo(() => {
    if (!client?.created_at) return 0
    const created = new Date(client.created_at)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }, [client?.created_at])

  const handleSetKeyContact = (contactId: number) => {
    setKeyContact({
      path: { client_id: clientId, contact_id: contactId },
    })
  }

  const handleDeleteContact = (contactId: number) => {
    if (confirm("Are you sure you want to remove this contact?")) {
      deleteContact({
        path: { client_id: clientId, contact_id: contactId },
      })
    }
  }

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
    <div className="flex flex-col gap-6">
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

      <div className="space-y-6 px-8 pb-8">
        
        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Jobs */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Total Jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{jobStats.total}</span>
                {jobStats.active > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {jobStats.active} active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Job Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-medium">{jobStats.active}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Done:</span>
                  <span className="font-medium">{jobStats.completed}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-muted-foreground">Planned:</span>
                  <span className="font-medium">{jobStats.planned}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts Count */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{client.contacts?.length ?? 0}</span>
                {keyContact && (
                  <span className="text-xs text-muted-foreground truncate">
                    Key: {keyContact.name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Since */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Client Since
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-medium">
                  {format(new Date(client.created_at), "MMM yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({clientAgeDays} days)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Table Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Contacts
                </CardTitle>
                <CardDescription>
                  Manage contacts for this client. Set a key contact for quick communication.
                </CardDescription>
              </div>
              <CreateContactDialog clientId={client.id} />
            </div>
          </CardHeader>
          <CardContent>
            {client.contacts && client.contacts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Star className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>Key Contact</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.contacts.map(contact => {
                    const isKeyContact = client.key_contact_id === contact.id || 
                      (!client.key_contact_id && contact.id === keyContact?.id)
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Checkbox
                            checked={isKeyContact}
                            onCheckedChange={() => handleSetKeyContact(contact.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {contact.name}
                            {isKeyContact && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                <Star className="h-2.5 w-2.5 mr-0.5" />
                                Key
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contact.role_title || "—"}
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <a 
                              href={`mailto:${contact.email}`} 
                              className="flex items-center gap-1.5 text-primary hover:underline"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              {contact.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phone ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {contact.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSetKeyContact(contact.id)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Set as Key Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
                No contacts listed for this client. Add your first contact to get started.
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Jobs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Jobs ({client.jobs?.length ?? 0})
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
                            <Badge 
                              variant="outline" 
                              className={`scale-90 capitalize ${
                                job.status === "active" ? "border-blue-500 text-blue-600" :
                                job.status === "completed" ? "border-green-500 text-green-600" :
                                ""
                              }`}
                            >
                              {job.status || 'planned'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Job #{job.id}</span>
                          {job.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{job.address}</span>
                            </div>
                          )}
                        </div>
                    </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
              No jobs found for this client. Create a new job to get started.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
