import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../services/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe: boolean) => User;
  logout: () => void;
  isOwner: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setIsLoading(false);
  }, []);

  function login(username: string, password: string, rememberMe: boolean) {
    const loggedUser = authService.login(username, password, rememberMe);
    setUser(loggedUser);
    return loggedUser;
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  function refreshUser() {
    setUser(authService.getCurrentUser());
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, isOwner: user?.role === "owner", refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
