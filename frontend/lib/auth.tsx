"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "./api";

interface User {
  id: number;
  email: string;
  role: "admin" | "manager" | "customer";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const redirectByRole = useCallback(
    (role: string) => {
      switch (role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "manager":
          router.push("/manager/dashboard");
          break;
        default:
          router.push("/");
      }
    },
    [router]
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const { data } = await api.post("/auth/login/", { username, password });
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      redirectByRole(data.user.role);
    },
    [redirectByRole]
  );

  const register = useCallback(
    async (payload: RegisterData) => {
      await api.post("/auth/register/", payload);
      router.push("/login");
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch {
      // token may already be invalid
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
