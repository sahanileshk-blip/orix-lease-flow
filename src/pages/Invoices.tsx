import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Download, MessageSquarePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function downloadCSV(data: any[], filename: string) {
  const headers = ['Invoice No', 'Client', 'Contract', 'Amount', 'Due Date', 'Paid Date', 'Status', 'Cost Center', 'Location', 'Remarks'];
  const rows = data.map(i => [
    i.invoiceNo, i.clientName, i.contractNo, i.amount, i.dueDate, i.paidDate || '', i.status, i.costCenter, i.location, i.remarks || ''
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const Invoices = () => {
  const { invoices } = useAppData();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const { toast } = useToast();

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search && !inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) && !inv.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  const openRemarkDialog = (inv: any) => {
    setSelectedInvoice(inv);
    setRemarkText(inv.remarks || "");
    setRemarkDialogOpen(true);
  };

  const handleSaveRemark = () => {
    setRemarkDialogOpen(false);
    toast({ title: "Remark Saved", description: `Remark for ${selectedInvoice?.invoiceNo} has been submitted to ORIX finance team.` });
    setSelectedInvoice(null);
    setRemarkText("");
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Invoices & Payments</h1>
          <p className="page-description">Track invoices, payments, and overdue balances</p>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'invoices.csv')}>
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-xl font-bold font-heading text-success mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-xl font-bold font-heading text-warning mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Overdue</p>
          <p className="text-xl font-bold font-heading text-destructive mt-1">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Client</th>
              <th>Contract</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Paid Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium">{inv.invoiceNo}</td>
                <td>{inv.clientName}</td>
                <td className="text-muted-foreground">{inv.contractNo}</td>
                <td>{formatCurrency(inv.amount)}</td>
                <td>{inv.dueDate}</td>
                <td className="text-muted-foreground">{inv.paidDate || '—'}</td>
                <td>
                  <span className={`status-badge ${inv.status === 'Paid' ? 'status-active' : inv.status === 'Pending' ? 'status-pending' : 'status-overdue'}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  {inv.remarks ? (
                    <span className="text-xs text-destructive max-w-[150px] truncate block" title={inv.remarks}>
                      ⚠ {inv.remarks}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remark Dialog */}
      <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Remark — {selectedInvoice?.invoiceNo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Client:</span> {selectedInvoice?.clientName}</p>
              <p><span className="text-muted-foreground">Amount:</span> {selectedInvoice ? formatCurrency(selectedInvoice.amount) : ''}</p>
              <p><span className="text-muted-foreground">Status:</span> {selectedInvoice?.status}</p>
            </div>
            <div className="space-y-2">
              <Label>Remarks / Disagreement Details</Label>
              <Textarea
                placeholder="Enter your remarks regarding this invoice (e.g., amount mismatch, disputed charges, etc.)..."
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRemarkDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRemark}>Submit Remark</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Invoices;
