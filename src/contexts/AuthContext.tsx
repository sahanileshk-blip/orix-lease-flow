import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole =
  | "IT Admin (ORIX)"
  | "RM - Orix"
  | "IT Asset Manager"
  | "Vehicle Asset Manager"
  | "Lease Manager"
  | "Finance Manager"
  | "Fleet Manager"
  | "Viewer";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  clientName?: string;
  isAdmin: boolean;
  isPortalUser?: boolean; // true for customer-facing portal accounts
  isIndividual?: boolean; // true for individual end-user (restricted access)
  accessLevel?: "all" | "multiple" | "single";
  allowedClients?: string[];
  lastLogin?: string; // ISO string
  lastActivity?: string;
}

/* ── Demo Users ────────────────────────────────────────────────────── */

export const superadminUser: AppUser = {
  id: "u1",
  name: "IT Admin (ORIX)",
  email: "superadmin@orixindia.com",
  role: "IT Admin (ORIX)",
  isAdmin: true,
  accessLevel: "all",
  lastLogin: new Date(Date.now() - 86400000).toISOString(),
  lastActivity: "Viewed Finance Reports",
};

export const adminUser: AppUser = {
  id: "u2",
  name: "RM - Orix",
  email: "admin@orixindia.com",
  role: "RM - Orix",
  isAdmin: true,
  accessLevel: "multiple",
  allowedClients: ["c1", "c2"],
  lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(),
  lastActivity: "Updated Lease Contract LC-2891",
};

export const itManagerUser: AppUser = {
  id: "u5",
  name: "Arjun Sharma",
  email: "arjun@orixindia.com",
  role: "IT Asset Manager",
  isAdmin: false,
  accessLevel: "all",
  lastLogin: new Date(Date.now() - 3600000 * 5).toISOString(),
  lastActivity: "Added 3 Equipment",
};

export const vehicleManagerUser: AppUser = {
  id: "u6",
  name: "Priya Nair",
  email: "priya@orixindia.com",
  role: "Vehicle Asset Manager",
  isAdmin: false,
  accessLevel: "all",
  lastLogin: new Date(Date.now() - 3600000 * 8).toISOString(),
  lastActivity: "Scheduled Maintenance — MH-01-AB-1234",
};

export const leaseManagerUser: AppUser = {
  id: "u7",
  name: "Rahul Mehta",
  email: "rahul@orixindia.com",
  role: "Lease Manager",
  isAdmin: false,
  accessLevel: "all",
  lastLogin: new Date(Date.now() - 3600000 * 3).toISOString(),
  lastActivity: "Created Lease LC-3021 for Wipro",
};

export const financeManagerUser: AppUser = {
  id: "u8",
  name: "Sneha Iyer",
  email: "sneha@orixindia.com",
  role: "Finance Manager",
  isAdmin: false,
  accessLevel: "all",
  lastLogin: new Date(Date.now() - 3600000 * 6).toISOString(),
  lastActivity: "Generated Invoice INV-20045",
};

export const clientUser: AppUser = {
  id: "u3",
  name: "Rajesh Verma",
  email: "rajesh@qualtechedge.com",
  role: "Fleet Manager",
  clientId: "c1",
  clientName: "Qualtech Edge Ltd",
  isAdmin: false,
  isPortalUser: true,
  accessLevel: "single",
  lastLogin: new Date(Date.now() - 3600000 * 4).toISOString(),
  lastActivity: "Downloaded Invoice INV-20041",
};

export const relianceUser: AppUser = {
  id: "u4",
  name: "Anand Ambani",
  email: "user@reliance.com",
  role: "Fleet Manager",
  clientId: "c3",
  clientName: "Reliance Industries",
  isAdmin: false,
  isPortalUser: true,
  accessLevel: "single",
  lastLogin: new Date(Date.now() - 3600000 * 12).toISOString(),
  lastActivity: "Raised Service Request SR-4521",
};

export const individualUser: AppUser = {
  id: "u9",
  name: "Arjun Mehta",
  email: "arjun.mehta@qualtechedge.com",
  role: "Viewer",
  clientId: "c1",
  clientName: "Qualtech Edge Ltd",
  isAdmin: false,
  isPortalUser: false,
  isIndividual: true,
  accessLevel: "single",
  lastLogin: new Date(Date.now() - 3600000 * 1).toISOString(),
  lastActivity: "Viewed Lease Dashboard",
};

export type LoginType =
  | "superadmin"
  | "admin"
  | "it-manager"
  | "vehicle-manager"
  | "lease-manager"
  | "finance-manager"
  | "client"
  | "reliance"
  | "individual";

interface AuthContextType {
  user: AppUser | null;
  login: (type: LoginType) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (user?.clientId) {
      document.documentElement.setAttribute("data-theme", user.clientId);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [user]);

  const login = (type: LoginType) => {
    const now = new Date().toISOString();
    const userMap: Record<LoginType, AppUser> = {
      superadmin: { ...superadminUser, lastLogin: now },
      admin: { ...adminUser, lastLogin: now },
      "it-manager": { ...itManagerUser, lastLogin: now },
      "vehicle-manager": { ...vehicleManagerUser, lastLogin: now },
      "lease-manager": { ...leaseManagerUser, lastLogin: now },
      "finance-manager": { ...financeManagerUser, lastLogin: now },
      client: { ...clientUser, lastLogin: now },
      reliance: { ...relianceUser, lastLogin: now },
      individual: { ...individualUser, lastLogin: now },
    };
    setUser(userMap[type]);
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
