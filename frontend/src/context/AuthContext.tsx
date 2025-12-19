import { useCallback, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/lib/api";
import type { AuthPayload, User } from "@/types";
import { AuthContext } from "@/hooks/useAuth";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setSession: (payload: AuthPayload) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setLoading(false);
  }, []);

  const setSession = useCallback((payload: AuthPayload) => {
    localStorage.setItem("access_token", payload.access_token);
    localStorage.setItem("refresh_token", payload.refresh_token);
    setUser(payload.user);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.getCurrentUser();
      if (response.data) {
        setUser(response.data as User);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    setSession,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
