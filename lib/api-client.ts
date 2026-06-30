import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ROUTES } from "./constants";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for secure cookies if used
  headers: {
    "Content-Type": "application/json",
  },
});

// We'll manage the access token in memory or localStorage.
// For Next.js client components, localStorage is easy but not secure against XSS.
// A better approach is HttpOnly cookies + a /api/auth proxy route or handling it purely via Next.js server actions.
// Here we'll assume the backend issues JWTs that we manually attach,
// or the backend uses HttpOnly cookies so we don't need to manually attach the token.
// Assuming we store accessToken in memory/localStorage for this SPA-like behavior:

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

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

// Response Interceptor: Handle 401 and Token Refresh
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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using the refresh token
        // This assumes the refresh token is stored in an HttpOnly cookie
        // so withCredentials: true sends it automatically.
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.data?.data?.accessToken) {
          setAccessToken(res.data.data.accessToken);
          // Retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          }
          const retryRes = await axios(originalRequest);
          return retryRes.data; // Unpack
        }
      } catch (refreshError) {
        // Refresh token failed or expired, log user out
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 429 Rate Limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers?.['retry-after'];
      const waitTime = retryAfter ? `${retryAfter} seconds` : 'a moment';
      return Promise.reject({
        success: false,
        message: `Too many requests. Please wait ${waitTime} and try again.`,
        status: 429,
      });
    }

    // Unpack standard ApiError structure if possible
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);
