import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Car, FileText, AlertTriangle, TicketPlus, TrendingUp, IndianRupee,
  Calendar, Monitor, Wrench, BarChart3, Layers, RotateCcw,
  Clock, History, Star, CreditCard, ShieldCheck, ArrowRight, User2,
  FolderOpen, Users, LogIn, Activity, Globe, LayoutDashboard, Flag, Settings, DollarSign, Info
} from "lucide-react";
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
    return e >= minDate && e <= maxDate && (c.status === "Disbursed" || c.status === "Partially Disbursed");
  });
}

const COLORS = ["hsl(210,52%,24%)", "hsl(199,89%,48%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)"];

const TICKET_CATEGORIES: Record<string, string[]> = {
  "Vehicle": ["Service / Maintenance", "Accident Reporting", "Replacement Request", "General Query"],
  "IT Equipment": ["Hardware Issue", "Software Issue", "Replacement Request", "Upgrade Request"]
};

export default function Dashboard() {
  const { dashboardKPIs, contracts, tickets, notifications, assets, auditLogs, invoices } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resetDashboardLayout, recentModules } = usePersonalization();
  const { toast } = useToast();
  const { clientFilter, setClientFilter } = useFilter();
  
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketCategory, setTicketCategory] = useState<string>("");
  const [ticketType, setTicketType] = useState<string>("");
  const [healthClientFilter, setHealthClientFilter] = useState<string[]>([]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketModalOpen(false);
    toast({ title: "Ticket created", description: "Service request logged.", variant: "default" });
  };

  const [loading, setLoading] = useState(true);
  const [expiryWindow, setExpiryWindow] = useState("30");
  const [drillModal, setDrillModal] = useState<{ title: string; rows: any[]; summary?: any[]; columns?: DrillColumn[] } | null>(null);
  const [loginRange, setLoginRange] = useState("Daily");

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
      { name: "IT Assets", interactions: 65, fill: "hsl(210,52%,85%)" },
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
      const mockRows = Array.from({length: Math.min(count, 15)}).map((_, i) => ({
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
      const mockRows = Array.from({length: Math.min(count, 15)}).map((_, i) => ({
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
      const mockRows = Array.from({length: Math.min(count, 15)}).map((_, i) => ({
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

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total Active Users" value={totalUsers} icon={<Users className="h-5 w-5 text-indigo-500" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" trend={{ direction: "up", percent: 8 }} insight="45 Admins · 80 Clients · 27 Mngrs" onClick={() => openModuleDrill("System User", totalUsers)} />
          <KPICard label="System Login Activity" value="590" icon={<Activity className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" insight="Peak activity today at 10:00 AM" onClick={() => openModuleDrill("Authentication", 590)} />
          <KPICard label="New User IDs (MTD)" value={newUsersCount} icon={<User2 className="h-5 w-5 text-sky-500" />} iconBg="bg-sky-50 dark:bg-sky-900/20" trend={{ direction: "up", percent: 12 }} insight="Mostly Client-side onboarding" onClick={() => openModuleDrill("Onboarding", newUsersCount)} />
          <KPICard label="Audit Log Anomalies" value={failedLogins} icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} iconBg="bg-rose-50 dark:bg-rose-900/20" valueColor="text-rose-600" insight="Failed login attempts flagged" onClick={() => openModuleDrill("Security", failedLogins)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-lg border p-5 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-heading font-semibold text-sm">System Login Activity</h3>
               <Select value={loginRange} onValueChange={setLoginRange}>
                 <SelectTrigger className="w-[100px] h-7 text-xs bg-muted/50 border-0">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Daily">Daily</SelectItem>
                   <SelectItem value="Weekly">Weekly</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <ResponsiveContainer width="100%" height={260}>
                <LineChart data={loginTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ stroke: 'var(--border)' }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(210,52%,40%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ onClick: (_, payload) => openLoginDrill(payload.payload.day, payload.payload.count), cursor: 'pointer', r: 6 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-lg border p-5 shadow-sm flex flex-col">
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
                      <TooltipContent className="text-xs">
                        Counts updates to login page text and branding elements.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-5 shadow-sm">
           <h3 className="font-heading font-semibold text-sm mb-4">Top Module Interactions</h3>
           <ResponsiveContainer width="100%" height={220}>
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
    );
  };

  /* ── RM Orix View ── */
  const renderRM = () => {
    // Dynamically filter dash references via global FilterContext to ensure total consistency
    const dashContracts = contracts;
    const dashInvoices = invoices;
    const dashTickets = tickets;

    const quotesSub = Math.floor(dashContracts.length * 1.5);
    const quotesPend = Math.floor(quotesSub * 0.25);
    const contractsInProgress = Math.floor(dashContracts.length * 0.2) + 1;
    const invOwnClients = dashInvoices.filter(i => i.status !== 'Paid').length;
    const leaseDisbursed = dashContracts.filter(c => c.status === 'Disbursed').length; // Mock current month
    const renewals30 = getExpiringLeases(dashContracts, 0, 30).length;
    const openSupport = dashTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

    // Payment health breakdown
    const healthData = healthClientFilter.length === 0
      ? [ { name: "Good", value: 65, fill: "hsl(142,71%,45%)" }, { name: "At Risk", value: 20, fill: "hsl(38,92%,50%)" }, { name: "Overdue", value: 15, fill: "hsl(0,72%,51%)" } ]
      : [ { name: "Good", value: 85, fill: "hsl(142,71%,45%)" }, { name: "At Risk", value: 5, fill: "hsl(38,92%,50%)" }, { name: "Overdue", value: 10, fill: "hsl(0,72%,51%)" } ];

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
        rows: relevantInvoices.map(inv => ({
          id: inv.id,
          client: inv.clientName,
          value: inv.amount,
          status: inv.status
        })),
        summary: [{ label: 'Total Invoices', value: String(relevantInvoices.length) }, { label: 'Health Segment', value: `${percentage}%` }]
      });
    };

    const uniqueClients = Array.from(new Set(contracts.map(c => c.clientName)));
    const clientOptions = uniqueClients.filter(Boolean).map(c => ({ label: c, value: c }));

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Quotes Submitted" value={quotesSub} icon={<FileText className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" insight={`${quotesPend} currently pending approval`} />
          <KPICard label="Leases In Progress" value={contractsInProgress} icon={<Layers className="h-5 w-5 text-indigo-500" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" insight={clientFilter.length > 0 ? "Filtered" : "Across all active clients"} />
          <KPICard label="Lease Disbursements" value={leaseDisbursed} icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" insight="Successfully disbursed this month" />
          <KPICard label="Outstanding Invoices Count" value={invOwnClients} icon={<DollarSign className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50 dark:bg-amber-900/20" valueColor="text-amber-600" insight="Requires follow up" onClick={() => navigate('/invoices')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-5 flex flex-col">
             <div className="flex justify-between items-center mb-4 gap-2">
               <h3 className="font-heading font-semibold text-sm">Client Payment Health</h3>
               <MultiSelect 
                 options={clientOptions} 
                 selected={healthClientFilter} 
                 onChange={setHealthClientFilter} 
                 placeholder="Filter Clients..."
                 className="h-7 min-h-7 text-[10px] w-[140px]"
               />
             </div>
             <div className="flex-1 flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height={200}>
                 <PieChart>
                    <Pie data={healthData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
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
          
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-lg border p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><TicketPlus className="h-4 w-4 text-sky-500" /> Open Tickets (Own Clients)</h3>
                  <span className="text-xs bg-sky-50 dark:bg-sky-900/20 text-sky-600 px-2.5 py-1 rounded-full font-medium">{openSupport} Active</span>
                </div>
                <div className="space-y-3">
                  {tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').slice(0,3).map(t =>(
                     <div key={t.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0 border-border/50">
                       <div>
                         <p className="font-medium text-sm">{t.subject}</p>
                         <p className="text-xs text-muted-foreground">{t.clientName} · {t.ticketNo}</p>
                       </div>
                       <div className="text-right">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.priority==='Critical'?'bg-rose-100 text-rose-700': 'bg-amber-100 text-amber-700'}`}>{t.priority}</span>
                       </div>
                     </div>
                  ))}
                </div>
            </div>

            <div className="bg-card rounded-lg border p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-500" /> Upcoming Renewals</h3>
                  <p className="text-xs text-muted-foreground">Next 30 Days</p>
                </div>
                <div className="space-y-3">
                  {getExpiringLeases(contracts, 0, 30).slice(0,3).map(c =>(
                     <div key={c.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0 border-border/50">
                       <div>
                         <p className="font-medium text-sm">{c.contractNo}</p>
                         <p className="text-xs text-muted-foreground">{c.clientName} · {c.assetType}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-sm text-amber-600">{formatDate(c.endDate)}</p>
                       </div>
                     </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
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
      const relevantContracts = contracts.filter(c => c.status === 'Disbursed' || c.status === 'Partially Disbursed');
      
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
    const overdueAmt = overdueInvs.reduce((a,b)=>a+b.amount,0);

    const assetPie = [
      { name: "Vehicles", value: dashboardKPIs.assetsByType.Vehicle, fill: "hsl(210,52%,40%)" },
      { name: "IT Assets", value: dashboardKPIs.assetsByType["IT Equipment"], fill: "hsl(199,89%,48%)" }
    ];

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* KPI Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Assigned Assets" value={dashboardKPIs.totalAssets} icon={<Layers className="h-5 w-5 text-indigo-500" />} iconBg="bg-indigo-50 dark:bg-indigo-900/20" insight="Active employee assignments" onClick={() => navigate('/vehicles')} />
          <KPICard label="Disbursed (FY26)" value="12" icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" insight="New leases funded this year" />
          <KPICard label="Overdue Invoices" value={overdueInvs.length} icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} iconBg="bg-rose-50 dark:bg-rose-900/20" valueColor="text-rose-600" insight={`Total Value: ${formatCurrency(overdueAmt)}`} onClick={() => navigate('/invoices')} />
          <KPICard label="SLA Compliance" value="98.2%" icon={<ShieldCheck className="h-5 w-5 text-sky-500" />} iconBg="bg-sky-50 dark:bg-sky-900/20" valueColor="text-emerald-600" insight="Orix service commitments met" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-5 shadow-sm">
             <h3 className="font-heading font-semibold text-sm mb-2">Total Facility Limit</h3>
             <div className="relative h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={limitData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                      {limitData.map((d, i) => (
                        <Cell 
                          key={i} 
                          fill={d.fill} 
                          className="cursor-pointer hover:opacity-80 transition-opacity outline-none" 
                          onClick={() => openFacilityDrill(d.name)}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => formatCurrency(v)} cursor={{fill: 'transparent'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Utilized</p>
                  <p className="text-xl font-bold font-heading text-foreground">{((facilityUtilized / facilityTotal) * 100).toFixed(1)}%</p>
                </div>
             </div>
             <div className="flex justify-between items-center mx-2 mt-1 mb-3">
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[hsl(221,83%,53%)]" /> Utilized</span>
                  <span className="text-sm font-semibold leading-tight">{formatCurrency(facilityUtilized)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-200" /> Available</span>
                  <span className="text-sm font-semibold leading-tight">{formatCurrency(Math.max(facilityTotal - facilityUtilized, 0))}</span>
                </div>
             </div>
             <div className="border-t border-border/50 pt-3 text-xs text-muted-foreground flex justify-between">
                <span>Facility Valid: <strong>01 Jan 2024 - 31 Dec 2028</strong></span>
             </div>
          </div>

          <div className="bg-card rounded-lg border p-5 shadow-sm flex flex-col justify-between">
             <h3 className="font-heading font-semibold text-sm mb-4">Lease Expiry Forecast</h3>
             <div className="space-y-5">
                <div>
                   <div className="flex justify-between items-end text-xs mb-1.5">
                      <span className="text-orange-500 font-medium">Coming 30 Days</span>
                      <div className="text-right"><span className="font-bold">{exp30} leases</span><p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(exp30Val)} at risk</p></div>
                   </div>
                   <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-orange-500" style={{ width: `${Math.max((exp30/maxExp)*100, 2)}%`}}></div></div>
                </div>
                <div>
                   <div className="flex justify-between items-end text-xs mb-1.5">
                      <span className="text-amber-500 font-medium">31 - 60 Days</span>
                      <div className="text-right"><span className="font-bold">{exp60} leases</span><p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(exp60Val)} at risk</p></div>
                   </div>
                   <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${Math.max((exp60/maxExp)*100, 2)}%`}}></div></div>
                </div>
                <div>
                   <div className="flex justify-between items-end text-xs mb-1.5">
                      <span className="text-yellow-500 font-medium">61 - 90 Days</span>
                      <div className="text-right"><span className="font-bold">{exp90} leases</span><p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(exp90Val)} at risk</p></div>
                   </div>
                   <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: `${Math.max((exp90/maxExp)*100, 2)}%`}}></div></div>
                </div>
             </div>
             <Button variant="outline" className="w-full mt-6 text-xs h-8" onClick={() => navigate('/contracts')}>Review All Renewals</Button>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-4 shadow-sm flex items-center justify-between">
               <div>
                  <h3 className="font-heading font-semibold text-sm">Asset Class</h3>
                  <div className="flex gap-4 mt-2">
                     <span className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(210,52%,40%)]" /> Vehicles ({assetPie[0].value})</span>
                     <span className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(199,89%,48%)]" /> IT ({assetPie[1].value})</span>
                  </div>
               </div>
               <div className="h-16 w-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={assetPie} cx="50%" cy="50%" innerRadius={18} outerRadius={30} dataKey="value" stroke="none">
                        {assetPie.map((e,i)=><Cell key={i} fill={e.fill} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-card rounded-lg border p-4 shadow-sm">
               <h3 className="font-heading font-semibold text-sm mb-3">Pending Actions Log</h3>
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
          </div>
        </div>
      </div>
    );
  };

  /* ── Router logic ── */
  const renderDashboardLogic = () => {
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
        <div className="flex gap-2">
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
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select value={ticketType} onValueChange={setTicketType} disabled={!ticketCategory}>
                  <SelectTrigger><SelectValue placeholder={ticketCategory ? "Select Type" : "Select Category first"} /></SelectTrigger>
                  <SelectContent>
                    {ticketCategory && TICKET_CATEGORIES[ticketCategory]?.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
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
}
