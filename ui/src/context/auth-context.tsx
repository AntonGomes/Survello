"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCurrentUserOptions, 
  loginMutation, 
  registerMutation, 
  logoutMutation 
} from "@/client/@tanstack/react-query.gen";
import type { UserRead, LoginRequest, SignupRequest } from "@/client/types.gen";

interface AuthContextType {
  user: UserRead | undefined;
  isLoading: boolean;
  login: (data: LoginRequest) => void;
  register: (data: SignupRequest) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Query for the current user
  const { data: user, isLoading } = useQuery({
    ...getCurrentUserOptions(),
    retry: false, // Don't retry on 401
  });

  // 2. Login Mutation
  const { mutate: loginMutate } = useMutation({
    ...loginMutation(),
    onSuccess: () => {
      // Invalidate 'me' query to refetch user
      queryClient.invalidateQueries({ queryKey: getCurrentUserOptions().queryKey });
      router.push("/app");
    },
  });

  const login = (data: LoginRequest) => {
    loginMutate({ body: data });
  };

  // 3. Register Mutation
  const { mutate: registerMutate } = useMutation({
    ...registerMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCurrentUserOptions().queryKey });
      router.push("/");
    },
  });

  const register = (data: SignupRequest) => {
    registerMutate({ body: data });
  };

  // 4. Logout Mutation
  const { mutate: logoutMutate } = useMutation({
    ...logoutMutation(),
    onSuccess: () => {
      queryClient.setQueryData(getCurrentUserOptions().queryKey, undefined);
      router.push("/");
    },
  });

  const logout = () => {
    logoutMutate({});
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
