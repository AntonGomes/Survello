"use client";

import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  readUserMeOptions, 
  loginUserMutation, 
  registerUserMutation, 
  logoutUserMutation,
  createInvitationMutation,
} from "@/client/@tanstack/react-query.gen";
import type { UserRead, UserLogin, UserRegister } from "@/client/types.gen";
import { UserRole } from "@/client";

interface RegisterWithInvites extends UserRegister {
  inviteEmails?: string[];
}

interface AuthContextType {
  user: UserRead | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  login: (data: UserLogin) => void;
  register: (data: RegisterWithInvites) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Query for the current user
  const { data: user, isLoading } = useQuery({
    ...readUserMeOptions(),
    retry: false, // Don't retry on 401
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // 2. Login Mutation
  const { mutate: loginMutate } = useMutation({
    ...loginUserMutation(),
    onSuccess: () => {
      // Invalidate 'me' query to refetch user
      queryClient.invalidateQueries({ queryKey: readUserMeOptions().queryKey });
      router.push("/app");
    },
  });

  const login = (data: UserLogin) => {
    loginMutate({ body: data });
  };

  // 3. Register Mutation
  const { mutateAsync: registerMutate } = useMutation({
    ...registerUserMutation(),
  });

  // 3b. Create invitation mutation (for post-registration invites)
  const { mutateAsync: createInvite } = useMutation({
    ...createInvitationMutation(),
  });

  const register = async (data: RegisterWithInvites): Promise<void> => {
    const { inviteEmails, ...registerData } = data;
    
    // Register the user
    await registerMutate({ body: registerData });
    
    // Invalidate to get user data (needed for sending invites)
    await queryClient.invalidateQueries({ queryKey: readUserMeOptions().queryKey });
    
    // Send invitations if any
    if (inviteEmails && inviteEmails.length > 0) {
      const validEmails = inviteEmails.filter(e => e.trim());
      for (const email of validEmails) {
        try {
          await createInvite({ body: { email, role: UserRole.MEMBER } });
        } catch (e) {
          // Log but don't fail registration for invite errors
          console.error(`Failed to send invite to ${email}:`, e);
        }
      }
    }
    
    router.push("/app");
  };

  // 4. Logout Mutation
  const { mutate: logoutMutate } = useMutation({
    ...logoutUserMutation(),
    onSuccess: () => {
      // Clear ALL queries to ensure no stale user data
      queryClient.clear();
      router.push("/");
    },
  });

  const logout = () => {
    logoutMutate({});
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
