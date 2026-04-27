import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface DocumentChecklistItem {
  id: string;
  name: string;
  isMandatory: boolean;
}

export interface ServiceRequestType {
  id: string;
  categoryId: string;
  name: string;
  documentChecklist: DocumentChecklistItem[];
}

export interface ServiceRequestCategory {
  id: string;
  name: string;
}

interface ServiceRequestContextType {
  categories: ServiceRequestCategory[];
  requestTypes: ServiceRequestType[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  addRequestType: (categoryId: string, name: string, checklist: DocumentChecklistItem[]) => void;
  updateRequestType: (id: string, name: string, checklist: DocumentChecklistItem[]) => void;
  deleteRequestType: (id: string) => void;
}

const ServiceRequestContext = createContext<ServiceRequestContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: ServiceRequestCategory[] = [
  { id: "cat1", name: "Vehicle" },
  { id: "cat2", name: "IT Equipment" },
  { id: "cat3", name: "Finance" },
];

const DEFAULT_TYPES: ServiceRequestType[] = [
  {
    id: "type1",
    categoryId: "cat1",
    name: "Service / Maintenance",
    documentChecklist: [
      { id: "doc1", name: "Maintenance Log", isMandatory: true },
      { id: "doc2", name: "Service Estimate", isMandatory: false },
    ],
  },
  {
    id: "type2",
    categoryId: "cat1",
    name: "Accident Reporting",
    documentChecklist: [
      { id: "doc3", name: "FIR Copy", isMandatory: true },
      { id: "doc4", name: "Insurance Policy", isMandatory: true },
      { id: "doc5", name: "Photos of Damage", isMandatory: false },
    ],
  },
  {
    id: "type3",
    categoryId: "cat2",
    name: "Hardware Issue",
    documentChecklist: [
      { id: "doc6", name: "Error Screenshot", isMandatory: true },
    ],
  },
];

export function ServiceRequestProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ServiceRequestCategory[]>(() => {
    const saved = localStorage.getItem("sr_categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [requestTypes, setRequestTypes] = useState<ServiceRequestType[]>(() => {
    const saved = localStorage.getItem("sr_types");
    return saved ? JSON.parse(saved) : DEFAULT_TYPES;
  });

  useEffect(() => {
    localStorage.setItem("sr_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("sr_types", JSON.stringify(requestTypes));
  }, [requestTypes]);

  const addCategory = (name: string) => {
    const newCat = { id: `cat_${Date.now()}`, name };
    setCategories([...categories, newCat]);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    setRequestTypes(requestTypes.filter(t => t.categoryId !== id));
  };

  const addRequestType = (categoryId: string, name: string, checklist: DocumentChecklistItem[]) => {
    const newType = { id: `type_${Date.now()}`, categoryId, name, documentChecklist: checklist };
    setRequestTypes([...requestTypes, newType]);
  };

  const updateRequestType = (id: string, name: string, checklist: DocumentChecklistItem[]) => {
    setRequestTypes(requestTypes.map(t => t.id === id ? { ...t, name, documentChecklist: checklist } : t));
  };

  const deleteRequestType = (id: string) => {
    setRequestTypes(requestTypes.filter(t => t.id !== id));
  };

  return (
    <ServiceRequestContext.Provider value={{
      categories,
      requestTypes,
      addCategory,
      updateCategory,
      deleteCategory,
      addRequestType,
      updateRequestType,
      deleteRequestType,
    }}>
      {children}
    </ServiceRequestContext.Provider>
  );
}

export function useServiceRequest() {
  const context = useContext(ServiceRequestContext);
  if (context === undefined) {
    throw new Error("useServiceRequest must be used within a ServiceRequestProvider");
  }
  return context;
}
