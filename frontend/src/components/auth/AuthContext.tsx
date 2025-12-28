// src/components/auth/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { type Grade } from '../api/grades';
import { fetchAdminGradeSelection } from '../api/users';
import { useChange } from "./ChangeContext";

type DecodedToken = {
  sub: string;
  is_admin: boolean;
  exp: number;
};

type User = {
  username: string;
  is_admin: boolean;
};

type Role = "admin" | "user";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  effectiveRole: Role;
  viewAsRole: Role | null;
  adminGradeSelection: Grade[] | null;
  setViewAsRole: (role: Role | null) => void;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function isTokenValid(token: string | null) {
  if (!token) return false;
  try {
    const d: DecodedToken = jwtDecode(token);
    return d.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [viewAsRole, setViewAsRole] = useState<Role | null>(null);
  const [adminGradeSelection, setAdminGradeSelection] = useState<Grade[] | null>(null);
  const {version} = useChange();


  const loadAdminGradeSelection = async () => {
    try {
      const data = await fetchAdminGradeSelection();
      setAdminGradeSelection(data.Grade);
    } catch (err) {
      setAdminGradeSelection(null);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      loadAdminGradeSelection();  
    } else {  
      setAdminGradeSelection(null);
    }
  }, [version, user]);

  const effectiveRole: Role =
    viewAsRole ?? (user?.is_admin ? "admin" : "user");

  const login = async (username: string, password: string) => {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);

    const res = await api.post("/auth/login", form);
    const token = res.data.access_token;

    localStorage.setItem("access_token", token);

    const decoded = jwtDecode<DecodedToken>(token);

    setUser({ username: decoded.sub, is_admin: decoded.is_admin });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    setViewAsRole(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!isTokenValid(token)) return logout();

    const decoded = jwtDecode<DecodedToken>(token!);
    setUser({ username: decoded.sub, is_admin: decoded.is_admin });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        effectiveRole,
        viewAsRole,
        setViewAsRole,
        login,
        logout,
        adminGradeSelection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
