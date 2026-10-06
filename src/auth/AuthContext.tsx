import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "../types/models";

interface AuthContextValue {
  role: UserRole | null;
  signIn: (role: UserRole) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const storageKey = "wayfinder-demo-role";
const roles: UserRole[] = ["student", "driver", "admin"];

function storedRole(): UserRole | null {
  const value = window.sessionStorage.getItem(storageKey);
  return roles.includes(value as UserRole) ? (value as UserRole) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(storedRole);
  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      signIn(nextRole) {
        window.sessionStorage.setItem(storageKey, nextRole);
        setRole(nextRole);
      },
      signOut() {
        window.sessionStorage.removeItem(storageKey);
        setRole(null);
      },
    }),
    [role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
