import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ROUTES } from "./constants";

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

// Utility to extract the caller component from the stack trace
const getCallerComponent = () => {
  try {
    throw new Error();
  } catch (e: any) {
    if (!e.stack) return "Unknown";
    const stackLines = e.stack.split('\\n');
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

// -- Axios Refresh Queue State --
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Prevent redirect storms — only redirect once
let isRedirecting = false;

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Token & Metadata
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { metadata?: any }) => {
    config.metadata = { startTime: new Date().getTime(), caller: getCallerComponent() };
    
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.url}\\n` +
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
      `[API Response] ${response.status} ${originalRequest.method?.toUpperCase()} ${originalRequest.url}\\n` +
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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; metadata?: any };

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

    // Handle 401 Unauthorized with Refresh Mutex Queue
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already redirecting to login, don't bother refreshing
      if (isRedirecting) {
        return Promise.reject({ message: "Session expired", status: 401, _silent: true });
      }

      if (isRefreshing) {
        // Queue this request — wait for the ongoing refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest._retry = true;
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(() => {
            // Silently reject queued requests — the redirect is already handled
            return Promise.reject({ message: "Session expired", status: 401, _silent: true });
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      let newToken = null;
      try {
        // Attempt to refresh token using the base axios instance (not apiClient)
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        newToken = res.data?.data?.accessToken;
        if (!newToken) {
          throw new Error("No access token in refresh response");
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        setAccessToken(null);

        // Redirect to login ONCE — prevent redirect storm
        if (typeof window !== "undefined" && !isRedirecting) {
          const publicPaths = [
            ROUTES.HOME,
            ROUTES.LOGIN,
            ROUTES.REGISTER,
            ROUTES.FORGOT_PASSWORD,
            "/home",
            "/admin/login"
          ];
          if (!publicPaths.includes(window.location.pathname)) {
            isRedirecting = true;
            window.location.href = ROUTES.LOGIN;
          }
        }
        return Promise.reject({ message: "Session expired", status: 401, _silent: true });
      } finally {
        isRefreshing = false;
      }

      if (newToken) {
        setAccessToken(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        processQueue(null, newToken);
        
        // Retry the original request (returns normalized response)
        // Execute this outside the try-catch so that if the retry fails (e.g. 500/404),
        // it doesn't accidentally trigger a logout!
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
