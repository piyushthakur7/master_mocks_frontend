// Classifies the rejections produced by lib/api-client.ts. The interceptor
// rejects with a plain { message, status } object, and some of those statuses
// describe a passing condition rather than a real answer from the server.

/**
 * True when a failed request is worth retrying: no response at all (dropped
 * connection, timeout), a throttle (408/429), a server error (5xx), or a 401
 * the interceptor is still healing (refresh backing off / failed transiently).
 * A 401 flagged `_silent` means the session is dead and the app is already
 * redirecting to /login — retrying that is pointless.
 */
export const isTransientError = (error: any): boolean => {
  if (!error || error._silent) return false;
  const status = error.status ?? error.response?.status;
  if (typeof status !== "number") return true;
  return status === 401 || status === 408 || status === 429 || status >= 500;
};

/** True when the server definitively said the thing doesn't exist / isn't yours. */
export const isNotFoundError = (error: any): boolean => {
  const status = error?.status ?? error?.response?.status;
  return status === 400 || status === 403 || status === 404;
};

/**
 * Runs `fn`, retrying transient failures (see isTransientError) with backoff.
 * For pages that load in a useEffect rather than through React Query — a
 * single failed request there used to render "not found" or bounce the
 * student to another page.
 */
export const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !isTransientError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.min(1500 * 2 ** attempt, 8000)));
    }
  }
};
