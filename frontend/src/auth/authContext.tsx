import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "@/api/auth";
import type { AuthRequest, User } from "@/api/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (creds: AuthRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const login = async (credentials: AuthRequest) => {
    const tokens = await authApi.login(credentials);
    localStorage.setItem("access_token", tokens.access_token);
    const me = await authApi.getMe();
    setUser(me);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      setLoading(false);
      return;
    }
    authApi.getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("access_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}