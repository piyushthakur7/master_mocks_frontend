"use client";

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useState } from "react";
import { isTransientError } from "./api-errors";

// Bump this string on deploys that change API shapes — it discards any
// previously persisted cache.
const CACHE_BUSTER = "mm-2026-07-19";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is served from cache without any request for this long.
            // Mock lists / resources / attempts don't change minute-to-minute,
            // and every avoided request matters on this rate-limited host.
            staleTime: 15 * 60 * 1000,
            // Keep data around long enough to survive reloads via the
            // localStorage persister below. With the default 5-minute gcTime,
            // persisted entries were garbage-collected almost immediately.
            gcTime: 24 * 60 * 60 * 1000,
            refetchOnWindowFocus: false, // Prevent refetch on tab switch/window focus
            // Deliberately NOT refetchOnMount:false — combined with the
            // persisted cache that froze data for up to 24h. Default behavior
            // refetches on mount ONLY when data is older than staleTime.
            // A network reconnect must not burst-refetch every active query.
            refetchOnReconnect: false,
            // Never retry a 429 — that just deepens the rate-limit hole — or a
            // real client error (400/403/404). Retry once for transient
            // network / 5xx failures, and for a 401 the API client is still
            // healing (token refresh backing off); a dead session's 401 is
            // flagged _silent and never retried.
            retry: (failureCount, error: any) => {
              const status = error?.status ?? error?.response?.status;
              if (status === 429) return false;
              return isTransientError(error) && failureCount < 1;
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
    // The async persister happily wraps synchronous storage (localStorage);
    // its sync sibling is deprecated in this version.
    createAsyncStoragePersister({
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
