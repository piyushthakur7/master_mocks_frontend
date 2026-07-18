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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      // _silent429: the background session check must never surface a
      // rate-limit toast on page load.
      const response = await userService.getMe({ _silent429: true });
      // Handle different wrapper formats robustly
      const userData = (response?.data as any)?.user || response?.data || response;
      if (response?.success || userData?.email || userData?._id) {
        setUser(userData);
      } else {
        setAccessToken(null);
      }
    } catch (error: any) {
      // Drop the token ONLY on a real auth failure (401). A 429/5xx/network
      // error is transient — clearing the token here silently logged the
      // user out whenever the host throttled a page-load burst.
      if (error?.status === 401) {
        setAccessToken(null);
      } else {
        console.warn("Session check failed transiently; keeping session");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error: any) {
      // API might return 401 if already logged out or token expired, which is fine.
      // We don't need to log this as an error since we're clearing the state anyway.
    } finally {
      setAccessToken(null);
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
