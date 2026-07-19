import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { API_BASE_URL, ROUTES } from "./constants";

// When NEXT_PUBLIC_API_URL points the browser straight at the backend
// (bypassing the Next.js proxy so each user gets their own rate-limit
// bucket), a CORS misconfiguration would surface as network errors on every
// call. Rather than brick the site, flip to the same-origin proxy path for
// the rest of the session — it always works, just shares one IP bucket.
const PROXY_BASE = "/api/v1";
const IS_DIRECT_BASE = /^https?:\/\//i.test(API_BASE_URL);
let useProxyFallback = false;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for secure cookies if used
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

// -- In-Flight Request Deduplication (GET only) --
const inFlightRequests = new Map<string, Promise<any>>();
const originalGet = apiClient.get;

apiClient.get = async function (url: string, config?: any) {
  const key = url + JSON.stringify(config?.params || {});
  
  if (inFlightRequests.has(key)) {
    console.log(`[Deduplicated In-Flight] Reuse GET: ${url}`);
    return inFlightRequests.get(key);
  }
  
  const promise = originalGet.apply(this, [url, config] as any);
  inFlightRequests.set(key, promise);
  
  try {
    return await promise;
  } finally {
    // Only deduplicate while request is in-flight. Do not cache completed responses.
    inFlightRequests.delete(key);
  }
};

// -- Global Request Pacing --
// The Hostinger/LiteSpeed host punishes bursts: probing showed connection
// resets after just a few rapid requests. Space every outgoing request so a
// page's parallel queries drip onto the wire instead of arriving together.
const REQUEST_GAP_MS = 250;
let nextSlotAt = 0;
const waitForSlot = (): Promise<void> => {
  const now = Date.now();
  const slot = Math.max(now, nextSlotAt);
  nextSlotAt = slot + REQUEST_GAP_MS;
  return slot > now
    ? new Promise((resolve) => setTimeout(resolve, slot - now))
    : Promise.resolve();
};

// -- 429 Circuit Breaker --
// When the host imposes a real lockout (a long Retry-After, or a 429 that
// survived its one retry), sending more requests only deepens it. During the
// cooldown every request fails fast locally with a countdown message instead
// of touching the network. Capped so a bogus header can't brick the app.
let blockedUntil = 0;
const COOLDOWN_CAP_MS = 120_000;
const cooldownSecondsLeft = () =>
  Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000));
const enterCooldown = (ms: number) => {
  blockedUntil = Math.max(blockedUntil, Date.now() + Math.min(ms, COOLDOWN_CAP_MS));
};

// Utility to extract the caller component from the stack trace
const getCallerComponent = () => {
  try {
    throw new Error();
  } catch (e: any) {
    if (!e.stack) return "Unknown";
    const stackLines = e.stack.split('\n');
    for (let i = 2; i < stackLines.length; i++) {
      if (!stackLines[i].includes('api-client.ts') && !stackLines[i].includes('axios')) {
        return stackLines[i].trim();
      }
    }
    return "Unknown component";
  }
};

export const setAccessToken = (token: string | null) => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// -- Single-Flight Token Refresh --
// All 401'd requests await this one shared promise; only one POST
// /auth/refresh-token can ever be in flight at a time.
let refreshPromise: Promise<string> | null = null;

// Prevent redirect storms — only redirect once
let isRedirecting = false;

// Requests to auth endpoints must never trigger a token refresh:
// a 401 from /auth/login means "wrong credentials", not "expired session",
// and a 401 from /auth/refresh-token itself means the session is dead.
const isAuthEndpoint = (url?: string) => !!url && url.includes("/auth/");

const performTokenRefresh = async (): Promise<string> => {
  // Use the base axios instance (not apiClient) so this call can never
  // recurse into these interceptors. The endpoint sets the accessToken
  // cookie itself and returns { accessToken, refreshToken } in the body
  // (refreshToken unchanged — rotation was removed server-side).
  const refreshBase =
    IS_DIRECT_BASE && useProxyFallback ? PROXY_BASE : API_BASE_URL;
  const res = await axios.post(
    `${refreshBase}/auth/refresh-token`,
    {},
    { withCredentials: true }
  );
  const token = res.data?.data?.accessToken ?? res.data?.accessToken;
  if (!token) {
    // A 2xx with no token means the session is unusable — treat as auth
    // failure so the caller logs out rather than retrying forever.
    throw Object.assign(new Error("No access token in refresh response"), {
      status: 401,
    });
  }
  setAccessToken(token);
  return token;
};

