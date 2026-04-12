import { AppLayout } from "@/components/AppLayout";
import { invoices } from "@/data/sampleData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, IndianRupee } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const Invoices = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search && !inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) && !inv.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Invoices & Payments</h1>
        <p className="page-description">Track invoices, payments, and overdue balances</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-xl font-bold font-heading text-success mt-1">{formatCurrency(totalPaid)}</p>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Client</th>
              <th>Contract</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Paid Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium">{inv.invoiceNo}</td>
                <td>{inv.clientName}</td>
                <td className="text-muted-foreground">{inv.contractNo}</td>
                <td>{formatCurrency(inv.amount)}</td>
                <td>{inv.dueDate}</td>
                <td className="text-muted-foreground">{inv.paidDate || '—'}</td>
                <td>
                  <span className={`status-badge ${inv.status === 'Paid' ? 'status-active' : inv.status === 'Pending' ? 'status-pending' : 'status-overdue'}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default Invoices;
