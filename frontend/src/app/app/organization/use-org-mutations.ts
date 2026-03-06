"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createInvitationMutation, resendInvitationMutation, deleteInvitationMutation, updateOrgUserMutation, removeOrgUserMutation, readInvitationsOptions, readOrgOptions } from "@/client/@tanstack/react-query.gen"
import { UserRole } from "@/client"
import { toast } from "sonner"

export function useOrgMutations() {
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.MEMBER)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const { mutate: createInvite, isPending: isCreatingInvite } = useMutation({
    ...createInvitationMutation(),
    onSuccess: () => { toast.success("Invitation sent!"); setInviteEmail(""); setInviteDialogOpen(false); queryClient.invalidateQueries({ queryKey: readInvitationsOptions().queryKey }) },
    onError: () => { toast.error("Failed to send invitation") },
  })

  const { mutate: resendInvite } = useMutation({
    ...resendInvitationMutation(),
    onSuccess: () => { toast.success("Invitation resent!"); queryClient.invalidateQueries({ queryKey: readInvitationsOptions().queryKey }) },
    onError: () => { toast.error("Failed to resend invitation") },
  })

  const { mutate: deleteInvite } = useMutation({
    ...deleteInvitationMutation(),
    onSuccess: () => { toast.success("Invitation cancelled"); queryClient.invalidateQueries({ queryKey: readInvitationsOptions().queryKey }) },
    onError: () => { toast.error("Failed to cancel invitation") },
  })

  const { mutate: updateUser } = useMutation({
    ...updateOrgUserMutation(),
    onSuccess: () => { toast.success("User updated"); queryClient.invalidateQueries({ queryKey: readOrgOptions().queryKey }) },
    onError: () => { toast.error("Failed to update user") },
  })

  const { mutate: removeUser } = useMutation({
    ...removeOrgUserMutation(),
    onSuccess: () => { toast.success("User removed"); queryClient.invalidateQueries({ queryKey: readOrgOptions().queryKey }) },
    onError: () => { toast.error("Failed to remove user") },
  })

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    createInvite({ body: { email: inviteEmail, role: inviteRole } })
  }

  return {
    inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    inviteDialogOpen, setInviteDialogOpen,
    isCreatingInvite, handleInvite,
    resendInvite, deleteInvite, updateUser, removeUser,
  }
}
