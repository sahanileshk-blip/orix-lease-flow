import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus, FileText, Wrench, Car, Monitor, RefreshCw,
  ReceiptText, DollarSign, FileBarChart, ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Action {
  label: string;
  icon: React.ElementType;
  navigate?: string;
  modal?: string;
  color: string;
}

const roleActions: Record<string, Action[]> = {
  "IT Asset Manager": [
    { label: "Add IT Asset",          icon: Plus,         navigate: "/it-assets", color: "text-indigo-500" },
    { label: "Assign Asset",          icon: Monitor,      navigate: "/it-assets", color: "text-sky-500"    },
    { label: "Raise IT Ticket",       icon: ClipboardList,navigate: "/tickets",   color: "text-amber-500" },
  ],
  "Vehicle Asset Manager": [
    { label: "Add Vehicle",           icon: Plus,         navigate: "/vehicles",  color: "text-sky-500"   },
    { label: "Assign Driver",         icon: Car,          navigate: "/vehicles",  color: "text-emerald-500"},
    { label: "Schedule Maintenance",  icon: Wrench,       navigate: "/tickets",   color: "text-orange-500"},
  ],
  "Lease Manager": [
    { label: "Create Lease",          icon: Plus,         navigate: "/quotes",    color: "text-emerald-500"},
    { label: "Renew Lease",           icon: RefreshCw,    navigate: "/contracts", color: "text-sky-500"   },
    { label: "Generate Invoice",      icon: ReceiptText,  navigate: "/invoices",  color: "text-violet-500"},
  ],
  "Finance Manager": [
    { label: "Generate Invoice",      icon: ReceiptText,  navigate: "/invoices",  color: "text-violet-500"},
    { label: "Record Payment",        icon: DollarSign,   navigate: "/invoices",  color: "text-emerald-500"},
    { label: "Export Report",         icon: FileBarChart, navigate: "/reports",   color: "text-sky-500"   },
  ],
  "ORIX User": [
    { label: "Create Lease",          icon: Plus,         navigate: "/quotes",    color: "text-emerald-500"},
    { label: "Generate Invoice",      icon: ReceiptText,  navigate: "/invoices",  color: "text-violet-500"},
    { label: "Raise Ticket",          icon: ClipboardList,navigate: "/tickets",   color: "text-amber-500" },
    { label: "Reports",               icon: FileText,     navigate: "/reports",   color: "text-sky-500"   },
  ],
};

export function QuickActionsBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!user || user.isPortalUser) return null;

  const actions: Action[] = roleActions[user.role] ?? roleActions["ORIX User"];

  const handleAction = (action: Action) => {
    if (action.navigate) {
      navigate(action.navigate);
    } else if (action.modal) {
      setActiveAction(action.modal);
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="hidden sm:flex items-center gap-1 border-l border-border/60 pl-3 ml-1">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleAction(action)}
              title={action.label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 active:scale-95 whitespace-nowrap"
            >
              <Icon className={`h-3.5 w-3.5 ${action.color}`} />
              <span className="hidden md:inline">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: collapsed icon row */}
      <div className="sm:hidden flex items-center gap-0.5">
        {actions.slice(0, 3).map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleAction(action)}
              title={action.label}
              className={`p-2 rounded-md hover:bg-muted transition-colors ${action.color}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{activeAction}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action form is coming soon.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
