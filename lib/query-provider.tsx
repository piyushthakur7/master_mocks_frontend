"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false, // Prevent refetch on tab switch/window focus
            refetchOnMount: false, // Prevent refetch on component remount if data is fresh
            // Never retry client errors (4xx). Retrying a 429 just deepens the
            // rate-limit hole; retrying other 4xx is pointless. Only retry once
            // for transient network / 5xx failures.
            retry: (failureCount, error: any) => {
              const status = error?.status ?? error?.response?.status;
              if (typeof status === "number" && status >= 400 && status < 500) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
