"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { getAccessToken, setAccessToken } from "./api-client";
import { USER_ROLES } from "./constants";
import { ROUTES } from "./constants";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Last-known-good profile, persisted so a throttled (429) or flaky session
// check on page load can fall back to it instead of rendering the app
// "logged out" while a perfectly valid token sits in localStorage. The
// backend remains the authority: a real 401 clears this cache.
const CACHED_USER_KEY = "cachedUser";
const CACHED_USER_AT_KEY = "cachedUserAt";
// If the profile was validated against the server within this window, page
// loads reuse it without a network round-trip at all — the single biggest
// source of page-load requests on a hair-trigger rate-limited host. Profile
// data rarely changes, and an expired token is healed by the refresh
// interceptor on the first real API call anyway.
const REVALIDATE_AFTER_MS = 10 * 60 * 1000;

const readCachedUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const cachedUserAgeMs = (): number => {
  if (typeof window === "undefined") return Infinity;
  const at = Number(localStorage.getItem(CACHED_USER_AT_KEY) || 0);
  return at > 0 ? Date.now() - at : Infinity;
};

const writeCachedUser = (user: User | null) => {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
      localStorage.setItem(CACHED_USER_AT_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
      localStorage.removeItem(CACHED_USER_AT_KEY);
    }
  } catch {}
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async (attempt = 0) => {
    const token = getAccessToken();
    if (!token) {
      writeCachedUser(null);
      setIsLoading(false);
      return;
    }

    // Hydrate instantly from the cached profile so reloads never flash a
    // logged-out state; the network check below revalidates in the background.
    const cached = readCachedUser();
    if (cached) {
      setUser(cached);
      setIsLoading(false);
      // Recently validated — skip the network check entirely. If the token
      // has actually expired, the first real API call refreshes it anyway.
      if (cachedUserAgeMs() < REVALIDATE_AFTER_MS) {
        return;
      }
    }

    try {
      // _silent429: the background session check must never surface a
      // rate-limit toast on page load.
      const response = await userService.getMe({ _silent429: true });
      // Handle different wrapper formats robustly
      const userData = (response?.data as any)?.user || response?.data || response;
      if (response?.success || userData?.email || userData?._id) {
        setUser(userData);
        writeCachedUser(userData);
      } else if (!cached) {
        setAccessToken(null);
      }
      setIsLoading(false);
    } catch (error: any) {
      // Drop the session ONLY on a real auth failure (401). A 429/5xx/network
      // error is transient — clearing state here logged the user out whenever
      // the host throttled a page-load burst.
      if (error?.status === 401) {
        setAccessToken(null);
        writeCachedUser(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.warn("Session check failed transiently; keeping session");
      if (cached) {
        // Cached profile already rendered above — nothing else to do.
        setIsLoading(false);
      } else if (attempt < 2) {
        // Token exists but we have no profile yet (first login on this
        // device) and the check was throttled: retry with backoff instead of
        // settling into a null user, which the layouts read as "logged out".
        setTimeout(() => fetchUser(attempt + 1), 4000 * (attempt + 1));
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    writeCachedUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error: any) {
      // API might return 401 if already logged out or token expired, which is fine.
      // We don't need to log this as an error since we're clearing the state anyway.
    } finally {
      setAccessToken(null);
      writeCachedUser(null);
      setUser(null);
      router.push(ROUTES.LOGIN);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === USER_ROLES.ADMIN,
        isStudent: user?.role === USER_ROLES.STUDENT,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
