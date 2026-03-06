"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { configureClient } from "@/lib/api-config";

const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const STALE_TIME_MS = SECONDS_PER_MINUTE * MS_PER_SECOND;

configureClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
