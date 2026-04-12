import { AppLayout } from "@/components/AppLayout";
import { dashboardKPIs, assets, contracts, invoices, tickets, notifications } from "@/data/sampleData";
import { Car, Monitor, FileText, Receipt, AlertTriangle, TicketPlus, TrendingUp, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(210, 52%, 24%)", "hsl(199, 89%, 48%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

const assetDistribution = [
  { name: "Vehicle", value: dashboardKPIs.assetsByType.Vehicle },
  { name: "IT Assets", value: dashboardKPIs.assetsByType.IT },
];

const statusDistribution = Object.entries(dashboardKPIs.assetsByStatus).map(([name, value]) => ({ name, value }));

const monthlyTrend = [
  { month: "Nov", value: 220000 },
  { month: "Dec", value: 222000 },
  { month: "Jan", value: 222000 },
  { month: "Feb", value: 222000 },
  { month: "Mar", value: 222000 },
  { month: "Apr", value: 222000 },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const Dashboard = () => {
  const recentTickets = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").slice(0, 3);
  const recentNotifications = notifications.filter((n) => !n.read).slice(0, 4);

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview of leases, assets, and operations across all clients</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Leases</p>
              <p className="text-2xl font-bold font-heading mt-1">{dashboardKPIs.activeLeases}</p>
              <p className="text-xs text-muted-foreground mt-1">of {dashboardKPIs.totalLeases} total</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold font-heading mt-1">{dashboardKPIs.totalAssets}</p>
              <p className="text-xs text-muted-foreground mt-1">{dashboardKPIs.assetsByType.Vehicle} vehicles · {dashboardKPIs.assetsByType.IT} IT</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Car className="h-5 w-5 text-accent" />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Lease Value</p>
              <p className="text-2xl font-bold font-heading mt-1">{formatCurrency(dashboardKPIs.totalLeaseValue)}</p>
              <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> On track</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue Invoices</p>
              <p className="text-2xl font-bold font-heading mt-1 text-destructive">{dashboardKPIs.overdueInvoices}</p>
              <p className="text-xs text-destructive mt-1">{formatCurrency(dashboardKPIs.overdueAmount)} outstanding</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={assetDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {assetDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Asset Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Monthly Lease Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="value" stroke="hsl(210, 52%, 24%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <TicketPlus className="h-4 w-4 text-warning" /> Open Tickets
          </h3>
          <div className="space-y-3">
            {recentTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.clientName} · {t.ticketNo}</p>
                </div>
                <span className={`status-badge ${t.priority === 'Critical' ? 'status-overdue' : t.priority === 'High' ? 'status-pending' : 'status-active'}`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Alerts
          </h3>
          <div className="space-y-3">
            {recentNotifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.type === 'error' ? 'bg-destructive' : n.type === 'warning' ? 'bg-warning' : 'bg-info'}`} />
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
