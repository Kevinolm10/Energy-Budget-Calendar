import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "@/api/auth";
import type { AuthRequest, User } from "@/api/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (creds: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials: AuthRequest) => {
    await authApi.login(credentials);
    const me = await authApi.getMe();
    setUser(me);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        await authApi.refreshSession();
        const me = await authApi.getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}