import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const leases = [
  { id: "LC-2789", asset: "Honda City — MH-01-AB-1234", start: "2024-01-01", end: "2026-12-31", months: 36, monthly: 148500, status: "Disbursed" },
  { id: "LC-2791", asset: "Maruti Swift — MH-01-CD-5678", start: "2023-07-01", end: "2026-06-30", months: 36, monthly: 98000, status: "Disbursed" },
];

const payments = [
  { month: "Apr 2026", amount: 148500, status: "Upcoming", due: "2026-04-25" },
  { month: "Mar 2026", amount: 148500, status: "Paid", due: "2026-03-25" },
  { month: "Feb 2026", amount: 148500, status: "Paid", due: "2026-02-25" },
  { month: "Jan 2026", amount: 148500, status: "Missed", due: "2026-01-25" },
  { month: "Dec 2025", amount: 148500, status: "Paid", due: "2025-12-25" },
];

const statusIcon: Record<string, React.ElementType> = {
  Paid: CheckCircle2,
  Upcoming: Clock,
  Missed: AlertCircle,
  Pending: Clock,
};
const statusColor: Record<string, string> = {
  Paid: "text-emerald-500",
  Upcoming: "text-sky-500",
  Missed: "text-rose-500",
  Pending: "text-amber-500",
};

export default function LeaseProgress() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Lease Tenure & Payment Progress</h1>
        <p className="page-description">{user?.clientName} — Track your lease progress and payment history</p>
      </div>

      <div className="space-y-6">
        {leases.map(lease => {
          const now = new Date();
          const start = new Date(lease.start);
          const end = new Date(lease.end);
          const totalMs = end.getTime() - start.getTime();
          const elapsedMs = Math.min(now.getTime() - start.getTime(), totalMs);
          const elapsedMonths = Math.floor(elapsedMs / (1000 * 60 * 60 * 24 * 30.44));
          const pct = Math.min(Math.round((elapsedMonths / lease.months) * 100), 100);
          const remaining = lease.months - elapsedMonths;

          return (
            <div key={lease.id} className="bg-card border rounded-xl p-5 space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{lease.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 font-medium">{lease.status}</span>
                  </div>
                  <p className="font-semibold text-sm mt-1 font-heading">{lease.asset}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(lease.start).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} →{" "}
                    {new Date(lease.end).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Monthly Rental</p>
                  <p className="text-lg font-bold font-heading">{fmt(lease.monthly)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{elapsedMonths}/{lease.months} months elapsed</span>
                  <span className="font-semibold text-foreground">{pct}% complete</span>
                  <span>{remaining} months remaining</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(lease.start).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(lease.end).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Tenure", value: `${lease.months} months` },
                  { label: "Total Lease Value", value: fmt(lease.months * lease.monthly) },
                  { label: "Paid to Date", value: fmt(elapsedMonths * lease.monthly) },
                ].map(s => (
                  <div key={s.label} className="bg-muted/40 rounded-lg p-3 border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <p className="text-sm font-bold font-heading mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Payment schedule */}
              <div>
                <h3 className="font-heading font-semibold text-xs mb-3 flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                  Recent Payment History
                </h3>
                <div className="space-y-1.5">
                  {payments.map((p, i) => {
                    const Icon = statusIcon[p.status] ?? Clock;
                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 shrink-0 ${statusColor[p.status]}`} />
                          <div>
                            <p className="text-sm font-medium">{p.month}</p>
                            <p className="text-xs text-muted-foreground">Due: {new Date(p.due).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-medium ${statusColor[p.status]}`}>{p.status}</span>
                          <span className="text-sm font-semibold">{fmt(p.amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
