import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "ORIX User" | "Fleet Manager" | "Finance Manager" | "IT Asset Manager" | "Viewer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  clientName?: string;
  isAdmin: boolean;
  accessLevel?: 'all' | 'multiple' | 'single';
  allowedClients?: string[];
}

export const superadminUser: AppUser = {
  id: "u1",
  name: "System Admin",
  email: "superadmin@orixindia.com",
  role: "ORIX User",
  isAdmin: true,
  accessLevel: 'all',
};

export const adminUser: AppUser = {
  id: "u2",
  name: "Account Manager",
  email: "admin@orixindia.com",
  role: "ORIX User",
  isAdmin: true,
  accessLevel: 'multiple',
  allowedClients: ["c1", "c2"], // Qualtech Edge and Infosys
};

export const clientUser: AppUser = {
  id: "u3",
  name: "Rajesh Verma",
  email: "rajesh@qualtechedge.com",
  role: "Fleet Manager",
  clientId: "c1",
  clientName: "Qualtech Edge Ltd",
  isAdmin: false,
  accessLevel: 'single',
};

export const relianceUser: AppUser = {
  id: "u4",
  name: "Anand Ambani",
  email: "user@reliance.com",
  role: "Fleet Manager",
  clientId: "c3",
  clientName: "Reliance Industries",
  isAdmin: false,
  accessLevel: 'single',
};

interface AuthContextType {
  user: AppUser | null;
  login: (type: "superadmin" | "admin" | "client" | "reliance") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (user?.clientId) {
      document.documentElement.setAttribute('data-theme', user.clientId);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [user]);

  const login = (type: "superadmin" | "admin" | "client" | "reliance") => {
    if (type === "superadmin") setUser(superadminUser);
    if (type === "admin") setUser(adminUser);
    if (type === "client") setUser(clientUser);
    if (type === "reliance") setUser(relianceUser);
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
