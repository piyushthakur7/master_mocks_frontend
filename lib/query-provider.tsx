"use client";

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState } from "react";

// Bump this string on deploys that change API shapes — it discards any
// previously persisted cache.
const CACHE_BUSTER = "mm-2026-07-19";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Keep data around long enough to survive reloads via the
            // localStorage persister below. With the default 5-minute gcTime,
            // persisted entries were garbage-collected almost immediately.
            gcTime: 24 * 60 * 60 * 1000,
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

  // Persist the query cache to localStorage. A hard reload previously wiped
  // the in-memory cache, so every reload re-fired every query — which is
  // exactly the burst the host's rate limiter punishes. With persistence,
  // a reload renders from the stored cache and only stale queries refetch.
  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      key: "mm-query-cache",
      throttleTime: 2000,
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000,
        buster: CACHE_BUSTER,
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
