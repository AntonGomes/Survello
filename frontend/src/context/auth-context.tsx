"use client";

import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { readUserMeOptions, loginUserMutation, registerUserMutation, logoutUserMutation, createInvitationMutation } from "@/client/@tanstack/react-query.gen";
import type { UserRead, UserLogin, UserRegister } from "@/client/types.gen";
import { UserRole } from "@/client";

interface RegisterWithInvites extends UserRegister {
  inviteEmails?: string[];
}

interface AuthContextType {
  user: UserRead | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  login: (data: UserLogin) => Promise<void>;
  register: (data: RegisterWithInvites) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function sendInvites(createInvite: (args: { body: { email: string; role: UserRole } }) => Promise<unknown>, emails: string[]) {
  const validEmails = emails.filter(e => e.trim());
  for (const email of validEmails) {
    try { await createInvite({ body: { email, role: UserRole.MEMBER } }); }
    catch (e) { console.error(`Failed to send invite to ${email}:`, e); }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({ ...readUserMeOptions(), retry: false });
  const isAdmin = user?.role === UserRole.ADMIN;

  const { mutateAsync: loginMutate } = useMutation({ ...loginUserMutation() });
  const login = async (data: UserLogin): Promise<void> => {
    await loginMutate({ body: data });
    await queryClient.invalidateQueries({ queryKey: readUserMeOptions().queryKey });
    router.push("/app");
  };

  const { mutateAsync: registerMutate } = useMutation({ ...registerUserMutation() });
  const { mutateAsync: createInvite } = useMutation({ ...createInvitationMutation() });

  const register = async (data: RegisterWithInvites): Promise<void> => {
    const { inviteEmails, ...registerData } = data;
    await registerMutate({ body: registerData });
    await queryClient.invalidateQueries({ queryKey: readUserMeOptions().queryKey });
    if (inviteEmails && inviteEmails.length > 0) await sendInvites(createInvite, inviteEmails);
    router.push("/app");
  };

  const { mutate: logoutMutate } = useMutation({
    ...logoutUserMutation(),
    onSuccess: () => { queryClient.clear(); router.push("/"); },
  });
  const logout = () => { logoutMutate({}); };

  return <AuthContext.Provider value={{ user, isLoading, isAdmin, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
