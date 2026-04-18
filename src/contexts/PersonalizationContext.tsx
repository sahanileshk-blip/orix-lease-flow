import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface DashboardLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PersonalizationContextType {
  recentModules: { path: string; label: string; icon: string }[];
  trackModule: (path: string, label: string, icon: string) => void;
  dashboardLayout: DashboardLayoutItem[] | null;
  setDashboardLayout: (layout: DashboardLayoutItem[]) => void;
  resetDashboardLayout: () => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

const MAX_RECENT = 5;

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const recentKey = `orix_recent_${userId}`;
  const layoutKey = `orix_layout_${userId}`;

  const [recentModules, setRecentModules] = useState<{ path: string; label: string; icon: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(recentKey) ?? "[]"); } catch { return []; }
  });

  const [dashboardLayout, setDashboardLayoutState] = useState<DashboardLayoutItem[] | null>(() => {
    try {
      const saved = localStorage.getItem(layoutKey);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Re-load from storage when user changes
  useEffect(() => {
    try { setRecentModules(JSON.parse(localStorage.getItem(recentKey) ?? "[]")); } catch { setRecentModules([]); }
    try {
      const saved = localStorage.getItem(layoutKey);
      setDashboardLayoutState(saved ? JSON.parse(saved) : null);
    } catch { setDashboardLayoutState(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const trackModule = useCallback((path: string, label: string, icon: string) => {
    setRecentModules(prev => {
      const filtered = prev.filter(m => m.path !== path);
      const updated = [{ path, label, icon }, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(recentKey, JSON.stringify(updated));
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentKey]);

  const setDashboardLayout = useCallback((layout: DashboardLayoutItem[]) => {
    localStorage.setItem(layoutKey, JSON.stringify(layout));
    setDashboardLayoutState(layout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey]);

  const resetDashboardLayout = useCallback(() => {
    localStorage.removeItem(layoutKey);
    setDashboardLayoutState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey]);

  return (
    <PersonalizationContext.Provider value={{ recentModules, trackModule, dashboardLayout, setDashboardLayout, resetDashboardLayout }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) throw new Error("usePersonalization must be used within PersonalizationProvider");
  return ctx;
}
