"use client"

import { Shield, User, MoreHorizontal, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserRole } from "@/client"

interface Member {
  id: number
  name: string
  email: string
  role: UserRole
}

interface MembersListProps {
  members: Member[] | undefined
  currentUserId: number | undefined
  isAdmin: boolean
  onUpdateUser: (args: { path: { user_id: number }; body: { role: UserRole } }) => void
  onRemoveUser: (args: { path: { user_id: number } }) => void
}

export function MembersList({ members, currentUserId, isAdmin, onUpdateUser, onRemoveUser }: MembersListProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {members?.map((member) => (
            <MemberRow key={member.id} member={member} isCurrentUser={member.id === currentUserId} isAdmin={isAdmin} onUpdateUser={onUpdateUser} onRemoveUser={onRemoveUser} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MemberRow({ member, isCurrentUser, isAdmin, onUpdateUser, onRemoveUser }: {
  member: Member; isCurrentUser: boolean; isAdmin: boolean
  onUpdateUser: MembersListProps["onUpdateUser"]; onRemoveUser: MembersListProps["onRemoveUser"]
}) {
  const toggleRole = member.role === UserRole.ADMIN ? UserRole.MEMBER : UserRole.ADMIN

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><User className="h-5 w-5 text-muted-foreground" /></div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{member.name}</span>
            {isCurrentUser && <Badge variant="outline" className="text-xs">You</Badge>}
          </div>
          <span className="text-sm text-muted-foreground">{member.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={member.role === UserRole.ADMIN ? "default" : "secondary"}>
          {member.role === UserRole.ADMIN ? <><Shield className="h-3 w-3 mr-1" />Admin</> : <><User className="h-3 w-3 mr-1" />Member</>}
        </Badge>
        {isAdmin && !isCurrentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateUser({ path: { user_id: member.id }, body: { role: toggleRole } })}>
                {member.role === UserRole.ADMIN ? <><User className="h-4 w-4 mr-2" />Make Member</> : <><Shield className="h-4 w-4 mr-2" />Make Admin</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onRemoveUser({ path: { user_id: member.id } })}><Trash2 className="h-4 w-4 mr-2" />Remove from organisation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
