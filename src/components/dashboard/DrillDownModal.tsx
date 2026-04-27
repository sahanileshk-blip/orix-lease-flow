import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TablePagination, usePagination } from "@/components/TablePagination";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export interface DrillColumn {
  key: string;
  label: string;
  type?: 'currency' | 'status' | 'link' | 'text' | 'number';
  hiddenOnMobile?: boolean;
}

interface DrillDownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  month?: string;
  columns?: DrillColumn[];
  rows: any[];
  summary?: { label: string; value: string }[];
}

const statusColor: Record<string, string> = {
  Disbursed: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  Foreclosed: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
  Active: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  Projected: "text-sky-600 bg-sky-50 dark:bg-sky-900/20",
  Success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  Failure: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
  Pending: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  Paid: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  Overdue: "text-rose-600 bg-rose-50 dark:bg-rose-900/20"
};

export function DrillDownModal({ open, onClose, title, month, rows, summary, columns }: DrillDownModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExport = () => {
    toast({ title: "Export Started", description: "Your data is being exported to CSV." });
  };

  const targetColumns = columns || [
    { key: 'id', label: 'Lease ID', type: 'link' },
    { key: 'client', label: 'Client', type: 'text' },
    { key: 'asset', label: 'Asset', type: 'text', hiddenOnMobile: true },
    { key: 'value', label: 'Value', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status', hiddenOnMobile: true },
  ];

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(rows, 5);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-5">
        <DialogHeader className="shrink-0 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-heading text-lg">
                {title} {month && <span className="text-muted-foreground font-normal">— {month}</span>}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex h-8 text-xs bg-card" onClick={handleExport}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export Data
              </Button>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {summary && summary.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0 mb-3">
            {summary.map(s => (
              <div key={s.label} className="bg-card shadow-sm rounded-lg p-3 border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                <p className="text-sm font-bold font-heading mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/70 backdrop-blur-sm z-10 border-b">
              <tr>
                {targetColumns.map(col => (
                  <th key={col.key} className={`text-left text-xs text-muted-foreground font-medium py-3 px-4 ${col.hiddenOnMobile ? 'hidden sm:table-cell' : ''}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 && (
                <tr><td colSpan={targetColumns.length} className="text-center py-10 text-muted-foreground text-xs">No records found.</td></tr>
              )}
              {paginatedItems.map((row, i) => (
                <tr key={row.id || i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  {targetColumns.map(col => {
                    const val = row[col.key];
                    if (val === undefined || val === null) return <td key={col.key} className={`py-2 px-4 text-xs text-muted-foreground ${col.hiddenOnMobile ? 'hidden sm:table-cell' : ''}`}>—</td>;

                    return (
                      <td key={col.key} className={`py-2 px-4 text-xs ${col.type === 'currency' ? 'text-left font-medium' : ''} ${col.hiddenOnMobile ? 'hidden sm:table-cell' : ''}`}>
                        {col.type === 'link' ? (
                          <button onClick={() => { onClose(); navigate(row.linkTo || `/leases/${row.id || val}`); }} className="text-primary hover:underline font-medium break-words text-left max-w-[150px]">
                            {val}
                          </button>
                        ) : col.type === 'currency' ? (
                          formatCurrency(Number(val))
                        ) : col.type === 'status' ? (
                          <span className={`inline-flex items-center justify-center min-w-[70px] px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${statusColor[String(val)] ?? "bg-muted text-foreground"}`}>
                            {val}
                          </span>
                        ) : col.type === 'number' ? (
                          <span className="font-semibold">{val}</span>
                        ) : (
                          <span className="break-words max-w-[200px] line-clamp-2">{val}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            totalItems={totalItems}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
