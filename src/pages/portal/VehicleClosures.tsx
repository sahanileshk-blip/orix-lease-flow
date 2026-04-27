import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Filter, TrendingDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TablePagination, usePagination } from "@/components/TablePagination";

const closureData = [
  { month: "Oct 2025", count: 2, amount: 430000, type: "Normal" },
  { month: "Nov 2025", count: 1, amount: 215000, type: "Normal" },
  { month: "Dec 2025", count: 3, amount: 645000, type: "Foreclosure" },
  { month: "Jan 2026", count: 1, amount: 198000, type: "Normal" },
  { month: "Feb 2026", count: 2, amount: 396000, type: "Normal" },
  { month: "Mar 2026", count: 4, amount: 890000, type: "Normal" },
];

const closures = [
  { id: "CL-001", vehicle: "Honda City — MH-01-AB-1234",   date: "31 Mar 2026", type: "Normal",      outstanding: 0,      status: "Closed" },
  { id: "CL-002", vehicle: "Maruti Brezza — MH-02-EF-9012", date: "28 Feb 2026", type: "Normal",      outstanding: 0,      status: "Closed" },
  { id: "CL-003", vehicle: "Tata Nexon — DL-01-GH-3456",    date: "15 Dec 2025", type: "Foreclosure", outstanding: 45000, status: "Pending" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const statusColor: Record<string, string> = {
  Closed:  "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  Pending: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
};

export default function VehicleClosures() {
  const { user } = useAuth();
  const [monthFilter, setMonthFilter] = useState("all");

  const filtered = closures.filter(c => monthFilter === "all" || c.date.includes(monthFilter));

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

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Monthly Vehicle Closures</h1>
        <p className="page-description">{user?.clientName} — Closure tracking, trends, and outstanding management</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Closures (6M)", value: closureData.reduce((s,d)=>s+d.count,0),                 unit: "vehicles" },
          { label: "Total Value Closed",  value: fmt(closureData.reduce((s,d)=>s+d.amount,0)),            unit: "" },
          { label: "Outstanding at Close",value: fmt(closures.reduce((s,c)=>s+c.outstanding,0)),          unit: "" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
            <p className="text-xl font-bold font-heading mt-1">{k.value} <span className="text-sm font-normal text-muted-foreground">{k.unit}</span></p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-sm">Closure Trend (Last 6 Months)</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> Mar 2026 peak — 4 closures
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={closureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip formatter={(v: number, name: string) => [name === "count" ? `${v} vehicles` : fmt(v), name === "count" ? "Closures" : "Value"]} />
            <Bar dataKey="count" name="count" fill="hsl(199,89%,48%)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Closure list */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b flex-wrap gap-2">
          <h2 className="font-heading font-semibold text-sm">Closure Records</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="Mar 2026">Mar 2026</SelectItem>
                <SelectItem value="Feb 2026">Feb 2026</SelectItem>
                <SelectItem value="Dec 2025">Dec 2025</SelectItem>
              </SelectContent>
            </Select>
            <button className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Closure ID", "Vehicle", "Closure Date", "Type", "Outstanding", "Status"].map(h => (
                  <th key={h} className="text-left text-xs text-muted-foreground font-medium py-2.5 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(c => (
                <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{c.id}</td>
                  <td className="py-3 px-4 text-xs font-medium">{c.vehicle}</td>
                  <td className="py-3 px-4 text-xs">{c.date}</td>
                  <td className="py-3 px-4 text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${c.type === "Foreclosure" ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20" : "bg-sky-50 text-sky-600 dark:bg-sky-900/20"}`}>{c.type}</span>
                  </td>
                  <td className={`py-3 px-4 text-xs font-semibold ${c.outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {c.outstanding > 0 ? fmt(c.outstanding) : "Nil"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[c.status]}`}>{c.status}</span>
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
      </div>
    </AppLayout>
  );
}
