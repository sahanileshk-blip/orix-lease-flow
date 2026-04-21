import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, FileText, RefreshCw, PenLine, Save, MoreHorizontal, ArrowRight } from "lucide-react";
import { SaveReportModal } from "@/components/SaveReportModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFilter } from "@/contexts/FilterContext";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function downloadCSV(data: any[], filename: string) {
  const headers = ['Lease ID', 'Lease Type', 'Client', 'Asset Type', 'Tenure', 'Monthly Rental', 'Total Value', 'Assets', 'Start', 'End', 'Status', 'Cost Center', 'Location', 'Return Status'];
  const rows = data.map(c => [
    c.contractNo, c.leaseType, c.clientName, c.assetType, c.tenure, c.monthlyRental, c.totalValue, c.assetsCount, c.startDate, c.endDate, c.status, c.costCenter, c.location, c.returnStatus || ''
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const Contracts = () => {
  const { rawContracts } = useAppData();
  const { leaseStatusFilter } = useFilter();
  const [periodFilter, setPeriodFilter] = useState("");
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filtered = rawContracts.filter((c) => {
    if (!user?.isAdmin && parseInt(c.id) % 2 === 0) return false; // Mock filtering logic for My Leases
    if (search && !c.contractNo.toLowerCase().includes(search.toLowerCase()) && !c.clientName.toLowerCase().includes(search.toLowerCase())) return false;

    if (periodFilter !== "") {
      const sDate = new Date(c.startDate);
      const eDate = new Date(c.endDate);
      let overlaps = false;
      const targetYear = parseInt(periodFilter.split('-')[0]);
      const targetMonth = parseInt(periodFilter.split('-')[1]);

      let temp = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
      const endTarget = new Date(eDate.getFullYear(), eDate.getMonth(), 1);

      while (temp <= endTarget) {
        const y = temp.getFullYear();
        const m = temp.getMonth() + 1;

        if (targetYear === y && targetMonth === m) {
          overlaps = true;
          break;
        }
        temp.setMonth(temp.getMonth() + 1);
      }
      if (!overlaps) return false;
    }

    return true;
  });

  const generateRentalSchedule = (contract: any) => {
    const schedule = [];
    const monthlyPrincipal = contract.totalValue * 0.85 / contract.tenure;
    const monthlyInterest = contract.totalValue * 0.15 / contract.tenure;
    const gst = contract.monthlyRental * 0.18;
    for (let i = 1; i <= Math.min(contract.tenure, 12); i++) {
      schedule.push({ month: i, principal: monthlyPrincipal, interest: monthlyInterest, gst, total: contract.monthlyRental + gst });
    }
    return schedule;
  };

  const handleExtension = (contractNo: string) => {
    toast({ title: "Extension Initiated", description: `Extension request for ${contractNo} has been submitted to ORIX team.` });
  };

  const handleAmendment = (contractNo: string) => {
    toast({ title: "Amendment Request", description: `Amendment request for ${contractNo} has been submitted. ORIX team will review shortly.` });
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">{user?.isAdmin ? "Lease Management" : "My Leases"}</h1>
          <p className="page-description">Overview of active contracts, renewals, and closures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setReportModalOpen(true)}>
            <Save className="h-4 w-4" /> Save Custom Report
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'contracts.csv')}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Total Leases</p>
          <p className="text-2xl font-bold font-heading">{filtered.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Disbursed</p>
          <p className="text-2xl font-bold font-heading text-[hsl(var(--success))]">{filtered.filter(c => c.status === 'Disbursed').length}</p>
        </div>

        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Foreclosed</p>
          <p className="text-2xl font-bold font-heading text-muted-foreground">{filtered.filter(c => c.status === 'Foreclosed').length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Total Lease Value</p>
          <p className="text-xl font-bold font-heading">{formatCurrency(filtered.reduce((s, c) => s + c.totalValue, 0))}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2 w-full md:w-auto ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
          </div>
          <Input
            type="month"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="h-9 w-[180px]"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lease ID</th>
              <th>Type</th>
              {user?.isAdmin && <th>Client</th>}
              <th>Asset Type</th>
              <th>Tenure(Months)</th>
              <th>Monthly Rental</th>
              <th>Total Dues</th>
              <th>Total Value</th>
              <th>Assets</th>
              <th>Overdue Invoices</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Return Status</th>
              <th>Rental Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <button
                    onClick={() => navigate(`/leases/${c.contractNo}`)}
                    className="font-medium text-primary hover:underline cursor-pointer"
                  >
                    {c.contractNo}
                  </button>
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.leaseType === 'FL' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                    {c.leaseType}
                  </span>
                </td>
                {user?.isAdmin && <td>{c.clientName}</td>}
                <td>{c.assetType}</td>
                <td>{c.tenure}</td>
                <td>{formatCurrency(c.monthlyRental)}</td>
                <td>{formatCurrency(0)}</td>
                <td>{formatCurrency(c.totalValue)}</td>
                <td className="text-center">{c.assetsCount}</td>
                <td className="text-center">{0}</td>
                <td className="text-muted-foreground">{c.startDate}</td>
                <td className="text-muted-foreground">{c.endDate}</td>
                <td>
                  <span className={`status-badge ${c.status === 'Disbursed' ? 'status-active' : 'status-closed'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="text-muted-foreground">
                  {(c.status === 'Foreclosed') ? (
                    <span className={`status-badge ${c.returnStatus === 'Returned' ? 'status-active' : c.returnStatus === 'Pending Return' ? 'status-pending' : 'status-closed'}`}>
                      {c.returnStatus || '—'}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSelectedSchedule(c)}>
                    <Download className="h-3 w-3" /> Schedule
                  </Button>
                </td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled={c.status === 'Foreclosed'}>Restructure</DropdownMenuItem>
                      <DropdownMenuItem disabled={c.status === 'Foreclosed'}>Foreclosure</DropdownMenuItem>
                      <DropdownMenuItem disabled={c.status === 'Foreclosed'}>Request a Call</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 font-bold border-t-2">
              <td colSpan={user?.isAdmin ? 5 : 4} className="text-right py-4">Total:</td>
              <td className="py-4 text-primary">{formatCurrency(filtered.reduce((sum, c) => sum + c.monthlyRental, 0))}</td>
              <td className="py-4 text-primary">{formatCurrency(0)}</td>
              <td className="py-4 text-primary">{formatCurrency(filtered.reduce((sum, c) => sum + c.totalValue, 0))}</td>
              <td className="text-center py-4 text-primary"></td>
              <td className="text-center py-4 text-primary"></td>
              <td colSpan={6}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Rental Schedule Modal Only */}
      <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rental Schedule (Rental Breakdown) – {selectedSchedule?.contractNo}
            </DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted-foreground">Repayment Timeline</h3>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <Download className="h-3 w-3" /> Export CSV
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr className="bg-muted/50">
                        <th>Month</th>
                        <th>Rental (Principal + Int)</th>
                        <th>GST (18%)</th>
                        <th>Total Payable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateRentalSchedule(selectedSchedule).map((row) => (
                        <tr key={row.month}>
                          <td>{row.month}</td>
                          <td className="font-semibold">{formatCurrency(row.principal + row.interest)}</td>
                          <td className="text-muted-foreground">{formatCurrency(row.gst)}</td>
                          <td className="font-bold text-primary">{formatCurrency(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Showing first 12 months (standard projection) of {selectedSchedule.tenure} months.</p>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="default" onClick={() => navigate(`/leases/${selectedSchedule.contractNo}`)}>
                  View Full Lease Details <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <SaveReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} moduleName="Contracts" activeFilters={{ search, status: leaseStatusFilter.join(','), periodFilter }} />
    </AppLayout>
  );
};

export default Contracts;
