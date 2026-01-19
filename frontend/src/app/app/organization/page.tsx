"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  readOrgOptions, 
  readInvitationsOptions,
  createInvitationMutation,
  resendInvitationMutation,
  deleteInvitationMutation,
  updateOrgUserMutation,
  removeOrgUserMutation,
} from "@/client/@tanstack/react-query.gen";
import { InvitationStatus, UserRole } from "@/client";
import { useAuth } from "@/context/auth-context";
import { FeatureHeader } from "@/components/feature-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Trash2, 
  Shield, 
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function OrganizationPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.MEMBER);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Fetch org data
  const { data: org, isLoading: isLoadingOrg } = useQuery({
    ...readOrgOptions(),
  });

  // Fetch invitations (admin only)
  const { data: invitations, isLoading: isLoadingInvitations } = useQuery({
    ...readInvitationsOptions(),
    enabled: isAdmin,
  });

  // Mutations
  const { mutate: createInvite, isPending: isCreatingInvite } = useMutation({
    ...createInvitationMutation(),
    onSuccess: () => {
      toast.success("Invitation sent!");
      setInviteEmail("");
      setInviteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: readInvitationsOptions().queryKey });
    },
    onError: () => {
      toast.error("Failed to send invitation");
    },
  });

  const { mutate: resendInvite } = useMutation({
    ...resendInvitationMutation(),
    onSuccess: () => {
      toast.success("Invitation resent!");
      queryClient.invalidateQueries({ queryKey: readInvitationsOptions().queryKey });
    },
    onError: () => {
      toast.error("Failed to resend invitation");
    },
  });

  const { mutate: deleteInvite } = useMutation({
    ...deleteInvitationMutation(),
    onSuccess: () => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({ queryKey: readInvitationsOptions().queryKey });
    },
    onError: () => {
      toast.error("Failed to cancel invitation");
    },
  });

  const { mutate: updateUser } = useMutation({
    ...updateOrgUserMutation(),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: readOrgOptions().queryKey });
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  const { mutate: removeUser } = useMutation({
    ...removeOrgUserMutation(),
    onSuccess: () => {
      toast.success("User removed");
      queryClient.invalidateQueries({ queryKey: readOrgOptions().queryKey });
    },
    onError: () => {
      toast.error("Failed to remove user");
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    createInvite({ body: { email: inviteEmail, role: inviteRole } });
  };

  const getStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PENDING:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case InvitationStatus.ACCEPTED:
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case InvitationStatus.EXPIRED:
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
  };

  const pendingInvitations = invitations?.filter(i => i.status === InvitationStatus.PENDING) || [];

  if (isLoadingOrg) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col max-w-4xl">
      <FeatureHeader title="Organization">
        {isAdmin && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to add a new member to {org?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.MEMBER}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Member
                          </div>
                        </SelectItem>
                        <SelectItem value={UserRole.ADMIN}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Admins can manage users and organization settings.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingInvite}>
                    {isCreatingInvite ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" />Send Invitation</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </FeatureHeader>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{org?.name}</CardTitle>
              <CardDescription>
                Created {org?.created_at && formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Members
            <Badge variant="secondary" className="ml-2">
              {org?.users?.length || 0}
            </Badge>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="invitations">
              Pending Invitations
              {pendingInvitations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {org?.users?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {member.id === user?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={member.role === UserRole.ADMIN ? "default" : "secondary"}>
                        {member.role === UserRole.ADMIN ? (
                          <><Shield className="h-3 w-3 mr-1" />Admin</>
                        ) : (
                          <><User className="h-3 w-3 mr-1" />Member</>
                        )}
                      </Badge>
                      {isAdmin && member.id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateUser({
                                path: { user_id: member.id },
                                body: { role: member.role === UserRole.ADMIN ? UserRole.MEMBER : UserRole.ADMIN },
                              })}
                            >
                              {member.role === UserRole.ADMIN ? (
                                <><User className="h-4 w-4 mr-2" />Make Member</>
                              ) : (
                                <><Shield className="h-4 w-4 mr-2" />Make Admin</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => removeUser({ path: { user_id: member.id } })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from organization
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="invitations" className="mt-4">
            {isLoadingInvitations ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : invitations && invitations.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="font-medium">{invitation.email}</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}</span>
                              <span>•</span>
                              <span>Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(invitation.status)}
                          <Badge variant="outline">
                            {invitation.role === UserRole.ADMIN ? "Admin" : "Member"}
                          </Badge>
                          {invitation.status === InvitationStatus.PENDING && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => resendInvite({ path: { invitation_id: invitation.id } })}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend invitation
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteInvite({ path: { invitation_id: invitation.id } })}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel invitation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending invitations</p>
                  <p className="text-sm">Invite team members to collaborate with you.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
