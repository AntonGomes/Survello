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

export function ClientCard({ client }: ClientCardProps) {
  // Find primary/key contact (first contact with email for now)
  const keyContact = client.contacts?.find(c => c.email) || client.contacts?.[0]
  
  // Count jobs by status if jobs are available
  const jobCount = client.jobs?.length ?? 0
  const activeJobCount = client.jobs?.filter(j => j.status === "active").length ?? 0
  
  return (
    <Link 
      href={`/app/clients/${client.id}`}
      className="block group focus:outline-none"
    >
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{client.name}</CardTitle>
              {client.address && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{client.address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Key Contact */}
          {keyContact ? (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Key Contact</p>
              <p className="font-medium text-sm">{keyContact.name}</p>
              {keyContact.role_title && (
                <p className="text-xs text-muted-foreground">{keyContact.role_title}</p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted/30 border border-dashed">
              <p className="text-xs text-muted-foreground text-center">No contacts</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{client.contacts?.length ?? 0} contacts</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{jobCount} jobs</span>
              {activeJobCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                  {activeJobCount} active
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Actions - stop propagation for email */}
          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            {keyContact?.email ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.href = `mailto:${keyContact.email}`
                }}
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Email
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                disabled
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                No email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