const redirectToLoginOnce = () => {
  if (typeof window === "undefined" || isRedirecting) return;
  const publicPaths = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    "/home",
    "/admin/login",
  ];
  if (!publicPaths.includes(window.location.pathname)) {
    isRedirecting = true;
    window.location.href = ROUTES.LOGIN;
  }
};

// Request Interceptor: Circuit Breaker, Pacing, Attach Token & Metadata
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & { metadata?: any }) => {
    // Fail fast during an active rate-limit cooldown — don't touch the wire.
    if (Date.now() < blockedUntil) {
      const message = `Server is busy. Please try again in ${cooldownSecondsLeft()}s.`;
      if (typeof window !== "undefined" && !(config as any)._silent429) {
        toast.error(message, { id: "rate-limit-429" });
      }
      return Promise.reject({
        message,
        status: 429,
        _cooldown: true,
        route: config.url,
      });
    }

    await waitForSlot();

    if (IS_DIRECT_BASE && useProxyFallback) {
      config.baseURL = PROXY_BASE;
    }

    config.metadata = { startTime: new Date().getTime(), caller: getCallerComponent() };
    
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.url}\n` +
      `  Caller: ${config.metadata.caller}`
    );
    
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401, Token Refresh, and Errors
apiClient.interceptors.response.use(
  (response) => {
    const originalRequest = response.config as InternalAxiosRequestConfig & { metadata?: any };
    const duration = originalRequest?.metadata?.startTime
      ? new Date().getTime() - originalRequest.metadata.startTime
      : 0;
      
    console.log(
      `[API Response] ${response.status} ${originalRequest.method?.toUpperCase()} ${originalRequest.url}\n` +
      `  Duration: ${duration}ms`
    );

    const body = response.data;
    // Normalize backend response: backend returns { statusCode, data, message }
    // but frontend expects { success, data, message }
    if (body && typeof body === "object" && "statusCode" in body && !("success" in body)) {
      body.success = body.statusCode >= 200 && body.statusCode < 300;
    }
    return body;
  },
  async (error: AxiosError) => {
    // Rejections manufactured by the circuit breaker are already in their
    // final shape — pass them through untouched.
    if ((error as any)?._cooldown) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retry429?: boolean; _retryNet?: boolean; metadata?: any };

    const duration = originalRequest?.metadata?.startTime
      ? new Date().getTime() - originalRequest.metadata.startTime
      : 0;

    const correlationId = (error.response?.headers as any)?.['x-correlation-id'] || 'unknown';

    // Log error with correlation ID (but don't spam console for 401s handled by refresh)
    if (error.response?.status !== 401) {
      console.error("API Request Failed", {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        response: error.response?.data,
        duration: `${duration}ms`,
        correlationId,
      });
    }

    // Handle 401 Unauthorized with a single-flight refresh.
    // Auth endpoints are excluded: their 401s are credential errors, not
    // expired sessions, and must surface to the caller unchanged.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      // If already redirecting to login, don't bother refreshing
      if (isRedirecting) {
        return Promise.reject({ message: "Session expired", status: 401, _silent: true });
      }

      // Each request retries at most once, no matter how the refresh goes.
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      try {
        const token = await refreshPromise;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        // Retried outside performTokenRefresh so a failing retry (404/500)
        // can never be mistaken for a refresh failure and trigger a logout.
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        const refreshStatus =
          refreshError?.response?.status ?? refreshError?.status;

        // Log out ONLY when the refresh call itself came back 401 — the
        // session is truly dead. A 429/403/5xx/network failure during
        // refresh is transient: keep the token and let the request fail.
        if (refreshStatus === 401) {
          setAccessToken(null);
          redirectToLoginOnce();
          return Promise.reject({ message: "Session expired", status: 401, _silent: true });
        }

        return Promise.reject({
          message: "Could not reach the server. Please try again.",
          status: refreshStatus,
          route: originalRequest?.url,
        });
      }
    }

    // Handle 429 Too Many Requests. Honor Retry-After for a single gentle
    // backoff+retry, but ONLY for idempotent GET requests — auto-retrying a
    // POST/PUT/PATCH/DELETE could double-submit (e.g. duplicate login or
    // payment). A long Retry-After means a real lockout: surface the server's
    // message instead of spinning. Never trigger a logout on a 429.
    if (error.response?.status === 429 && !originalRequest._retry429) {
      const method = (originalRequest.method || "get").toLowerCase();
      const isIdempotent = method === "get" || method === "head";
      const retryAfterHeader = (error.response.headers as any)?.['retry-after'];
      const parsed = Number(retryAfterHeader);
      // Cap the wait so we never hang the UI for the full lockout window.
      const MAX_BACKOFF_MS = 5000;
      const waitMs = Number.isFinite(parsed) && parsed > 0
        ? Math.min(parsed * 1000, MAX_BACKOFF_MS)
        : 1500;

      // Only auto-retry idempotent reads when the wait is short (or unhinted).
      if (isIdempotent && (!Number.isFinite(parsed) || parsed * 1000 <= MAX_BACKOFF_MS)) {
        originalRequest._retry429 = true;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return apiClient(originalRequest);
      }

      // Reaching here means a real lockout (long Retry-After, or a throttled
      // mutation). Arm the circuit breaker so the app stops feeding it.
      enterCooldown(
        Number.isFinite(parsed) && parsed > 0 ? parsed * 1000 : 15_000
      );

      // Surface the server-provided message (e.g. "Too many login attempts…")
      // when present, so auth screens show something actionable.
      const serverMessage = (error.response.data as any)?.message;
      const message = serverMessage || "Too many requests, please wait a moment";

      // Global toast only for background reads: mutations (login, submit,
      // payment) surface the rejection through their own form handling, and
      // toasting here too produced stacked duplicates. Requests marked
      // _silent429 (session bootstrap) never toast. Fixed id so a burst
      // updates one toast. Never log out here — the host is just throttling.
      if (
        typeof window !== "undefined" &&
        isIdempotent &&
        !(originalRequest as any)._silent429
      ) {
        toast.error(message, { id: "rate-limit-429" });
      }

      return Promise.reject({
        message,
        status: 429,
        route: originalRequest?.url,
        correlationId,
      });
    }

    // A 429 that already used its one retry lands here — the host is firmly
    // throttling us. Arm the circuit breaker: same rules otherwise (toast only
    // for non-silent background reads, no further retries, never a logout).
    if (error.response?.status === 429) {
      const retryAfter2 = Number((error.response.headers as any)?.["retry-after"]);
      enterCooldown(
        Number.isFinite(retryAfter2) && retryAfter2 > 0 ? retryAfter2 * 1000 : 15_000
      );
      const method = (originalRequest?.method || "get").toLowerCase();
      const message =
        (error.response.data as any)?.message ||
        "Too many requests, please wait a moment";
      if (
        typeof window !== "undefined" &&
        (method === "get" || method === "head") &&
        !(originalRequest as any)?._silent429
      ) {
        toast.error(message, { id: "rate-limit-429" });
      }
      return Promise.reject({
        message,
        status: 429,
        route: originalRequest?.url,
        correlationId,
      });
    }

    // The host also sheds load by dropping connections outright (observed as
    // resets, not 429s). For idempotent reads, one gentle retry recovers these
    // blips instead of surfacing a scary "Unable to connect" to the student.
    if (
      !error.response &&
      !axios.isCancel(error) &&
      originalRequest &&
      !originalRequest._retryNet
    ) {
      // In direct-to-backend mode a network error may mean CORS is broken:
      // switch the whole session to the same-origin proxy before retrying.
      if (IS_DIRECT_BASE && !useProxyFallback) {
        useProxyFallback = true;
        console.warn("[api-client] Direct backend unreachable; falling back to proxy");
      }
      const method = (originalRequest.method || "get").toLowerCase();
      if (method === "get" || method === "head") {
        originalRequest._retryNet = true;
        if (IS_DIRECT_BASE && useProxyFallback) {
          originalRequest.baseURL = PROXY_BASE;
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
        return apiClient(originalRequest);
      }
    }

    // Blob download error handling bypass
    if (error.response?.data instanceof Blob) {
      return Promise.reject(error.response.data);
    }

    // Standardize error object for friendly UX
    let message = "Unable to connect to the server.";
    if (error.response) {
      if (error.response.status === 401) {
        message = "Session expired. Reconnecting...";
      } else if (error.response.status === 404) {
        message = "The requested resource is unavailable.";
      } else {
        const responseData = error.response.data as any;
        message = responseData?.message || error.message || "Unexpected error";
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({
      message,
      correlationId,
      status: error.response?.status,
      route: originalRequest?.url,
      originalError: error,
    });
  }
);
