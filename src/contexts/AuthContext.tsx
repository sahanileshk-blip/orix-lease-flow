import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "ORIX Admin" | "Fleet Manager" | "Finance Manager" | "IT Asset Manager" | "Viewer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  clientName?: string;
  isAdmin: boolean;
}

const adminUser: AppUser = {
  id: "u1",
  name: "Admin Kumar",
  email: "admin@orixindia.com",
  role: "ORIX Admin",
  isAdmin: true,
};

const clientUser: AppUser = {
  id: "u2",
  name: "Rajesh Verma",
  email: "rajesh@tatamotors.com",
  role: "Fleet Manager",
  clientId: "c1",
  clientName: "Tata Motors Ltd",
  isAdmin: false,
};

interface AuthContextType {
  user: AppUser | null;
  login: (type: "admin" | "client") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const login = (type: "admin" | "client") => {
    setUser(type === "admin" ? adminUser : clientUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
