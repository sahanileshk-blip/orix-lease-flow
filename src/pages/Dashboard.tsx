import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { individualLeaseData } from "@/data/sampleData";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Car, FileText, AlertTriangle, TicketPlus, TrendingUp, IndianRupee,
  Calendar, Monitor, Wrench, BarChart3, Layers, RotateCcw,
  Clock, History, Star, CreditCard, ShieldCheck, ArrowRight, User2,
  FolderOpen, Users, LogIn, Activity, Globe, LayoutDashboard, Flag, Settings, DollarSign, Info
} from "lucide-react";
import { useServiceRequest } from "@/contexts/ServiceRequestContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, Legend,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KPICard, KPICardSkeleton } from "@/components/dashboard/KPICard";
import { SkeletonDashboard } from "@/components/dashboard/SkeletonDashboard";
import { LeaseForecastChart } from "@/components/dashboard/LeaseForecastChart";
import { DrillDownModal, DrillColumn } from "@/components/dashboard/DrillDownModal";
import { MultiSelect } from "@/components/ui/multi-select";
import { DraggableDashboard, CustomizeLayoutButton, type DashboardCardDef } from "@/components/dashboard/DraggableDashboard";

/* ─── Helpers ────────────────────────────────────────────────────────── */
function formatCurrency(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function getExpiringLeases(contracts: any[], minDays: number, maxDays: number) {
  const now = new Date();
  const minDate = new Date(); minDate.setDate(now.getDate() + minDays);
  const maxDate = new Date(); maxDate.setDate(now.getDate() + maxDays);
  return contracts.filter(c => {
    const e = new Date(c.endDate);
    return e >= minDate && e <= maxDate && c.status === "Disbursed";
  });
}

const COLORS = ["hsl(210,52%,24%)", "hsl(199,89%,48%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)"];

export default function Dashboard() {
  const { dashboardKPIs, contracts, tickets, notifications, assets, auditLogs, invoices } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resetDashboardLayout, recentModules } = usePersonalization();
  const { toast } = useToast();
  const { clientFilter, setClientFilter } = useFilter();
  const { categories, requestTypes } = useServiceRequest();

  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketCategory, setTicketCategory] = useState<string>("");
  const [ticketType, setTicketType] = useState<string>("");
  const [ticketDate, setTicketDate] = useState<string>("");
  const [healthClientFilter, setHealthClientFilter] = useState<string[]>([]);

  useEffect(() => {
    if (ticketType) {
      const type = requestTypes.find(t => t.id === ticketType || t.name === ticketType);
      if (type) {
        const d = new Date();
        d.setDate(d.getDate() + (type.slaInDays || 3));
        setTicketDate(d.toISOString().split('T')[0]);
      }
    }
  }, [ticketType, requestTypes]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketModalOpen(false);
    toast({ title: "Ticket created", description: "Service request logged.", variant: "default" });
  };

  const [loading, setLoading] = useState(true);
  const [expiryWindow, setExpiryWindow] = useState("30");
  const [drillModal, setDrillModal] = useState<{ title: string; rows: any[]; summary?: any[]; columns?: DrillColumn[] } | null>(null);
  const [loginRange, setLoginRange] = useState("Daily");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const role = user?.role ?? "RM - Orix";
  const isPortalUser = user?.isPortalUser;

  const openExpiringDrill = useCallback(() => {
    const expiringLeases = getExpiringLeases(contracts, 0, parseInt(expiryWindow));
    const rows = expiringLeases.map(c => ({ id: c.contractNo ?? c.id, client: c.clientName ?? "—", asset: c.assetType ?? "—", value: c.monthlyRental ?? 0, status: c.status }));
    setDrillModal({ title: "Expiring Leases", rows, summary: [{ label: "Expiring within", value: `${expiryWindow} days` }, { label: "Count", value: String(rows.length) }] });
  }, [contracts, expiryWindow]);

  if (loading) return <AppLayout><SkeletonDashboard /></AppLayout>;

  /* ── IT Admin View ── */
  const renderITAdmin = () => {
    const failedLogins = auditLogs.filter(a => a.status !== 'Success' && a.module === 'Authentication').length;
    const loginConfigChanges = auditLogs.filter(a => a.module === 'Login Config').length + 2; // Mock adding some interactions
    const newUsersCount = 14;
    const totalUsers = 152;

    // Usage mock
    const moduleUsage = [
      { name: "Auth", interactions: 210, fill: "hsl(210,52%,40%)" },
      { name: "Vehicles", interactions: 155, fill: "hsl(210,52%,50%)" },
      { name: "Leases", interactions: 120, fill: "hsl(210,52%,60%)" },
      { name: "Invoices", interactions: 95, fill: "hsl(210,52%,70%)" },
      { name: "Reports", interactions: 85, fill: "hsl(210,52%,80%)" },
      { name: "Equipment", interactions: 65, fill: "hsl(210,52%,85%)" },
      { name: "Tickets", interactions: 30, fill: "hsl(210,52%,90%)" },
      { name: "Config", interactions: 12, fill: "hsl(210,52%,92%)" },
    ];

    const loginTrendsWeekly = [
      { day: "Mon", count: 420 }, { day: "Tue", count: 510 }, { day: "Wed", count: 480 },
      { day: "Thu", count: 590 }, { day: "Fri", count: 500 }, { day: "Sat", count: 120 }, { day: "Sun", count: 90 }
    ];
    const loginTrendsDaily = [
      { day: "09:00", count: 120 }, { day: "11:00", count: 210 }, { day: "13:00", count: 180 },
      { day: "15:00", count: 350 }, { day: "17:00", count: 200 }
    ];
    const loginTrends = loginRange === "Daily" ? loginTrendsDaily : loginTrendsWeekly;

    const openModuleDrill = (moduleName: string, count: number) => {
      const roles = ['RM - Orix', 'Client Admin', 'Lease Manager', 'Vehicle Asset Manager'];
      const mockRows = Array.from({ length: Math.min(count, 15) }).map((_, i) => ({
        id: `USR-${1000 + i + Math.floor(Math.random() * 100)}`,
        role: roles[i % roles.length],
        interactions: Math.floor(Math.random() * 5) + 1,
        lastActive: new Date(Date.now() - Math.random() * 86400000).toLocaleString("en-IN")
      }));
      setDrillModal({
        title: `${moduleName} Module Usage`,
        columns: [
          { key: 'id', label: 'User ID', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
          { key: 'interactions', label: 'Hits', type: 'number' },
          { key: 'lastActive', label: 'Timestamp', type: 'text' }
        ],
        rows: mockRows,
        summary: [{ label: 'Total Logs', value: String(count) }]
      });
    };

    const openLoginDrill = (period: string, count: number) => {
      const mockRows = Array.from({ length: Math.min(count, 15) }).map((_, i) => ({
        id: `LOG-${1000 + i}`,
        user: ['John Doe', 'Alice Smith', 'Bob Johnson', 'Admin Team'][i % 4],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        status: Math.random() > 0.1 ? 'Success' : 'Failure',
        timestamp: `${period}`
      }));
      setDrillModal({
        title: `System Logins (${period})`,
        columns: [
          { key: 'id', label: 'Log ID', type: 'text' },
          { key: 'user', label: 'User', type: 'text' },
          { key: 'ip', label: 'IP Address', type: 'text' },
          { key: 'status', label: 'Status', type: 'status' },
          { key: 'timestamp', label: 'Timestamp', type: 'text' }
        ],
        rows: mockRows,
        summary: [{ label: 'Total Logins', value: String(count) }]
      });
    };

    const openDocDrill = (type: string, count: number) => {
      const mockRows = Array.from({ length: Math.min(count, 15) }).map((_, i) => ({
        id: `DOC-${2000 + i}`,
        name: `${['Invoice', 'Lease Agreement', 'KYC', 'Vehicle Reg'][i % 4]}_${i}.pdf`,
        user: ['Client Admin', 'RM Orix', 'Fleet Manager'][i % 3],
        date: new Date(Date.now() - Math.random() * 86400000).toLocaleString("en-IN")
      }));
      setDrillModal({
        title: `Document ${type} (Today)`,
        columns: [
          { key: 'id', label: 'Doc ID', type: 'text' },
          { key: 'name', label: 'File Name', type: 'text' },
          { key: 'user', label: 'User', type: 'text' },
          { key: 'date', label: 'Date', type: 'text' }
        ],
        rows: mockRows,
        summary: [{ label: `Total ${type}`, value: String(count) }]
      });
    };

    const itAdminCards: DashboardCardDef[] = [
      {
        id: 'it-kpi-users',
        defaultLayout: { x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Total Active Users" value={totalUsers} icon={<Users className="h-5 w-5 text-indigo-500" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" trend={{ direction: "up", percent: 8 }} insight="45 Admins · 80 Clients · 27 Mngrs" onClick={() => openModuleDrill("System User", totalUsers)} />,
      },
      {
        id: 'it-kpi-logins',
        defaultLayout: { x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="System Login Activity" value="590" icon={<Activity className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" insight="Peak activity today at 10:00 AM" onClick={() => openModuleDrill("Authentication", 590)} />,
      },
      {
        id: 'it-kpi-new-users',
        defaultLayout: { x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="New User IDs (MTD)" value={newUsersCount} icon={<User2 className="h-5 w-5 text-sky-500" />} iconBg="bg-sky-50 dark:bg-sky-900/20" trend={{ direction: "up", percent: 12 }} insight="Mostly Client-side onboarding" onClick={() => openModuleDrill("Onboarding", newUsersCount)} />,
      },
      {
        id: 'it-kpi-anomalies',
        defaultLayout: { x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Audit Log Anomalies" value={failedLogins} icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} iconBg="bg-rose-50 dark:bg-rose-900/20" valueColor="text-rose-600" insight="Failed login attempts flagged" onClick={() => openModuleDrill("Security", failedLogins)} />,
      },
      {
        id: 'it-login-chart',
        defaultLayout: { x: 0, y: 1, w: 8, h: 2, minW: 4, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-sm">System Login Activity</h3>
              <Select value={loginRange} onValueChange={setLoginRange}>
                <SelectTrigger className="w-[100px] h-7 text-xs bg-muted/50 border-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={loginTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ stroke: 'var(--border)' }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(210,52%,40%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ onClick: (_: any, payload: any) => openLoginDrill(payload.payload.day, payload.payload.count), cursor: 'pointer', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
      {
        id: 'it-doc-activity',
        defaultLayout: { x: 8, y: 1, w: 4, h: 2, minW: 3, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 shadow-sm h-full flex flex-col">
            <h3 className="font-heading font-semibold text-sm mb-4">Document Activity</h3>
            <div className="flex-1 space-y-6 flex flex-col justify-center">
              <div className="space-y-2 cursor-pointer group" onClick={() => openDocDrill("Uploads", 142)}>
                <div className="flex justify-between text-xs text-muted-foreground group-hover:text-primary transition-colors"><span>Uploads (Today)</span> <span className="font-bold text-foreground">142 docs</span></div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500 rounded-full group-hover:brightness-110 transition-all" style={{ width: '65%' }}></div></div>
              </div>
              <div className="space-y-2 cursor-pointer group" onClick={() => openDocDrill("Downloads", 890)}>
                <div className="flex justify-between text-xs text-muted-foreground group-hover:text-primary transition-colors"><span>Downloads (Today)</span> <span className="font-bold text-foreground">890 docs</span></div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className="h-full bg-amber-500 rounded-full group-hover:brightness-110 transition-all" style={{ width: '85%' }}></div></div>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1.5 text-muted-foreground w-max cursor-help">
                        <Settings className="h-4 w-4 text-sky-500" /> {loginConfigChanges} Config Changes this week <Info className="h-3 w-3 opacity-50" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Counts updates to login page text and branding elements.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'it-module-chart',
        defaultLayout: { x: 0, y: 3, w: 12, h: 2, minW: 6, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 shadow-sm h-full flex flex-col">
            <h3 className="font-heading font-semibold text-sm mb-4">Top Module Interactions</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleUsage} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="interactions" radius={[4, 4, 0, 0]}>
                    {moduleUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} cursor="pointer" onClick={() => openModuleDrill(entry.name, entry.interactions)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DraggableDashboard key="it-admin" cards={itAdminCards} editMode={editMode} onEditModeChange={setEditMode} />
      </div>
    );
  };

  /* ── RM Orix View ── */
  const renderRM = () => {
    const dashContracts = contracts;
    const dashInvoices = invoices;
    const dashTickets = tickets;

    const quotesSub = 24;
    const quotesPend = 8;
    const contractsInProgress = dashContracts.filter(c => c.status === 'Disbursed').length;
    const invOwnClients = dashInvoices.filter(i => i.status !== 'Paid').length;
    const leaseDisbursed = dashContracts.filter(c => c.status === 'Disbursed' && c.startDate.startsWith('2026-04')).length;
    const openSupport = dashTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

    const healthData = healthClientFilter.length === 0
      ? [{ name: "Good", value: 65, fill: "hsl(142,71%,45%)" }, { name: "At Risk", value: 20, fill: "hsl(38,92%,50%)" }, { name: "Overdue", value: 15, fill: "hsl(0,72%,51%)" }]
      : [{ name: "Good", value: 85, fill: "hsl(142,71%,45%)" }, { name: "At Risk", value: 5, fill: "hsl(38,92%,50%)" }, { name: "Overdue", value: 10, fill: "hsl(0,72%,51%)" }];

    const openHealthDrill = (status: string, percentage: number) => {
      const sourceInvoices = healthClientFilter.length > 0 ? invoices.filter(i => healthClientFilter.includes(i.clientName)) : invoices;
      const mappedStatus = status === "Good" ? "Paid" : status === "At Risk" ? "Pending" : "Overdue";
      const relevantInvoices = sourceInvoices.filter(i => i.status === mappedStatus);
      setDrillModal({
        title: `Client Payment Health (${status})`,
        columns: [
          { key: 'id', label: 'Invoice ID', type: 'link' },
          { key: 'client', label: 'Client', type: 'text' },
          { key: 'value', label: 'Value', type: 'currency' },
          { key: 'status', label: 'Status', type: 'status' }
        ],
        rows: relevantInvoices.map(inv => ({ id: inv.id, client: inv.clientName, value: inv.amount, status: inv.status })),
        summary: [{ label: 'Total Invoices', value: String(relevantInvoices.length) }, { label: 'Health Segment', value: `${percentage}%` }]
      });
    };

    const uniqueClients = Array.from(new Set(contracts.map(c => c.clientName)));
    const clientOptions = uniqueClients.filter(Boolean).map(c => ({ label: c, value: c }));

    /* ── Card content definitions ── */
    const rmCards: DashboardCardDef[] = [
      {
        id: 'kpi-quotes',
        defaultLayout: { x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Quotes Submitted" value={quotesSub} icon={<FileText className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" insight={`${quotesPend} currently pending approval`} />,
      },
      {
        id: 'kpi-leases',
        defaultLayout: { x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Leases In Progress" value={contractsInProgress} icon={<Layers className="h-5 w-5 text-indigo-500" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" insight={clientFilter.length > 0 ? "Filtered" : "Across all active clients"} />,
      },
      {
        id: 'kpi-disbursed',
        defaultLayout: { x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Lease Disbursements" value={leaseDisbursed} icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" insight="Successfully disbursed this month" />,
      },
      {
        id: 'kpi-invoices',
        defaultLayout: { x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Outstanding Invoices" value={invOwnClients} icon={<DollarSign className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50 dark:bg-amber-900/20" valueColor="text-amber-600" insight="Requires follow up" onClick={() => navigate('/invoices')} />,
      },
      {
        id: 'payment-health',
        defaultLayout: { x: 0, y: 1, w: 4, h: 2, minW: 3, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 gap-2">
              <h3 className="font-heading font-semibold text-sm">Client Payment Health</h3>
              <MultiSelect options={clientOptions} selected={healthClientFilter} onChange={setHealthClientFilter} placeholder="Filter Clients..." className="h-7 min-h-7 text-[10px] w-[140px]" />
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={healthData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                    {healthData.map((e, i) => <Cell key={i} fill={e.fill} className="cursor-pointer hover:opacity-80 outline-none" onClick={() => openHealthDrill(e.name, e.value)} />)}
                  </Pie>
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">100%</span>
                <span className="text-[10px] text-muted-foreground uppercase">Covered</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1"><div className="text-[11px] text-emerald-500 font-medium">Good</div><div className="font-bold">{healthData[0].value}%</div></div>
              <div className="space-y-1"><div className="text-[11px] text-amber-500 font-medium">At Risk</div><div className="font-bold">{healthData[1].value}%</div></div>
              <div className="space-y-1"><div className="text-[11px] text-rose-500 font-medium">Overdue</div><div className="font-bold">{healthData[2].value}%</div></div>
            </div>
          </div>
        ),
      },
      {
        id: 'open-tickets',
        defaultLayout: { x: 4, y: 1, w: 4, h: 2, minW: 3, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><TicketPlus className="h-4 w-4 text-sky-500" /> Open Tickets (Own Clients)</h3>
              <span className="text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-600 px-2.5 py-1 rounded-full font-medium">{openSupport} Active</span>
            </div>
            <div className="space-y-3 flex-1 overflow-auto">
              {tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').slice(0, 5).map(t => (
                <div key={t.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0 border-border/50">
                  <div>
                    <p className="font-medium text-sm">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.clientName} · {t.ticketNo}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'renewals',
        defaultLayout: { x: 8, y: 1, w: 4, h: 2, minW: 3, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-500" /> Upcoming Renewals</h3>
              <p className="text-xs text-muted-foreground">Next 30 Days</p>
            </div>
            <div className="space-y-3 flex-1 overflow-auto">
              {getExpiringLeases(contracts, 0, 30).slice(0, 5).map(c => (
                <div key={c.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0 border-border/50">
                  <div>
                    <p className="font-medium text-sm">{c.contractNo}</p>
                    <p className="text-xs text-muted-foreground">{c.clientName} · {c.assetType}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-bold text-sm text-amber-600">{formatDate(c.endDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DraggableDashboard
          key="rm-orix"
          cards={rmCards}
          editMode={editMode}
          onEditModeChange={setEditMode}
        />
      </div>
    );
  };

  /* ── HR Manager View (Client) ── */
  const renderClientHR = () => {
    const facilityTotal = 500000000; // 50 Cr
    const facilityUtilized = contracts.reduce((acc, c) => acc + c.totalValue, 0);
    const limitData = [
      { name: "Credit Utilized", value: facilityUtilized, fill: "hsl(221, 83%, 53%)" },
      { name: "Limits Available", value: Math.max(facilityTotal - facilityUtilized, 0), fill: "hsl(210, 20%, 95%)" }
    ];

    const openFacilityDrill = (segment: string) => {
      // Filter for active/disbursed contracts that contribute to utilization
      const relevantContracts = contracts.filter(c => c.status === 'Disbursed');

      setDrillModal({
        title: `Facility Utilization Breakdown (${segment})`,
        columns: [
          { key: 'id', label: 'Contract No', type: 'text' },
          { key: 'asset', label: 'Asset Category', type: 'text' },
          { key: 'value', label: 'Utilization Value', type: 'currency' },
          { key: 'startDate', label: 'Start Date', type: 'text' },
          { key: 'status', label: 'Status', type: 'status' }
        ],
        rows: relevantContracts.map(c => ({
          id: c.contractNo,
          asset: c.assetType,
          value: c.totalValue,
          startDate: c.startDate,
          status: c.status
        })),
        summary: [
          { label: 'Total Utilized', value: formatCurrency(facilityUtilized) },
          { label: 'Asset Count', value: String(relevantContracts.length) }
        ]
      });
    };

    const exp30Leases = getExpiringLeases(contracts, 0, 30);
    const exp30 = exp30Leases.length;
    const exp30Val = exp30Leases.reduce((acc, c) => acc + c.totalValue, 0);

    const exp60Leases = getExpiringLeases(contracts, 30, 60);
    const exp60 = exp60Leases.length;
    const exp60Val = exp60Leases.reduce((acc, c) => acc + c.totalValue, 0);

    const exp90Leases = getExpiringLeases(contracts, 60, 90);
    const exp90 = exp90Leases.length;
    const exp90Val = exp90Leases.reduce((acc, c) => acc + c.totalValue, 0);

    const maxExp = Math.max(exp30, exp60, exp90, 5); // for bar scaling

    const overdueInvs = invoices.filter(i => i.status === 'Overdue');
    const overdueAmt = overdueInvs.reduce((a, b) => a + b.amount, 0);

    const assetPie = [
      { name: "Vehicles", value: dashboardKPIs.assetsByType.Vehicle, fill: "hsl(210,52%,40%)" },
      { name: "Equipment", value: dashboardKPIs.assetsByType["Equipment"], fill: "hsl(199,89%,48%)" }
    ];

    const hrCards: DashboardCardDef[] = [
      {
        id: 'hr-kpi-assets',
        defaultLayout: { x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Total Assets" value={dashboardKPIs.totalAssets} icon={<Layers className="h-5 w-5 text-indigo-500" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" insight="Active employee assignments" onClick={() => navigate('/vehicles')} />,
      },
      {
        id: 'hr-kpi-disbursed',
        defaultLayout: { x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Assets-Current Financial Year" value={contracts.filter(c => c.status === 'Disbursed' && c.startDate.startsWith('2026')).length} icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" insight="New leases funded this year" />,
      },
      {
        id: 'hr-kpi-overdue',
        defaultLayout: { x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="Overdue Invoices" value={overdueInvs.length} icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} iconBg="bg-rose-50 dark:bg-rose-900/20" valueColor="text-rose-600" insight={`Total Value: ${formatCurrency(overdueAmt)}`} onClick={() => navigate('/invoices')} />,
      },
      {
        id: 'hr-kpi-sla',
        defaultLayout: { x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
        content: <KPICard label="SLA Compliance" value="98.2%" icon={<ShieldCheck className="h-5 w-5 text-sky-500" />} iconBg="bg-sky-50 dark:bg-sky-900/20" valueColor="text-emerald-600" insight="Orix service commitments met" />,
      },
      {
        id: 'hr-facility',
        defaultLayout: { x: 0, y: 1, w: 4, h: 2, minW: 3, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 shadow-sm h-full flex flex-col">
            <h3 className="font-heading font-semibold text-sm mb-2">Total Facility Limit</h3>
            <div className="relative flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={limitData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                    {limitData.map((d, i) => (
                      <Cell key={i} fill={d.fill} className="cursor-pointer hover:opacity-80 transition-opacity outline-none" onClick={() => openFacilityDrill(d.name)} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => formatCurrency(v)} cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Utilized</p>
                <p className="text-xl font-bold font-heading text-foreground">{((facilityUtilized / facilityTotal) * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex justify-between items-center mx-2 mt-1 mb-2">
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[hsl(221,83%,53%)]" /> Utilized</span>
                <span className="text-sm font-semibold leading-tight">{formatCurrency(facilityUtilized)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-200" /> Available</span>
                <span className="text-sm font-semibold leading-tight">{formatCurrency(Math.max(facilityTotal - facilityUtilized, 0))}</span>
              </div>
            </div>
            <div className="border-t border-border/50 pt-2 text-xs text-muted-foreground">
              <span>Facility Valid: <strong>01 Jan 2024 - 31 Dec 2028</strong></span>
            </div>
          </div>
        ),
      },
      {
        id: 'hr-expiry-forecast',
        defaultLayout: { x: 4, y: 1, w: 4, h: 2, minW: 3, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-5 shadow-sm h-full flex flex-col justify-between">
            <h3 className="font-heading font-semibold text-sm mb-4">Lease Expiry Forecast</h3>
            <div className="space-y-5 flex-1">
              <div>
                <div className="flex justify-between items-end text-xs mb-1.5">
                  <span className="text-orange-500 font-medium">Coming 30 Days</span>
                  <div className="text-right"><span className="font-bold">{exp30} leases</span><p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(exp30Val)} at risk</p></div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-orange-500" style={{ width: `${Math.max((exp30 / maxExp) * 100, 2)}%` }}></div></div>
              </div>
              <div>
                <div className="flex justify-between items-end text-xs mb-1.5">
                  <span className="text-amber-500 font-medium">31 - 60 Days</span>
                  <div className="text-right"><span className="font-bold">{exp60} leases</span><p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(exp60Val)} at risk</p></div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${Math.max((exp60 / maxExp) * 100, 2)}%` }}></div></div>
              </div>
              <div>
                <div className="flex justify-between items-end text-xs mb-1.5">
                  <span className="text-yellow-500 font-medium">61 - 90 Days</span>
                  <div className="text-right"><span className="font-bold">{exp90} leases</span><p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(exp90Val)} at risk</p></div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: `${Math.max((exp90 / maxExp) * 100, 2)}%` }}></div></div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 text-xs h-8" onClick={() => navigate('/contracts')}>Review All Renewals</Button>
          </div>
        ),
      },
      {
        id: 'hr-asset-class',
        defaultLayout: { x: 8, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
        content: (
          <div className="bg-card rounded-lg border p-4 shadow-sm h-full flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-sm">Asset Class</h3>
              <div className="flex gap-4 mt-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(210,52%,40%)]" /> Vehicles ({assetPie[0].value})</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(199,89%,48%)]" /> Equipment ({assetPie[1].value})</span>
              </div>
            </div>
            <div className="h-16 w-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetPie} cx="50%" cy="50%" innerRadius={18} outerRadius={30} dataKey="value" stroke="none">
                    {assetPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ),
      },
      {
        id: 'hr-pending-actions',
        defaultLayout: { x: 10, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
        content: (
          <div className="bg-card rounded-lg border p-4 shadow-sm h-full">
            <h3 className="font-heading font-semibold text-sm mb-3">Pending Actions</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">e-KYC Processing</span>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">2 Pending</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Document Signatures</span>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">5 Pending</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Tickets Raised (Month)</span>
                <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold">14 Open</span>
              </div>
            </div>
          </div>
        ),
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DraggableDashboard key="client-hr" cards={hrCards} editMode={editMode} onEditModeChange={setEditMode} />
      </div>
    );
  };

  /* ── Individual User View (Viewer role) ── */
  const renderIndividual = () => {
    const d = individualLeaseData;
    const progress = Math.round((d.elapsedMonths / d.tenureMonths) * 100);
    const remainingMonths = d.tenureMonths - d.elapsedMonths;
    const myTickets = tickets.filter(t => t.clientId === 'c1').slice(0, 5);
    const insuranceExpired = d.insuranceStatus === 'Expired';
    const insuranceExpiring = d.insuranceStatus === 'Expiring Soon';

    const individualCards: DashboardCardDef[] = [
      {
        id: 'ind-lease-summary',
        defaultLayout: { x: 0, y: 0, w: 8, h: 1, minW: 3, minH: 1 },
        content: (
          <div className="bg-card rounded-lg border p-4 h-full flex flex-col gap-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">My Lease</p>
                <p className="text-lg font-bold mt-1 font-heading">{d.contractNo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.assetDescription} · {d.registrationNo}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Car className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Lease Progress</span>
                <span className="font-semibold text-primary">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{d.leaseStartDate}</span>
                <span>{remainingMonths} months remaining</span>
                <span>{d.leaseEndDate}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'ind-insurance',
        defaultLayout: { x: 8, y: 0, w: 4, h: 1, minW: 2, minH: 1 },
        content: (
          <div className={`rounded-lg border p-4 h-full flex flex-col gap-4 shadow-sm ${insuranceExpired ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200' :
            insuranceExpiring ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200' :
              'bg-card'
            }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Insurance</p>
                <p className={`text-lg font-bold mt-1.5 font-heading ${insuranceExpired ? 'text-rose-600' : insuranceExpiring ? 'text-amber-600' : 'text-emerald-600'
                  }`}>{d.insuranceStatus}</p>
                <p className="text-xs text-muted-foreground mt-0.5 border-t border-border/50 pt-2">Exp: {d.insuranceExpiryDate}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${insuranceExpired ? 'bg-rose-100' : insuranceExpiring ? 'bg-amber-100' : 'bg-emerald-50'
                }`}>
                <ShieldCheck className={`h-5 w-5 ${insuranceExpired ? 'text-rose-600' : insuranceExpiring ? 'text-amber-600' : 'text-emerald-600'}`} />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'ind-tickets',
        defaultLayout: { x: 0, y: 1, w: 6, h: 2, minW: 3, minH: 2 },
        content: (
          <div className="bg-card rounded-lg border p-4 h-full flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><TicketPlus className="h-4 w-4 text-sky-500" /> My Service Requests</h3>
              <button onClick={() => setTicketModalOpen(true)} className="text-[10px] font-semibold bg-primary text-white rounded px-2 py-1 hover:brightness-110 transition-all">+ Raise</button>
            </div>
            <div className="space-y-3 flex-1 overflow-auto">
              {myTickets.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center pt-6">No active service requests</p>
              ) : myTickets.map(t => (
                <div key={t.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0 border-border/50">
                  <div>
                    <p className="font-medium text-sm">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.ticketNo} · {t.status}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded h-fit ${t.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'ind-contacts',
        defaultLayout: { x: 6, y: 1, w: 3, h: 2, minW: 2, minH: 1 },
        content: (
          <div className="bg-card rounded-lg border p-4 h-full flex flex-col shadow-sm">
            <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><User2 className="h-4 w-4 text-primary" /> My Support Contacts</h3>
            <div className="space-y-4 flex-1">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Vehicle Manager</p>
                <p className="font-semibold text-sm">{d.vehicleManagerName}</p>
                <p className="text-xs text-muted-foreground">{d.vehicleManagerEmail}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">HR Manager</p>
                <p className="font-semibold text-sm">{d.hrManagerName}</p>
                <p className="text-xs text-muted-foreground">{d.hrManagerEmail}</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'ind-residual',
        defaultLayout: { x: 9, y: 1, w: 3, h: 2, minW: 3, minH: 1 },
        content: (
          <div className="bg-card rounded-lg border p-4 h-full flex flex-col shadow-sm">
            <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><IndianRupee className="h-4 w-4 text-amber-500" /> Lease Value Summary</h3>
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Lease Value</span>
                <span className="font-bold text-sm">{formatCurrency(d.totalLeaseValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-sm text-emerald-600">{formatCurrency(d.amountPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Balance Remaining</span>
                <span className="font-bold text-sm text-primary">{formatCurrency(d.totalLeaseValue - d.amountPaid)}</span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Residual Value (at end)</span>
                <span className="font-bold text-sm text-amber-600">{formatCurrency(d.residualValue)}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full text-xs h-8" onClick={() => navigate('/contracts')}>View Full Lease Details</Button>
          </div>
        ),
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DraggableDashboard key="individual" cards={individualCards} editMode={editMode} onEditModeChange={setEditMode} />
      </div>
    );
  };

  /* ── Router logic ── */
  const renderDashboardLogic = () => {
    if (user?.isIndividual) return renderIndividual();
    if (role.includes("IT Admin")) return renderITAdmin();
    if (role.includes("RM - Orix")) return renderRM();
    if (role.toLowerCase().includes("hr manager") || isPortalUser) return renderClientHR();

    // Fallback for others
    return renderClientHR();
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded">
              <User2 className="h-3 w-3" /> {role}
            </span>
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
        </div>
        <div className="flex gap-2 items-center">
          {/* Global: Customize Layout toggle — available to all roles */}
          <CustomizeLayoutButton editMode={editMode} onToggle={() => setEditMode(v => !v)} />
          {isPortalUser && (
            <button onClick={() => setTicketModalOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-white rounded-lg px-4 py-1.5 hover:brightness-110 transition-all shadow-sm">
              <TicketPlus className="h-3.5 w-3.5" /> Raise Request
            </button>
          )}
        </div>
      </div>

      {renderDashboardLogic()}

      {/* ── Drill-down modal ── */}
      {drillModal && (
        <DrillDownModal
          open={!!drillModal}
          onClose={() => setDrillModal(null)}
          title={drillModal.title}
          columns={drillModal.columns}
          rows={drillModal.rows}
          summary={drillModal.summary}
        />
      )}

      {/* ── Create Ticket Modal ── */}
      <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Service Request</DialogTitle></DialogHeader>
          <form onSubmit={handleTicketSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={ticketCategory} onValueChange={(val) => { setTicketCategory(val); setTicketType(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select value={ticketType} onValueChange={setTicketType} disabled={!ticketCategory}>
                  <SelectTrigger><SelectValue placeholder={ticketCategory ? "Select Type" : "Select Category first"} /></SelectTrigger>
                  <SelectContent>
                    {ticketCategory && requestTypes.filter(t => t.categoryId === ticketCategory).map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger><SelectValue placeholder="Select Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Required Date</Label>
                <Input
                  type="date"
                  value={ticketDate}
                  onChange={e => setTicketDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
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
}
