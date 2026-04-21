import { AppLayout } from "@/components/AppLayout";
import { individualLeaseData as d } from "@/data/sampleData";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Car, CalendarClock, CreditCard, ShieldAlert, Wrench,
  TrendingDown, PhoneCall, Mail, AlertTriangle, CheckCircle2,
  Clock, BadgeCheck, Flame, TicketPlus,
  IndianRupee, Building2, Smartphone
} from "lucide-react";
import { DraggableDashboard, CustomizeLayoutButton, type DashboardCardDef } from "@/components/dashboard/DraggableDashboard";

/* ── helpers ──────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const daysUntil = (s: string) =>
  Math.ceil((new Date(s).getTime() - Date.now()) / 86_400_000);

const insuranceBadge = (status: string) => {
  if (status === "Active") return { cls: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30", icon: <BadgeCheck className="h-3.5 w-3.5" /> };
  if (status === "Expiring Soon") return { cls: "bg-amber-500/15 text-amber-500 border border-amber-500/30", icon: <AlertTriangle className="h-3.5 w-3.5" /> };
  return { cls: "bg-red-500/15 text-red-500 border border-red-500/30", icon: <Flame className="h-3.5 w-3.5" /> };
};

const priorityBadge = (p: string) => {
  if (p === "High") return "bg-red-500/15 text-red-500 border border-red-500/30";
  if (p === "Medium") return "bg-amber-500/15 text-amber-500 border border-amber-500/30";
  return "bg-slate-500/15 text-slate-400 border border-slate-500/20";
};

const statusIcon = (s: string) =>
  s === "Open" ? <Clock className="h-3.5 w-3.5 text-amber-400" /> : <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />;

/* ── simple card shell ────────────────────────────────────────────── */
function KPICard({ title, icon, children, accent = "blue", actionNode }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string; actionNode?: React.ReactNode;
}) {
  const ring: Record<string, string> = {
    blue: "border-blue-500/20", emerald: "border-emerald-500/20", amber: "border-amber-500/20",
    red: "border-red-500/20", violet: "border-violet-500/20", teal: "border-teal-500/20", orange: "border-orange-500/20",
  };
  const dot: Record<string, string> = {
    blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-500",
    red: "bg-red-500", violet: "bg-violet-500", teal: "bg-teal-500", orange: "bg-orange-500",
  };
  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-3 relative h-full ${ring[accent] ?? ""}`}>
      {actionNode && <div className="absolute top-4 right-4 z-10">{actionNode}</div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dot[accent]}`} />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
        </div>
        {!actionNode && <span className="text-muted-foreground/60">{icon}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────── */
export default function IndividualDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [editMode, setEditMode] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setTicketModalOpen(false);
    toast({ title: "Request Submitted", description: "Your service request has been logged and assigned an ID." });
  };

  const pct = Math.round((d.elapsedMonths / d.tenureMonths) * 100);
  const remaining = d.tenureMonths - d.elapsedMonths;
  const paidPct = Math.round((d.amountPaid / d.totalLeaseValue) * 100);
  const balance = d.totalLeaseValue - d.amountPaid;
  const daysToPayment = daysUntil(d.nextPaymentDate);
  const insStatus = insuranceBadge(d.insuranceStatus);
  const openCount = d.openServiceRequests.filter(r => r.status !== "Closed").length;
  const daysToRV = daysUntil(d.residualValueDueDate);

  /* ── card definitions ──────────────────────────────────────────── */
  const cards: DashboardCardDef[] = [
    {
      id: "ind-tenure",
      defaultLayout: { x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 1 },
      content: (
        <KPICard title="Lease Tenure Progress" icon={<CalendarClock className="h-4 w-4" />} accent="blue">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{d.elapsedMonths} months elapsed</span>
              <span>{remaining} months remaining</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-muted-foreground">{fmtDate(d.leaseStartDate)}</span>
              <span className="text-sm font-bold text-foreground">{pct}% complete</span>
              <span className="text-[11px] text-muted-foreground">{fmtDate(d.leaseEndDate)}</span>
            </div>
          </div>
        </KPICard>
      ),
    },
    {
      id: "ind-payment",
      defaultLayout: { x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 1 },
      content: (
        <KPICard
          title="Upcoming Payment"
          icon={<CreditCard className="h-4 w-4" />}
          accent="emerald"
          actionNode={
            <Button size="sm" onClick={() => setPaymentModalOpen(true)} className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-md px-3 font-semibold shadow-sm">
              <IndianRupee className="h-3 w-3 mr-1" /> Pay Now
            </Button>
          }
        >
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-bold text-foreground">{fmt(d.nextPaymentAmount)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Due on {fmtDate(d.nextPaymentDate)}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              daysToPayment <= 5 ? "bg-red-500/15 text-red-500 border border-red-500/30"
              : daysToPayment <= 15 ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
              : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
            }`}>
              {daysToPayment > 0 ? `${daysToPayment}d left` : "Due today"}
            </span>
          </div>
        </KPICard>
      ),
    },
    {
      id: "ind-balance",
      defaultLayout: { x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 1 },
      content: (
        <KPICard title="Outstanding Lease Balance" icon={<TrendingDown className="h-4 w-4" />} accent="violet">
          <div>
            <p className="text-2xl font-bold text-foreground">{fmt(balance)}</p>
            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Paid: {fmt(d.amountPaid)}</span>
                <span>{paidPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${paidPct}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Total lease value: {fmt(d.totalLeaseValue)}</p>
            </div>
          </div>
        </KPICard>
      ),
    },
    {
      id: "ind-insurance",
      defaultLayout: { x: 0, y: 2, w: 4, h: 2, minW: 3, minH: 1 },
      content: (
        <KPICard title="Insurance Policy Status" icon={<ShieldAlert className="h-4 w-4" />} accent={d.insuranceStatus === "Active" ? "emerald" : "red"}>
          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${insStatus.cls}`}>
                {insStatus.icon}{d.insuranceStatus}
              </span>
              <p className="text-xs text-muted-foreground mt-2">Provider: <span className="text-foreground font-medium">{d.insuranceProvider}</span></p>
              <p className="text-xs text-muted-foreground">Policy No: <span className="text-foreground font-medium">{d.insurancePolicyNo}</span></p>
              <p className="text-xs text-muted-foreground">Expiry: <span className="text-foreground font-medium">{fmtDate(d.insuranceExpiryDate)}</span></p>
            </div>
            {d.insuranceStatus === "Expired" && (
              <div className="text-right">
                <p className="text-[11px] text-red-400 font-medium">Action required</p>
                <p className="text-[10px] text-muted-foreground">Contact your RM</p>
              </div>
            )}
          </div>
        </KPICard>
      ),
    },
    {
      id: "ind-tickets",
      defaultLayout: { x: 4, y: 2, w: 4, h: 2, minW: 3, minH: 1 },
      content: (
        <KPICard
          title="Open Service Requests"
          icon={<Wrench className="h-4 w-4" />}
          accent="amber"
          actionNode={
            <Button size="sm" variant="outline" onClick={() => setTicketModalOpen(true)} className="h-7 text-[11px] border-amber-500/30 text-amber-600 hover:bg-amber-100 hover:text-amber-700 bg-amber-500/10 px-2.5 font-semibold">
              <TicketPlus className="h-3 w-3 mr-1" /> Create Ticket
            </Button>
          }
        >
          <div className="mt-1">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-foreground">{openCount}</span>
              <span className="text-xs text-muted-foreground">active request{openCount !== 1 ? "s" : ""}</span>
            </div>
            <ul className="space-y-2">
              {d.openServiceRequests.map(r => (
                <li key={r.ticketNo} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border">
                  <span className="mt-0.5 shrink-0">{statusIcon(r.status)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{r.subject}</p>
                    <p className="text-[11px] text-muted-foreground">{r.ticketNo}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${priorityBadge(r.priority)}`}>
                    {r.priority}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </KPICard>
      ),
    },
    {
      id: "ind-residual",
      defaultLayout: { x: 8, y: 2, w: 4, h: 2, minW: 3, minH: 1 },
      content: (
        <KPICard title="Residual Value (RV)" icon={<TrendingDown className="h-4 w-4" />} accent="teal">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{fmt(d.residualValue)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Due on {fmtDate(d.residualValueDueDate)}</p>
              <p className="text-xs text-muted-foreground">{daysToRV > 0 ? `${daysToRV} days remaining` : "Due today"}</p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-500 border border-teal-500/30">
              At lease end
            </span>
          </div>
        </KPICard>
      ),
    },
  ];

  return (
    <AppLayout>
      {/* ── page header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <Car className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-heading">My Lease Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Welcome back, {user?.name} · {d.assetDescription} · {d.registrationNo}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {[
              { label: "Contract", val: d.contractNo },
              { label: "Asset Tag", val: d.assetTag },
              { label: "Lease Start", val: fmtDate(d.leaseStartDate) },
              { label: "Lease End",   val: fmtDate(d.leaseEndDate)   },
            ].map(b => (
              <span key={b.label} className="rounded-md border bg-muted/40 px-2.5 py-1 text-muted-foreground">
                <span className="font-medium text-foreground mr-1">{b.label}:</span>{b.val}
              </span>
            ))}
          </div>
        </div>
        {/* ── Customize Layout button ── */}
        <CustomizeLayoutButton editMode={editMode} onToggle={() => setEditMode(v => !v)} />
      </div>

      {/* ── Draggable KPI grid ── */}
      <DraggableDashboard
        key="individual"
        cards={cards}
        editMode={editMode}
        onEditModeChange={setEditMode}
      />

      {/* ── Escalation Support ── */}
      <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <PhoneCall className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-foreground">Escalation Support</h2>
          <span className="ml-auto text-[11px] text-muted-foreground">Need help? Reach out directly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-500 font-bold text-sm shrink-0">
              {d.vehicleManagerName.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{d.vehicleManagerName}</p>
              <p className="text-[11px] text-muted-foreground">Vehicle Manager</p>
              <a href={`mailto:${d.vehicleManagerEmail}`} className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" />{d.vehicleManagerEmail}
              </a>
            </div>
            <a href={`mailto:${d.vehicleManagerEmail}?subject=Escalation - ${d.contractNo}`} className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-blue-500 hover:text-white transition-colors bg-blue-500/10 hover:bg-blue-500 px-3 py-2 rounded-lg border border-blue-500/20">
              Contact Vehicle Manager
            </a>
          </div>
          <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 font-bold text-sm shrink-0">
              {d.hrManagerName.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{d.hrManagerName}</p>
              <p className="text-[11px] text-muted-foreground">HR Manager</p>
              <a href={`mailto:${d.hrManagerEmail}`} className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" />{d.hrManagerEmail}
              </a>
            </div>
            <a href={`mailto:${d.hrManagerEmail}?subject=Escalation - ${d.contractNo}`} className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-amber-500 hover:text-white transition-colors bg-amber-500/10 hover:bg-amber-500 px-3 py-2 rounded-lg border border-amber-500/20">
              Contact HR Manager
            </a>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          You can also call the ORIX Help Desk toll-free at <span className="font-medium text-foreground">1800-419-7878</span> (24/7)
          or email <span className="font-medium text-foreground">customerservice@orixindia.com</span>.
        </p>
      </div>

      {/* ── Create Ticket Modal ── */}
      <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">New Service Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select defaultValue="Vehicle">
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Request Type</Label>
                <Select defaultValue="Service Request">
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service Request">Service Request</SelectItem>
                    <SelectItem value="Closure Request">Closure Request</SelectItem>
                    <SelectItem value="Report Breakdown">Report Breakdown</SelectItem>
                    <SelectItem value="Report Stolen Item">Report Stolen Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Asset ID / Lease ID (Optional)</Label>
                <Input placeholder="e.g. VH-001" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-subject" className="text-xs">Subject</Label>
              <Input id="req-subject" placeholder="Brief description of your request" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-desc" className="text-xs">Details</Label>
              <textarea id="req-desc" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Provide additional details..." />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setTicketModalOpen(false)} className="flex-1 h-10 rounded-lg border hover:bg-muted text-sm font-medium transition-colors">Cancel</button>
              <button type="button" onClick={handleTicketSubmit} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Submit Request</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Payment Flow Dialog ── */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select payment method for your upcoming payment.
              <br /> Amount Due: <span className="font-bold text-foreground">{fmt(d.nextPaymentAmount)}</span>
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-muted bg-card hover:border-primary hover:bg-primary/5 transition-all outline-none"
              onClick={() => { toast({ title: "Redirecting...", description: "Connecting to Credit payment gateway." }); setPaymentModalOpen(false); }}>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Building2 className="h-6 w-6" /></div>
              <span className="font-semibold text-sm">Credit Card</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-muted bg-card hover:border-primary hover:bg-primary/5 transition-all outline-none"
              onClick={() => { toast({ title: "Redirecting...", description: "Opening UPI apps." }); setPaymentModalOpen(false); }}>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Smartphone className="h-6 w-6" /></div>
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
