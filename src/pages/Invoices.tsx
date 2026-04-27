import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaveReportModal } from "@/components/SaveReportModal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Download, MessageSquarePlus, Save, CreditCard, Building2, Smartphone, FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFilter } from "@/contexts/FilterContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TablePagination, usePagination } from "@/components/TablePagination";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function downloadCSV(data: any[], filename: string) {
  const headers = ['Invoice No', 'Client', 'Lease ID', 'Location', 'Cost Center', 'Amount', 'Due Date', 'Paid Date', 'Status'];
  const rows = data.map(i => [
    i.invoiceNo, i.clientName, i.contractNo, i.location, i.costCenter, i.amount, i.dueDate, i.paidDate || '', i.status
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
  const { clientFilter, costCenterFilter, locationFilter } = useFilter();
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePayNow = (inv: any) => {
    setSelectedInvoice(inv);
    setPaymentModalOpen(true);
  };

  const filtered = invoices.filter((inv) => {
    if (statusFilter.length > 0 && !statusFilter.includes(inv.status)) return false;
    if (search && !inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) && !inv.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateRange.start && inv.dueDate < dateRange.start) return false;
    if (dateRange.end && inv.dueDate > dateRange.end) return false;
    return true;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(filtered, 5);

  const currentYear = new Date().getFullYear();
  const totalPaidYTD = invoices
    .filter(i => i.status === 'Paid' && i.paidDate && i.paidDate.startsWith(currentYear.toString()))
    .reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  const handleRequestInvoice = (inv: any) => {
    toast({
      title: "Request Submitted",
      description: `Your request for invoice ${inv.invoiceNo} has been sent to the support team.`,
    });
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Invoices & Payments</h1>
          <p className="page-description">Track lease invoices, payments, and outstanding dues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setReportModalOpen(true)}>
            <Save className="h-4 w-4" /> Save Custom Report
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'invoices.csv')}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Paid(YTD)</p>
          <p className="text-xl font-bold font-heading text-success mt-1">{formatCurrency(totalPaidYTD)}</p>
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
        <MultiSelect
          placeholder="Status"
          className="w-[160px]"
          selected={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Paid", value: "Paid" },
            { label: "Pending", value: "Pending" },
            { label: "Overdue", value: "Overdue" },
          ]}
        />
        <div className="flex items-center gap-2">
          <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="h-9 text-xs" title="From Date (Due Date)" />
          <span className="text-muted-foreground text-xs">to</span>
          <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="h-9 text-xs" title="To Date (Due Date)" />
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No.</th>
              {user?.isAdmin && <th>Client</th>}
              <th>Lease ID</th>
              <th>Location</th>
              <th>Cost Center</th>
              <th>Generated Date</th>
              <th>Amount Breakup</th>
              <th>Due Date</th>
              <th>Paid Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium">{inv.invoiceNo}</td>
                {user?.isAdmin && <td>{inv.clientName}</td>}
                <td className="text-muted-foreground">{inv.contractNo}</td>
                <td>{inv.location}</td>
                <td className="text-muted-foreground">{inv.costCenter}</td>
                <td>{inv.generatedDate}</td>
                <td>
                  <div className="flex flex-col text-xs space-y-0.5">
                    <span className="text-muted-foreground">Base: {formatCurrency(inv.amount / 1.18)}</span>
                    <span className="text-muted-foreground">GST: {formatCurrency(inv.amount - (inv.amount / 1.18))}</span>
                    <span className="font-medium text-sm mt-0.5">{formatCurrency(inv.amount)}</span>
                  </div>
                </td>
                <td>{inv.dueDate}</td>
                <td className="text-muted-foreground">{inv.paidDate || '—'}</td>
                <td>
                  <span className={`status-badge ${inv.status === 'Paid' ? 'status-active' : inv.status === 'Pending' ? 'status-pending' : 'status-overdue'}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/5" onClick={() => handleRequestInvoice(inv)}>
                      <FileQuestion className="h-3.5 w-3.5" /> Request
                    </Button>
                    {(inv.status === 'Pending' || inv.status === 'Overdue') && user?.isPortalUser && (
                      <Button variant="default" size="sm" className="h-7 text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => handlePayNow(inv)}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                </td>
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
      <SaveReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} moduleName="Invoices" activeFilters={{ search, status: statusFilter.join(','), "start_date": dateRange.start, "end_date": dateRange.end, client: clientFilter.join(','), costCenter: costCenterFilter.join(','), location: locationFilter.join(',') }} />

      {/* Payment Flow Dialog */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select payment method for invoice <span className="font-semibold text-foreground">{selectedInvoice?.invoiceNo}</span>
              <br /> Amount Due: <span className="font-bold text-foreground">{formatCurrency(selectedInvoice?.amount || 0)}</span>
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-muted bg-card hover:border-primary hover:bg-primary/5 transition-all outline-none"
              onClick={() => {
                toast({ title: "Redirecting...", description: "Connecting to Credit payment gateway." });
                setPaymentModalOpen(false);
              }}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm">Credit Card</span>
            </button>

            <button
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-muted bg-card hover:border-primary hover:bg-primary/5 transition-all outline-none"
              onClick={() => {
                toast({ title: "Redirecting...", description: "Opening UPI apps." });
                setPaymentModalOpen(false);
              }}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm">UPI Apps</span>
            </button>
          </div>
          <p className="text-[11px] text-center text-muted-foreground mt-4">
            Payments are processed securely. Your transaction will be reflected instantly.
          </p>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Invoices;
