"use client"

import { useQuery } from "@tanstack/react-query"
import { readOrgOptions, readInvitationsOptions } from "@/client/@tanstack/react-query.gen"
import { InvitationStatus, UserRole } from "@/client"
import { useAuth } from "@/context/auth-context"
import { FeatureHeader } from "@/components/feature-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Mail, Shield, User, Building2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { useOrgMutations } from "./use-org-mutations"
import { MembersList } from "./members-list"
import { InvitationsList } from "./invitations-list"

export default function OrganizationPage() {
  const { user, isAdmin } = useAuth()
  const { data: org, isLoading: isLoadingOrg } = useQuery({ ...readOrgOptions() })
  const { data: invitations, isLoading: isLoadingInvitations } = useQuery({ ...readInvitationsOptions(), enabled: isAdmin })

  const mutations = useOrgMutations()
  const pendingInvitations = invitations?.filter(i => i.status === InvitationStatus.PENDING) || []

  if (isLoadingOrg) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6 h-full flex flex-col max-w-4xl">
      <FeatureHeader title="Organisation">
        {isAdmin && <InviteDialog mutations={mutations} orgName={org?.name} />}
      </FeatureHeader>

      <OrgInfoCard org={org} />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members<Badge variant="secondary" className="ml-2">{org?.users?.length || 0}</Badge></TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="invitations">
              Pending Invitations
              {pendingInvitations.length > 0 && <Badge variant="secondary" className="ml-2">{pendingInvitations.length}</Badge>}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <MembersList members={org?.users as never} currentUserId={user?.id} isAdmin={isAdmin} onUpdateUser={mutations.updateUser} onRemoveUser={mutations.removeUser} />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="invitations" className="mt-4">
            <InvitationsList invitations={invitations as never} isLoading={isLoadingInvitations} onResend={mutations.resendInvite} onDelete={mutations.deleteInvite} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function OrgInfoCard({ org }: { org: { name?: string; created_at?: string } | undefined }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
          <div>
            <CardTitle>{org?.name}</CardTitle>
            <CardDescription>Created {org?.created_at && formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

function InviteDialog({ mutations, orgName }: {
  mutations: ReturnType<typeof useOrgMutations>; orgName: string | undefined
}) {
  return (
    <Dialog open={mutations.inviteDialogOpen} onOpenChange={mutations.setInviteDialogOpen}>
      <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 mr-2" />Invite User</Button></DialogTrigger>
      <DialogContent>
        <form onSubmit={mutations.handleInvite}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation email to add a new member to {orgName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="colleague@example.com" value={mutations.inviteEmail} onChange={(e) => mutations.setInviteEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={mutations.inviteRole} onValueChange={(v) => mutations.setInviteRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.MEMBER}><div className="flex items-center gap-2"><User className="h-4 w-4" />Member</div></SelectItem>
                  <SelectItem value={UserRole.ADMIN}><div className="flex items-center gap-2"><Shield className="h-4 w-4" />Admin</div></SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Admins can manage users and organisation settings.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => mutations.setInviteDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutations.isCreatingInvite}>
              {mutations.isCreatingInvite ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Mail className="h-4 w-4 mr-2" />Send Invitation</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
