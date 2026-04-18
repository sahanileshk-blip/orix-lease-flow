import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Clock, AlertCircle, Calendar, 
  ArrowLeft, Download, FileText, IndianRupee, 
  TrendingUp, CreditCard, ChevronRight, Building2, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const statusIcon: Record<string, React.ElementType> = {
  Paid: CheckCircle2,
  Upcoming: Clock,
  Missed: AlertCircle,
  Pending: Clock,
  Overdue: AlertCircle,
};

const statusColor: Record<string, string> = {
  Paid: "text-emerald-500",
  Upcoming: "text-sky-500",
  Missed: "text-rose-500",
  Overdue: "text-rose-500",
  Pending: "text-amber-500",
};

export default function LeaseDetail() {
  const { id } = useParams();
  const { rawContracts, invoices } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  const contract = rawContracts.find(c => c.contractNo === id);
  const leaseInvoices = invoices.filter(inv => inv.contractNo === id).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  if (!contract) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Lease Not Found</h2>
          <p className="text-muted-foreground mt-2">The lease ID {id} could not be located in your records.</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate("/contracts")}>
            Back to Leases
          </Button>
        </div>
      </AppLayout>
    );
  }

  const now = new Date();
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = Math.min(Math.max(now.getTime() - start.getTime(), 0), totalMs);
  const elapsedMonths = Math.floor(elapsedMs / (1000 * 60 * 60 * 24 * 30.44));
  const pct = Math.min(Math.round((elapsedMonths / contract.tenure) * 100), 100);
  const remaining = Math.max(contract.tenure - elapsedMonths, 0);

  // Mock Rental schedule generation
  const generateSchedule = () => {
    const list = [];
    const baseDate = new Date(contract.startDate);
    for (let i = 1; i <= contract.tenure; i++) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 25);
        list.push({
            date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            rental: contract.monthlyRental,
            status: d < now ? "Paid" : "Upcoming"
        });
    }
    return list;
  };
  const emiSchedule = generateSchedule();

  return (
    <AppLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading">{contract.contractNo}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                contract.status === 'Disbursed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
              }`}>{contract.status}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{contract.assetType} Lease · {contract.clientName}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" /> Rental Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Rental Schedule (Rental Breakdown)
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th>Date</th>
                                    <th>Rental (Principal + Int)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emiSchedule.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="text-sm">{row.date}</td>
                                        <td className="font-semibold">{fmt(row.rental)}</td>
                                        <td>
                                            <span className={`status-badge ${row.status === 'Paid' ? 'status-active' : 'status-pending'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="gap-2">
              <Download className="h-4 w-4" /> Download Agreement
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tenure & Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-sm mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Lease Tenure Progress
            </h3>
            
            <div className="relative mb-10 pt-4 px-2">
                {/* Timeline visual */}
                <div className="h-3 bg-muted rounded-full relative overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {/* Markers */}
                <div className="flex justify-between mt-4">
                    <div className="text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Start Date</p>
                        <p className="text-xs font-semibold mt-0.5">{start.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Elapsed</p>
                        <p className="text-xs font-semibold mt-0.5 text-primary">{elapsedMonths}/{contract.tenure} Months</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">End Date</p>
                        <p className="text-xs font-semibold mt-0.5">{end.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                </div>
                {/* Float indicator */}
                <div 
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center" 
                    style={{ left: `${pct}%` }}
                >
                    <div className="h-4 w-4 rounded-full border-2 border-background bg-primary shadow-md" />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Months</p>
                    <p className="text-lg font-bold mt-1">{contract.tenure}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Remaining</p>
                    <p className="text-lg font-bold mt-1 text-primary">{remaining}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Monthly Rental</p>
                    <p className="text-lg font-bold mt-1">{fmt(contract.monthlyRental)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Residual Val</p>
                    <p className="text-lg font-bold mt-1">{fmt(contract.totalValue * 0.1)}</p>
                </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Payment History
                </h3>
                <span className="text-[11px] text-muted-foreground">Showing last {Math.min(leaseInvoices.length, 5)} payments</span>
            </div>

            <div className="space-y-4">
                {leaseInvoices.slice(0, 5).map((inv, i) => {
                    const Icon = statusIcon[inv.status] || Clock;
                    return (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{inv.invoiceNo}</p>
                                    <p className="text-[10px] text-muted-foreground">Due Date: {inv.dueDate}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">{fmt(inv.amount)}</p>
                                <span className={`text-[10px] font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
                            </div>
                        </div>
                    );
                })}
                {leaseInvoices.length === 0 && (
                    <p className="text-center py-6 text-sm text-muted-foreground">No recent payment records found.</p>
                )}
            </div>
            {leaseInvoices.length > 5 && (
                <button className="w-full mt-4 py-2 text-[11px] font-bold text-primary uppercase tracking-wider hover:bg-primary/5 rounded-lg transition-colors" onClick={() => navigate("/invoices")}>
                    View All Invoices
                </button>
            )}
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-sm mb-4">Financial Summary</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-xs text-muted-foreground">Total Paid to Date</span>
                        <span className="text-sm font-bold text-emerald-600">{fmt(elapsedMonths * contract.monthlyRental)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-xs text-muted-foreground">Remaining Principal</span>
                        <span className="text-sm font-bold text-primary">{fmt(contract.totalValue - (elapsedMonths * contract.monthlyRental))}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-xs text-muted-foreground text-rose-500 font-medium">Outstanding Dues</span>
                        <span className="text-sm font-bold text-rose-600">{fmt(leaseInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0))}</span>
                    </div>
                </div>
                <div className="mt-6 space-y-3">
                    {leaseInvoices.some(i => i.status !== 'Paid') && user?.isPortalUser && (
                        <Button className="w-full gap-2 shadow-lg shadow-primary/20" onClick={() => setPaymentModalOpen(true)}>
                            <CreditCard className="h-4 w-4" /> Pay Outstanding Now
                        </Button>
                    )}
                    <Button variant="outline" className="w-full gap-2">
                        <AlertCircle className="h-4 w-4" /> Raise a Query
                    </Button>
                </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-sm mb-4">Lease Details</h3>
                <div className="space-y-3">
                    {[
                        { label: "Asset Type", value: contract.assetType },
                        { label: "Cost Center", value: contract.costCenter },
                        { label: "Location", value: contract.location },
                        { label: "Linked Assets", value: contract.assetsCount },
                    ].map(item => (
                        <div key={item.label}>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{item.label}</p>
                            <p className="text-sm font-medium mt-0.5">{item.value}</p>
                        </div>
                    ))}
                    <div className="pt-2 border-t mt-3">
                        <button className="flex items-center justify-between w-full text-xs font-semibold text-primary hover:underline" onClick={() => navigate("/vehicles")}>
                            View Linked Assets <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Payment Flow Dialog */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select payment method for Lease <span className="font-semibold text-foreground">{contract.contractNo}</span>
              <br /> Total Outstanding: <span className="font-bold text-foreground">{fmt(leaseInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0))}</span>
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

// History Icon for LUCIDE
const History = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
)
