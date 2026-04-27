import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus, FileText, Wrench, Car, Monitor, RefreshCw,
  ReceiptText, DollarSign, FileBarChart, ClipboardList, Settings2,
  FileSignature, UploadCloud, FolderOpen
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    { label: "Add IT Asset", icon: Plus, navigate: "/it-assets", color: "text-indigo-500" },
    { label: "Assign Asset", icon: Monitor, navigate: "/it-assets", color: "text-sky-500" },
    { label: "Raise IT Ticket", icon: ClipboardList, navigate: "/tickets", color: "text-amber-500" },
  ],
  "Vehicle Asset Manager": [
    { label: "Add Vehicle", icon: Plus, navigate: "/vehicles", color: "text-sky-500" },
    { label: "Assign Driver", icon: Car, navigate: "/vehicles", color: "text-emerald-500" },
    { label: "Schedule Maintenance", icon: Wrench, navigate: "/tickets", color: "text-orange-500" },
  ],
  "Lease Manager": [
    { label: "Create Lease", icon: Plus, navigate: "/quotes", color: "text-emerald-500" },
    { label: "Renew Lease", icon: RefreshCw, navigate: "/contracts", color: "text-sky-500" },
    { label: "Invoice", icon: ReceiptText, navigate: "/invoices", color: "text-violet-500" },
  ],
  "Finance Manager": [
    { label: "Invoice", icon: ReceiptText, navigate: "/invoices", color: "text-violet-500" },
    { label: "Record Payment", icon: DollarSign, navigate: "/invoices", color: "text-emerald-500" },
    { label: "Export Report", icon: FileBarChart, navigate: "/reports", color: "text-sky-500" },
  ],
  "ORIX User": [
    { label: "Invoice", icon: ReceiptText, navigate: "/invoices", color: "text-violet-500" },
    { label: "Reports", icon: FileText, navigate: "/reports", color: "text-sky-500" },
  ],
  "Fleet Manager": [
    { label: "Invoice", icon: ReceiptText, navigate: "/invoices", color: "text-violet-500" },
    { label: "Request Quotation", icon: FileSignature, navigate: "/quotes", color: "text-amber-500" },
    { label: "Document Center", icon: FolderOpen, navigate: "/documents", color: "text-sky-500" },
    { label: "View custom reports", icon: FileBarChart, navigate: "/reports", color: "text-emerald-500" },
  ],
  "IT Admin (ORIX)": [
    { label: "Config Login", icon: Settings2, navigate: "/login-config", color: "text-rose-500" },
  ],
};

export function QuickActionsBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!user || user.isIndividual) return null;

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
      <TooltipProvider delayDuration={150}>
        <div className="hidden sm:flex items-center gap-1.5 border-l border-border/60 pl-3 ml-1">
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleAction(action)}
                    className={`flex items-center justify-center p-2 rounded-md hover:bg-muted transition-all duration-150 active:scale-95 ${action.color}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {action.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

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
