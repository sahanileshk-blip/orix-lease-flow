import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  Car, FileText, AlertTriangle, TicketPlus, TrendingUp, IndianRupee,
  Calendar, Monitor, Wrench, DollarSign, BarChart3, Layers, RotateCcw,
  Clock, History, Star, CreditCard, ShieldCheck, ArrowRight, Phone, Mail, User2,
  FolderOpen
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilter } from "@/contexts/FilterContext";
import { usePersonalization } from "@/contexts/PersonalizationContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KPICard, KPICardSkeleton } from "@/components/dashboard/KPICard";
import { SkeletonDashboard } from "@/components/dashboard/SkeletonDashboard";
import { LeaseForecastChart } from "@/components/dashboard/LeaseForecastChart";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";


/* ─── Helpers ────────────────────────────────────────────────────────── */
function formatCurrency(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function getExpiringLeases(contracts: any[], days: number) {
  const now = new Date(), future = new Date();
  future.setDate(now.getDate() + days);
  return contracts.filter(c => {
    const e = new Date(c.endDate);
    return e >= now && e <= future && (c.status === "Disbursed" || c.status === "Partially Disbursed");
  });
}
function getMonthlyTrend(contracts: any[], window: "6" | "12" | "FY") {
  const now = new Date();
  const starts: Date[] = [];
  if (window === "6") for (let i = 5; i >= 0; i--) starts.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  else if (window === "12") for (let i = 11; i >= 0; i--) starts.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  else {
    const sy = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
    for (let i = 0; i < 12; i++) starts.push(new Date(sy, 3 + i, 1));
  }
  return starts.map(t => {
    const te = new Date(t.getFullYear(), t.getMonth() + 1, 0);
    const label = t.toLocaleDateString("en-US", { month: "short" }) + (window !== "6" ? ` '${t.getFullYear().toString().slice(-2)}` : "");
    let total = 0;
    contracts.forEach(c => {
      if (new Date(c.startDate) <= te && new Date(c.endDate) >= t &&
        (c.status === "Disbursed" || c.status === "Partially Disbursed")) total += c.monthlyRental;
    });
    return { month: label, value: Math.round(total * (1 + Math.sin(t.getMonth() * 3) * 0.08)), date: t };
  });
}



const COLORS = ["hsl(210,52%,24%)", "hsl(199,89%,48%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)"];

const portalModules = [
  { label: "Dealer Portal", desc: "Compare empanelled dealers & select pricing", icon: Car, path: "/portal/dealers", color: "bg-sky-50 dark:bg-sky-900/20 text-sky-600" },
  { label: "Billing & Payments", desc: "Invoices, payment history & outstanding dues", icon: CreditCard, path: "/portal/billing", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
  { label: "Lease Progress", desc: "Tenure tracker & full payment schedule", icon: TrendingUp, path: "/portal/progress", color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600" },
  { label: "Service Requests", desc: "Service, foreclosure, replacement & queries", icon: Wrench, path: "/portal/service-requests", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" },
  { label: "RV Payments", desc: "Residual value amount, due date & payment", icon: BarChart3, path: "/portal/rv-payments", color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600" },
  { label: "Insurance & Maintenance", desc: "Self-owned vehicle insurance & maintenance", icon: ShieldCheck, path: "/portal/insurance", color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" },
  { label: "Vehicle Closures", desc: "Monthly closure tracking & reporting", icon: BarChart3, path: "/portal/closures", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600" },
  { label: "Documents", desc: "Rental schedules, invoices, receipts & more", icon: FolderOpen, path: "/portal/documents", color: "bg-teal-50 dark:bg-teal-900/20 text-teal-600" },
];

const features = [
  "View and manage lease agreements and contract details",
  "Track rental schedules, dues, and payment status",
  "Access invoices, receipts, and account statements",
  "Monitor leased asset information and documentation",
  "Raise service requests and communicate with support",
  "Make payments and submit contract servicing requests",
];

const TICKET_CATEGORIES: Record<string, string[]> = {
  "Vehicle": [
    "Service / Maintenance",
    "Accident Reporting",
    "Replacement Request",
    "General Vehicle Query"
  ],
  "IT Equipment": [
    "Hardware Issue",
    "Software Issue",
    "Replacement Request",
    "Upgrade Request",
    "General IT Query"
  ]
};

/* ─── Component ──────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { dashboardKPIs, contracts, tickets, notifications, assets } = useAppData();
  const { clientFilter, costCenterFilter, locationFilter } = useFilter();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dashboardLayout, setDashboardLayout, resetDashboardLayout, recentModules } = usePersonalization();
  const { toast } = useToast();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketCategory, setTicketCategory] = useState<string>("");
  const [ticketType, setTicketType] = useState<string>("");

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketModalOpen(false);
    toast({ title: "Ticket created successfully", description: "Your service request has been logged.", variant: "default" });
    setTicketDesc("");
    setTicketCategory("");
    setTicketType("");
  };

  const [loading, setLoading] = useState(true);
  const [expiryWindow, setExpiryWindow] = useState("30");
  const [revenueWindow, setRevenueWindow] = useState<"6" | "12" | "FY">("6");
  const [drillModal, setDrillModal] = useState<{ title: string; month?: string; rows: any[]; summary?: any[] } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);


  const itAssets = assets.filter(a => a.type === "IT");
  const vehicles = assets.filter(a => a.type === "Vehicle");
  const filterMul = (clientFilter.length === 0 ? 1 : 0.4) * (locationFilter.length === 0 ? 1 : 0.6) * (costCenterFilter.length === 0 ? 1 : 0.8);
  const expiringLeases = getExpiringLeases(contracts, parseInt(expiryWindow));
  const monthlyTrend = getMonthlyTrend(contracts, revenueWindow);

  const disbursedContracts = contracts.filter(c => c.status === "Disbursed");
  const activeAssets = assets.filter(a => a.status === "Active");
  const maintenanceAssets = assets.filter(a => a.status === "Under Maintenance");

  /* ── KPI drill-down handlers ── */
  const openMonthDrill = useCallback((monthData: any) => {
    const rows = contracts
      .filter(c => new Date(c.startDate) <= monthData.date && new Date(c.endDate) >= monthData.date)
      .map(c => ({ id: c.contractNo ?? c.id, client: c.clientName ?? "—", asset: c.assetType ?? "—", value: c.monthlyRental ?? 0, status: c.status }));
    setDrillModal({
      title: "Monthly Lease Breakdown",
      month: monthData.month,
      rows,
      summary: [
        { label: "Leases Active", value: String(rows.length) },
        { label: "Total Value", value: formatCurrency(rows.reduce((s: number, r: any) => s + r.value, 0)) },
        { label: "Clients", value: String(new Set(rows.map((r: any) => r.client)).size) },
      ],
    });
  }, [contracts]);

  const openAssetsDrill = useCallback(() => navigate("/vehicles"), [navigate]);
  const openExpiringDrill = useCallback(() => {
    const rows = expiringLeases.map(c => ({ id: c.contractNo ?? c.id, client: c.clientName ?? "—", asset: c.assetType ?? "—", value: c.monthlyRental ?? 0, status: c.status }));
    setDrillModal({ title: "Expiring Leases", rows, summary: [{ label: "Expiring within", value: `${expiryWindow} days` }, { label: "Count", value: String(rows.length) }] });
  }, [expiringLeases, expiryWindow]);

  /* ── Role-aware KPI definitions ── */
  const role = user?.role ?? "RM - Orix";
  const isAdmin = user?.isAdmin;
  const isPortalUser = user?.isPortalUser;

  const innerDist = [
    { name: "IT Assets", value: itAssets.length, fill: COLORS[0] },
    { name: "Vehicles", value: vehicles.length, fill: COLORS[1] },
  ];
  const outerDist = [
    { name: "Laptop", value: itAssets.filter(a => a.category === "Laptop").length, fill: "hsl(210,52%,35%)" },
    { name: "Desktop", value: itAssets.filter(a => a.category === "Desktop").length, fill: "hsl(210,52%,50%)" },
    { name: "Car", value: vehicles.filter(a => a.category === "Passenger Car").length, fill: "hsl(199,89%,55%)" },
    { name: "Commercial", value: vehicles.filter(a => a.category === "Commercial Vehicle").length, fill: "hsl(199,89%,65%)" },
    { name: "Bike", value: vehicles.filter(a => a.category === "Two Wheeler - Bike").length, fill: "hsl(199,89%,75%)" },
  ].filter(d => d.value > 0);

  if (loading) return <AppLayout><SkeletonDashboard /></AppLayout>;

  /* ── Role-specific KPI cards content ── */
  const renderKPIs = () => {
    /* Internal Management Views */
    if (role === "IT Asset Manager") return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total IT Assets" value={itAssets.length} icon={<Monitor className="h-5 w-5 text-indigo-500" />}
          iconBg="bg-indigo-50 dark:bg-indigo-900/20" trend={{ direction: "up", percent: 6 }}
          insight="3 new assets added this month. All licenses current." onClick={() => navigate("/it-assets")} />
        <KPICard label="In Use" value={itAssets.filter(a => a.status === "Active").length}
          icon={<Layers className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          trend={{ direction: "flat", percent: 0 }} insight="Utilization stable at 84% — within target." />
        <KPICard label="Maintenance Due" value={maintenanceAssets.filter(a => a.type === "IT").length}
          icon={<Wrench className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50 dark:bg-amber-900/20"
          valueColor="text-amber-600" insight="Schedule preventive maintenance before end of quarter."
          onClick={() => navigate("/it-assets")} />
      </div>
    );
    if (role === "Vehicle Asset Manager") return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Vehicles" value={vehicles.length} icon={<Car className="h-5 w-5 text-sky-500" />}
          iconBg="bg-sky-50 dark:bg-sky-900/20" trend={{ direction: "up", percent: 4 }}
          insight="Fleet grew by 4% — 2 new vehicles onboarded this month." onClick={() => navigate("/vehicles")} />
        <KPICard label="Active Fleet" value={vehicles.filter(a => a.status === "Active").length}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          trend={{ direction: "up", percent: 2 }} insight="92% of fleet currently active — excellent utilization." />
        <KPICard label="Maintenance Due" value={maintenanceAssets.filter(a => a.type === "Vehicle").length}
          icon={<Wrench className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50 dark:bg-amber-900/20"
          valueColor="text-amber-600" insight="2 vehicles have overdue maintenance checks." onClick={() => navigate("/tickets")} />
      </div>
    );
    if (role === "Lease Manager") return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Disbursed Leases" value={disbursedContracts.length}
          icon={<FileText className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          trend={{ direction: "up", percent: 8 }} insight="Disbursed: strong pipeline — ↑8% vs last month."
          onClick={() => navigate("/contracts")} />
        <KPICard label="Expiring Soon" value={expiringLeases.length}
          icon={<Calendar className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50 dark:bg-amber-900/20"
          valueColor={expiringLeases.length > 5 ? "text-amber-600" : undefined}
          insight={`${expiringLeases.length} leases expiring in ${expiryWindow} days — action required.`}
          onClick={openExpiringDrill} />
        <KPICard label="Monthly Lease Revenue" value={formatCurrency(dashboardKPIs.totalLeaseValue)}
          icon={<IndianRupee className="h-5 w-5 text-primary" />} iconBg="bg-primary/10"
          trend={{ direction: "up", percent: 4 }} insight="Stable growth — 4% vs previous quarter." />
      </div>
    );
    if (role === "Finance Manager") return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Revenue" value={formatCurrency(dashboardKPIs.totalLeaseValue)}
          icon={<IndianRupee className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          trend={{ direction: "up", percent: 5 }} insight="Revenue up 5% — cash flow healthy for Q1." />
        <KPICard label="Pending Payments" value={`₹${Math.round(dashboardKPIs.totalLeaseValue * 0.12 / 100000)}L`}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50 dark:bg-amber-900/20"
          valueColor="text-amber-600" trend={{ direction: "down", percent: 3 }}
          insight="Overdue balance reducing — follow-up on 3 clients." onClick={() => navigate("/invoices")} />
        <KPICard label="Cash Flow Index" value="↑ Positive"
          icon={<BarChart3 className="h-5 w-5 text-sky-500" />} iconBg="bg-sky-50 dark:bg-sky-900/20"
          valueColor="text-emerald-600" insight="Net cash position strong — collections on track." onClick={() => navigate("/reports")} />
      </div>
    );
    /* Admin / Super Admin — full view */
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Leases" value={disbursedContracts.length + contracts.filter(c => c.status === "Partially Disbursed").length}
          icon={<FileText className="h-5 w-5 text-primary" />} iconBg="bg-primary/10"
          trend={{ direction: "up", percent: 12 }}
          insight="+12% vs last month ↑"
          onClick={() => navigate("/contracts")} />
        <KPICard label={isPortalUser ? "Active Assets" : "Total Assets"} value={isPortalUser ? dashboardKPIs.assetsByStatus.Active : dashboardKPIs.totalAssets}
          icon={<Car className="h-5 w-5 text-accent" />} iconBg="bg-accent/10"
          trend={{ direction: "up", percent: 4 }}
          insight={isPortalUser ? `${dashboardKPIs.assetsByStatus.Active} assets currently active in your fleet.` : `${dashboardKPIs.assetsByType.Vehicle} vehicles · ${dashboardKPIs.assetsByType['IT Equipment']} IT — all tracked.`}
          onClick={openAssetsDrill} />
        <KPICard label={isPortalUser ? "Active Lease value" : "Total Lease Value"} value={formatCurrency(isPortalUser ? (dashboardKPIs as any).activeLeaseValue : dashboardKPIs.totalLeaseValue)}
          icon={<IndianRupee className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          trend={{ direction: "up", percent: 4 }} insight={isPortalUser ? "Total value of your active lease contracts." : "Stable growth this quarter — on target for FY."} />
        <div className="kpi-card" onClick={openExpiringDrill} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && openExpiringDrill()}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">Expiring Leases</p>
              <p className="text-2xl font-bold mt-1.5 font-heading text-amber-600">{expiringLeases.length}</p>
              <p className="text-xs text-muted-foreground mt-1">within {expiryWindow} days</p>
              <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                {expiringLeases.length > 5 ? "⚠ High renewal urgency — review expiring leases." : "Manageable renewal pipeline this period."}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 ml-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <Select value={expiryWindow} onValueChange={setExpiryWindow}>
                <SelectTrigger className="h-7 w-[90px] text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-primary/60 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to explore →</p>
        </div>
      </div>
    );
  };

  /* ── Greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /* Render flow continues to main board for unified experience */

  return (
    <AppLayout>
      {/* ── Greeting + Controls ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            {user?.lastLogin && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Last login: {formatDate(user.lastLogin)}
              </span>
            )}
            {user?.lastActivity && (
              <span className="flex items-center gap-1">
                <History className="h-3 w-3" /> {user.lastActivity}
              </span>
            )}
            {isPortalUser && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                {user?.clientName}
              </span>
            )}
          </div>

          {/* Recently accessed shortcuts */}
          {recentModules.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Recent:</span>
              {recentModules.slice(0, 4).map(m => (
                <button key={m.path} onClick={() => navigate(m.path)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-card hover:bg-muted transition-colors font-medium">
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={resetDashboardLayout}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset Layout
        </button>
      </div>

      {/* ── Portal Modules (Clients Only) ── */}
      {/* Portal Modules temporarily removed per user request */}

      {/* ── Recent Activity (Tickets & Alerts) ── */}
      {role !== "IT Admin (ORIX)" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <TicketPlus className="h-4 w-4 text-amber-500" /> Open Tickets
            </h3>
            {isPortalUser && (
              <button
                onClick={() => setTicketModalOpen(true)}
                className="text-[11px] font-medium px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors cursor-pointer"
              >
                Create Ticket
              </button>
            )}
          </div>
          <div className="space-y-2">
            {tickets.filter(t => t.status === "Open" || t.status === "In Progress").slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium leading-snug">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.clientName} · {t.ticketNo}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ml-2 shrink-0 ${t.priority === "Critical" ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20" :
                  t.priority === "High" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                  }`}>{t.priority}</span>
              </div>
            ))}
            {tickets.filter(t => t.status === "Open").length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No open tickets</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Alerts
          </h3>
          <div className="space-y-2">
            {notifications.filter(n => !n.read).slice(0, 4).map(n => (
              <div key={n.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.type === "error" ? "bg-destructive" : n.type === "warning" ? "bg-amber-500" : "bg-sky-500"
                  }`} />
                <div>
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="mb-4">{renderKPIs()}</div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Asset Distribution Pie */}
        {(isAdmin || isPortalUser || role === "RM - Orix" || role === "IT Asset Manager" || role === "Vehicle Asset Manager") && (
          <div className="bg-card rounded-lg border p-5">
            <h3 className="font-heading font-semibold text-sm mb-4">Asset Distribution by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={innerDist} cx="50%" cy="50%" innerRadius={0} outerRadius={45} dataKey="value" stroke="none">
                  {innerDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Pie data={outerDist} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke="none"
                  label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : null}>
                  {outerDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} Assets`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
              {outerDist.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <span className="text-muted-foreground truncate">{d.name} <span className="font-medium text-foreground">{d.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Revenue/Cost chart  */}
        <div className="bg-card rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm">
              {isPortalUser ? "Monthly Lease Rental" : (isAdmin || role === "Finance Manager" ? "Monthly Lease Revenue" : "Monthly Lease Cost")}
            </h3>
            <Select value={revenueWindow} onValueChange={(v: "6" | "12" | "FY") => setRevenueWindow(v)}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 1 Year</SelectItem>
                <SelectItem value="FY">Financial Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrend} onClick={p => p?.activePayload?.[0] && openMonthDrill(p.activePayload[0].payload)} className="cursor-pointer">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}K`} width={75} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={l => `${l} — click for breakdown`} />
              <Line type="monotone" dataKey="value" stroke="hsl(210,52%,40%)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, fill: "hsl(210,52%,40%)" }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-center text-muted-foreground mt-1">Click any data point to see lease breakdown</p>
        </div>
      </div>

      {/* ── Lease Forecast (Lease Manager + Admin + Client) ── */}
      {(role === "Lease Manager" || role === "Finance Manager" || isAdmin || isPortalUser) && (
        <div className="mb-4">
          <LeaseForecastChart contracts={contracts} />
        </div>
      )}

      {/* ── Drill-down modal ── */}
      {drillModal && (
        <DrillDownModal
          open={!!drillModal}
          onClose={() => setDrillModal(null)}
          title={drillModal.title}
          month={drillModal.month}
          rows={drillModal.rows}
          summary={drillModal.summary}
        />
      )}

      {/* ── Create Ticket Modal ── */}
      <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Service Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTicketSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={ticketCategory} onValueChange={(val) => {
                  setTicketCategory(val);
                  setTicketType("");
                }}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select
                  value={ticketType}
                  onValueChange={setTicketType}
                  disabled={!ticketCategory}
                >
                  <SelectTrigger><SelectValue placeholder={ticketCategory ? "Select Type" : "Select Category first"} /></SelectTrigger>
                  <SelectContent>
                    {ticketCategory && TICKET_CATEGORIES[ticketCategory]?.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset ID / Lease ID (Optional)</Label>
                <Input placeholder="e.g. VH-001 or OL-2024-001" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Brief description of the issue" required />
            </div>
            <div className="space-y-2">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea placeholder="Provide detailed information..." rows={4} required value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setTicketModalOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Dashboard;
