"use client"

import { Mail, MoreHorizontal, Trash2, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InvitationStatus, UserRole } from "@/client"

interface Invitation {
  id: number
  email: string
  role: UserRole
  status: InvitationStatus
  created_at: string
  expires_at: string
}

interface InvitationsListProps {
  invitations: Invitation[] | undefined
  isLoading: boolean
  onResend: (args: { path: { invitation_id: number } }) => void
  onDelete: (args: { path: { invitation_id: number } }) => void
}

function getStatusBadge(status: InvitationStatus) {
  switch (status) {
    case InvitationStatus.PENDING:
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    case InvitationStatus.ACCEPTED:
      return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>
    case InvitationStatus.EXPIRED:
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>
  }
}

export function InvitationsList({ invitations, isLoading, onResend, onDelete }: InvitationsListProps) {
  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No pending invitations</p>
          <p className="text-sm">Invite team members to collaborate with you.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {invitations.map((inv) => (
            <InvitationRow key={inv.id} invitation={inv} onResend={onResend} onDelete={onDelete} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function InvitationRow({ invitation, onResend, onDelete }: {
  invitation: Invitation; onResend: InvitationsListProps["onResend"]; onDelete: InvitationsListProps["onDelete"]
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><Mail className="h-5 w-5 text-muted-foreground" /></div>
        <div>
          <span className="font-medium">{invitation.email}</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}</span>
            <span>{"\u2022"}</span>
            <span>Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {getStatusBadge(invitation.status)}
        <Badge variant="outline">{invitation.role === UserRole.ADMIN ? "Admin" : "Member"}</Badge>
        {invitation.status === InvitationStatus.PENDING && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onResend({ path: { invitation_id: invitation.id } })}><Mail className="h-4 w-4 mr-2" />Resend invitation</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete({ path: { invitation_id: invitation.id } })}><Trash2 className="h-4 w-4 mr-2" />Cancel invitation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
