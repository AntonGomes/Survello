"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  readUserMeOptions, 
  loginUserMutation, 
  registerUserMutation, 
  logoutUserMutation 
} from "@/client/@tanstack/react-query.gen";
import type { UserRead, UserLogin, UserRegister } from "@/client/types.gen";

interface AuthContextType {
  user: UserRead | undefined;
  isLoading: boolean;
  login: (data: UserLogin) => void;
  register: (data: UserRegister) => void;
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
  const { mutate: registerMutate } = useMutation({
    ...registerUserMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readUserMeOptions().queryKey });
      router.push("/");
    },
  });

  const register = (data: UserRegister) => {
    registerMutate({ body: data });
  };

  // 4. Logout Mutation
  const { mutate: logoutMutate } = useMutation({
    ...logoutUserMutation(),
    onSuccess: () => {
      queryClient.setQueryData(readUserMeOptions().queryKey, undefined);
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
