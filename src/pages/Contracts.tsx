import { AppLayout } from "@/components/AppLayout";
import { contracts } from "@/data/sampleData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const Contracts = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = contracts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !c.contractNo.toLowerCase().includes(search.toLowerCase()) && !c.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Contracts & Leases</h1>
        <p className="page-description">Manage lease contracts, renewals, and rental schedules</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending Renewal">Pending Renewal</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contract No.</th>
              <th>Client</th>
              <th>Asset Type</th>
              <th>Tenure</th>
              <th>Monthly Rental</th>
              <th>Total Value</th>
              <th>Assets</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.contractNo}</td>
                <td>{c.clientName}</td>
                <td>{c.assetType}</td>
                <td>{c.tenure} months</td>
                <td>{formatCurrency(c.monthlyRental)}</td>
                <td>{formatCurrency(c.totalValue)}</td>
                <td className="text-center">{c.assetsCount}</td>
                <td className="text-muted-foreground">{c.startDate}</td>
                <td className="text-muted-foreground">{c.endDate}</td>
                <td>
                  <span className={`status-badge ${c.status === 'Active' ? 'status-active' : c.status === 'Pending Renewal' ? 'status-pending' : c.status === 'Expired' ? 'status-overdue' : 'status-closed'}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default Contracts;
