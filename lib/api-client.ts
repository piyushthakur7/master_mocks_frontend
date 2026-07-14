import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ROUTES } from "./constants";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for secure cookies if used
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    config.metadata = { startTime: new Date().getTime() };
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

// Response Interceptor: Handle 401, 429, Token Refresh, and Errors
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    // Normalize backend response: backend returns { statusCode, data, message }
    // but frontend expects { success, data, message }
    if (body && typeof body === "object" && "statusCode" in body && !("success" in body)) {
      body.success = body.statusCode >= 200 && body.statusCode < 300;
    }
    return body;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number; metadata?: any };

    const duration = originalRequest?.metadata?.startTime
      ? new Date().getTime() - originalRequest.metadata.startTime
      : 0;

    const correlationId = (error.response?.headers as any)?.['x-correlation-id'] || 'unknown';

    // Priority 4 & 5: Log full error with correlation ID
    console.error("API Request Failed", {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      response: error.response?.data,
      duration: `${duration}ms`,
      correlationId,
      stack: error.stack,
    });

    // Handle 429 Too Many Requests — auto-retry with exponential backoff
    if (error.response?.status === 429 && originalRequest) {
      const retryCount = originalRequest._retryCount || 0;
      const MAX_RETRIES = 3;

      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        const retryAfter = (error.response?.headers as any)?.["retry-after"];
        const delay = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, 5000)
          : Math.pow(2, retryCount) * 1000;

        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    // Priority 1 & 10: Handle 401 Unauthorized with Refresh Mutex Queue
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request instead of firing another refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token using the base axios instance
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          
          // Retry the original request (returns normalized response)
          return await apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        setAccessToken(null);
        if (typeof window !== "undefined") {
          const publicPaths = [
            ROUTES.HOME,
            ROUTES.LOGIN,
            ROUTES.REGISTER,
            ROUTES.FORGOT_PASSWORD,
            "/home",
            "/admin/login"
          ];
          if (!publicPaths.includes(window.location.pathname)) {
            window.location.href = ROUTES.LOGIN;
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Priority 3: Blob download error handling bypass
    // If the response is a blob, return it directly so the component can parse it
    if (error.response?.data instanceof Blob) {
      return Promise.reject(error.response.data);
    }

    // Priority 4 & 11: Standardize error object for friendly UX
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
