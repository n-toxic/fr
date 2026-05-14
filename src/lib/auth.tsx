import React, { createContext, useContext, useEffect, useState } from "react";
import { setAuthTokenGetter, setBaseUrl, useGetMe } from "./api";
import type { User } from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure API base URL once
setBaseUrl(import.meta.env.VITE_API_URL || "https://edev.fun");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem("techofy_token"); } catch { return null; }
  });

  useEffect(() => {
    setAuthTokenGetter(() => {
      try { return localStorage.getItem("techofy_token"); } catch { return null; }
    });
  }, []);

  const { data: user, isLoading } = useGetMe({
    query: { enabled: !!token, retry: false },
  });

  const login = (newToken: string) => {
    try { localStorage.setItem("techofy_token", newToken); } catch {}
    setToken(newToken);
    setAuthTokenGetter(() => newToken);
  };

  const logout = () => {
    try { localStorage.removeItem("techofy_token"); } catch {}
    setToken(null);
    setAuthTokenGetter(() => null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isLoading: !!token && isLoading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
