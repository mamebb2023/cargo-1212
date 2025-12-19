import { createContext, useContext } from "react";
import type { AuthPayload, User } from "@/types";

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setSession: (payload: AuthPayload) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}