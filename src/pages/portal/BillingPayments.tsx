import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Download, ChevronDown, ChevronUp, Building2, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const invoices = [
  { id: "INV-20041", date: "2026-03-15", due: "2026-03-25", amount: 148500, paid: 148500, status: "Paid", lease: "LC-2789" },
  { id: "INV-20042", date: "2026-04-01", due: "2026-04-25", amount: 148500, paid: 0, status: "Pending", lease: "LC-2789" },
  { id: "INV-20043", date: "2026-02-15", due: "2026-02-25", amount: 148500, paid: 148500, status: "Paid", lease: "LC-2791" },
  { id: "INV-20030", date: "2026-01-15", due: "2026-01-30", amount: 148500, paid: 0, status: "Overdue", lease: "LC-2789" },
  { id: "INV-19998", date: "2025-12-15", due: "2025-12-25", amount: 148500, paid: 148500, status: "Paid", lease: "LC-2789" },
];

const ageingBuckets = [
  { label: "0–30 days", amount: 148500, count: 1, color: "bg-amber-400" },
  { label: "31–60 days", amount: 0, count: 0, color: "bg-orange-400" },
  { label: "61–90 days", amount: 148500, count: 1, color: "bg-rose-400" },
  { label: "90+ days", amount: 0, count: 0, color: "bg-red-600" },
];

const statusColor: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  Pending: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  Overdue: "bg-rose-50 text-rose-600 dark:bg-rose-900/20",
};

export default function BillingPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);

  const handlePayNow = (inv: typeof invoices[0]) => {
    setSelectedInvoice(inv);
    setPaymentModalOpen(true);
  };

  const filtered = invoices.filter(i => statusFilter === "all" || i.status === statusFilter);
  const totalOutstanding = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Billing, Payments & Outstanding</h1>
        <p className="page-description">{user?.clientName} — Invoice history and payment status</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Outstanding", value: fmt(totalOutstanding), color: "text-rose-600", icon: AlertCircle, iconBg: "bg-rose-50 dark:bg-rose-900/20 text-rose-500" },
          { label: "Paid This Month", value: fmt(148500), color: "text-emerald-600", icon: CheckCircle2, iconBg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" },
          { label: "Overdue Count", value: "1 invoice", color: "text-amber-600", icon: Clock, iconBg: "bg-amber-50 dark:bg-amber-900/20 text-amber-500" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
                <p className={`text-xl font-bold font-heading mt-1 ${k.color}`}>{k.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${k.iconBg} flex items-center justify-center`}>
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ageing analysis */}
      <div className="bg-card border rounded-xl p-5 mb-6">
        <h2 className="font-heading font-semibold text-sm mb-4">Outstanding Ageing Analysis</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ageingBuckets.map(b => (
            <div key={b.label} className="rounded-lg border p-3 space-y-2">
              <div className={`h-1.5 w-full rounded-full ${b.color} opacity-80`} />
              <p className="text-[11px] text-muted-foreground font-medium">{b.label}</p>
              <p className="text-sm font-bold font-heading">{fmt(b.amount)}</p>
              <p className="text-xs text-muted-foreground">{b.count} invoice{b.count !== 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-heading font-semibold text-sm">Invoice History</h2>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <button className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Invoice #", "Date", "Due Date", "Lease", "Amount", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium py-2.5 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <>
                <tr key={inv.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-medium">{inv.id}</td>
                  <td className="py-3 px-4 text-xs">{fmtDate(inv.date)}</td>
                  <td className="py-3 px-4 text-xs">{fmtDate(inv.due)}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{inv.lease}</td>
                  <td className="py-3 px-4 text-xs font-semibold">{fmt(inv.amount)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    {inv.status === "Paid" && (
                      <button className="h-7 w-7 flex items-center justify-center rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors" title="Download Invoice">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1">
                      {expanded === inv.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
                {expanded === inv.id && (
                  <tr key={`${inv.id}-exp`} className="bg-muted/20">
                    <td colSpan={7} className="px-6 py-3">
                      <div className="flex gap-6 text-xs text-muted-foreground flex-wrap">
                        <span>Paid: <strong className="text-foreground">{fmt(inv.paid)}</strong></span>
                        <span>Outstanding: <strong className="text-foreground">{fmt(inv.amount - inv.paid)}</strong></span>
                        <button className="flex items-center gap-1 text-primary font-medium hover:underline"><Download className="h-3 w-3" /> Download PDF</button>
                        {inv.status !== "Paid" && (
                          <button
                            onClick={() => handlePayNow(inv)}
                            className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {/* Payment Flow Dialog */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select payment method for invoice <span className="font-semibold text-foreground">{selectedInvoice?.id}</span>
              <br /> Amount Due: <span className="font-bold text-foreground">{fmt(selectedInvoice?.amount || 0)}</span>
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
}
