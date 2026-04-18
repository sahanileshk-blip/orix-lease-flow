import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { X, IndianRupee } from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

interface LeaseRow {
  id: string;
  client: string;
  asset: string;
  value: number;
  status: string;
}

interface DrillDownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  month?: string;
  rows: LeaseRow[];
  summary?: { label: string; value: string }[];
}

const statusColor: Record<string, string> = {
  Disbursed: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  "Partially Disbursed": "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  Foreclosed: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
  Active: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  Projected: "text-sky-600 bg-sky-50 dark:bg-sky-900/20",
};

export function DrillDownModal({ open, onClose, title, month, rows, summary }: DrillDownModalProps) {
  const navigate = useNavigate();
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading text-base">
              {title} {month && <span className="text-muted-foreground font-normal">— {month}</span>}
            </DialogTitle>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {summary && summary.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            {summary.map(s => (
              <div key={s.label} className="bg-muted/40 rounded-lg p-3 border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className="text-sm font-bold font-heading mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/70 backdrop-blur-sm">
              <tr>
                <th className="text-left text-xs text-muted-foreground font-medium py-2.5 px-4">Lease ID</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-2.5 px-4">Client</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-2.5 px-4 hidden sm:table-cell">Asset</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-2.5 px-4">Value</th>
                <th className="text-center text-xs text-muted-foreground font-medium py-2.5 px-4 hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">No leases found for this period.</td></tr>
              )}
              {rows.map(row => (
                <tr key={row.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-xs">
                    <button 
                      onClick={() => {
                        onClose();
                        navigate(`/leases/${row.id}`);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      {row.id}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-xs">{row.client}</td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs hidden sm:table-cell">{row.asset}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-xs">{formatCurrency(row.value)}</td>
                  <td className="py-2.5 px-4 text-center hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[row.status] ?? "bg-muted text-muted-foreground"}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="sticky bottom-0 bg-card border-t">
                <tr>
                  <td colSpan={3} className="py-2.5 px-4 text-xs font-medium flex items-center gap-1">
                    <IndianRupee className="h-3 w-3 text-muted-foreground" /> Total
                  </td>
                  <td className="py-2.5 px-4 text-right text-xs font-bold">{formatCurrency(total)}</td>
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
