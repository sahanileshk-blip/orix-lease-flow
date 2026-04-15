import React, { createContext, useContext, useState } from "react";

interface FilterContextType {
  clientFilter: string[];
  setClientFilter: (v: string[]) => void;
  costCenterFilter: string[];
  setCostCenterFilter: (v: string[]) => void;
  locationFilter: string[];
  setLocationFilter: (v: string[]) => void;
  leaseStatusFilter: string[];
  setLeaseStatusFilter: (v: string[]) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [clientFilter, setClientFilter] = useState<string[]>([]);
  const [costCenterFilter, setCostCenterFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [leaseStatusFilter, setLeaseStatusFilter] = useState<string[]>([]);

  return (
    <FilterContext.Provider value={{
      clientFilter, setClientFilter,
      costCenterFilter, setCostCenterFilter,
      locationFilter, setLocationFilter,
      leaseStatusFilter, setLeaseStatusFilter,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
