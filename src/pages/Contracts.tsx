import { AppLayout } from "@/components/AppLayout";
import { contracts } from "@/data/sampleData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, FileText } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const Contracts = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<typeof contracts[0] | null>(null);

  const filtered = contracts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !c.contractNo.toLowerCase().includes(search.toLowerCase()) && !c.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const generateRentalSchedule = (contract: typeof contracts[0]) => {
    const schedule = [];
    const monthlyPrincipal = contract.totalValue * 0.85 / contract.tenure;
    const monthlyInterest = contract.totalValue * 0.15 / contract.tenure;
    const gst = contract.monthlyRental * 0.18;
    for (let i = 1; i <= Math.min(contract.tenure, 12); i++) {
      schedule.push({ month: i, principal: monthlyPrincipal, interest: monthlyInterest, gst, total: contract.monthlyRental + gst });
    }
    return schedule;
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Lease Management</h1>
        <p className="page-description">Manage lease contracts, renewals, rental schedules, and end-of-lease options</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Total Leases</p>
          <p className="text-2xl font-bold font-heading">{contracts.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold font-heading text-[hsl(var(--success))]">{contracts.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Pending Renewal</p>
          <p className="text-2xl font-bold font-heading text-[hsl(var(--warning))]">{contracts.filter(c => c.status === 'Pending Renewal').length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Total Lease Value</p>
          <p className="text-xl font-bold font-heading">{formatCurrency(contracts.reduce((s, c) => s + c.totalValue, 0))}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
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
              <th>Lease ID</th>
              <th>Client</th>
              <th>Asset Type</th>
              <th>Tenure</th>
              <th>Monthly Rental</th>
              <th>Total Value</th>
              <th>Assets</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <button
                    onClick={() => setSelectedContract(c)}
                    className="font-medium text-primary hover:underline cursor-pointer"
                  >
                    {c.contractNo}
                  </button>
                </td>
                <td>{c.clientName}</td>
                <td>{c.assetType}</td>
                <td>{c.tenure} mo</td>
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
                <td>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSelectedContract(c)}>
                    <Download className="h-3 w-3" /> Export
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lease Detail / Rental Schedule Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lease Detail – {selectedContract?.contractNo}
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground block">Client</span><span className="font-medium">{selectedContract.clientName}</span></div>
                <div><span className="text-muted-foreground block">Asset Type</span><span className="font-medium">{selectedContract.assetType}</span></div>
                <div><span className="text-muted-foreground block">Status</span><span className={`status-badge ${selectedContract.status === 'Active' ? 'status-active' : 'status-pending'}`}>{selectedContract.status}</span></div>
                <div><span className="text-muted-foreground block">Tenure</span><span className="font-medium">{selectedContract.tenure} months</span></div>
                <div><span className="text-muted-foreground block">Monthly Rental</span><span className="font-medium">{formatCurrency(selectedContract.monthlyRental)}</span></div>
                <div><span className="text-muted-foreground block">Total Value</span><span className="font-medium">{formatCurrency(selectedContract.totalValue)}</span></div>
                <div><span className="text-muted-foreground block">Start Date</span><span className="font-medium">{selectedContract.startDate}</span></div>
                <div><span className="text-muted-foreground block">End Date</span><span className="font-medium">{selectedContract.endDate}</span></div>
                <div><span className="text-muted-foreground block">Assets Count</span><span className="font-medium">{selectedContract.assetsCount}</span></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold">Rental Schedule (EMI Breakdown)</h3>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <Download className="h-3 w-3" /> Export CSV
                  </Button>
                </div>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>GST (18%)</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateRentalSchedule(selectedContract).map((row) => (
                        <tr key={row.month}>
                          <td>{row.month}</td>
                          <td>{formatCurrency(row.principal)}</td>
                          <td>{formatCurrency(row.interest)}</td>
                          <td>{formatCurrency(row.gst)}</td>
                          <td className="font-medium">{formatCurrency(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Showing first 12 months of {selectedContract.tenure} month tenure</p>
              </div>

              <div>
                <h3 className="font-heading font-semibold mb-2">End-of-Lease Options</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Buyout</Button>
                  <Button variant="outline" size="sm">Return Assets</Button>
                  <Button variant="outline" size="sm">Extend Lease</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Contracts;
