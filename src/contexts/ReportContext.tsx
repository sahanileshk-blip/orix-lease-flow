import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ReportFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  module: string;
  filters: Record<string, string>;
  createdAt: string;
  status: 'Active' | 'Paused';
  scheduleFrequency?: ReportFrequency;
  scheduledEmail?: string;
  createdBy: string;
}

interface ReportContextType {
  reports: CustomReport[];
  addReport: (report: Omit<CustomReport, 'id' | 'createdAt' | 'status'>) => void;
  deleteReport: (id: string) => void;
  toggleStatus: (id: string) => void;
  scheduleReport: (id: string, frequency: ReportFrequency, email: string) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<CustomReport[]>(() => {
    const saved = localStorage.getItem('orix_custom_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('orix_custom_reports', JSON.stringify(reports));
  }, [reports]);

  const addReport = (reportData: Omit<CustomReport, 'id' | 'createdAt' | 'status'>) => {
    const newReport: CustomReport = {
      ...reportData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      status: 'Active'
    };
    setReports(prev => [newReport, ...prev]);
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const toggleStatus = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r
    ));
  };

  const scheduleReport = (id: string, frequency: ReportFrequency, email: string) => {
    setReports(prev => prev.map(r =>
      r.id === id ? { ...r, scheduleFrequency: frequency, scheduledEmail: email } : r
    ));
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, deleteReport, toggleStatus, scheduleReport }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReports must be used within ReportProvider");
  return ctx;
}
