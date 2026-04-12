import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Quote {
  id: string;
  quotationCode: string;
  enquiryCode: string;
  customerName: string;
  productType: string;
  leaseTenure: number;
  interestRate: number;
  assetCost: number;
  monthlyRental: number;
  totalLeaseValue: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  createdAt: string;
}

const sampleQuotes: Quote[] = [
  { id: 'q1', quotationCode: 'QT-2026-001', enquiryCode: 'ENQ-001', customerName: 'Tata Motors Ltd', productType: 'FL', leaseTenure: 36, interestRate: 9.5, assetCost: 1500000, monthlyRental: 48500, totalLeaseValue: 1746000, status: 'Approved', createdAt: '2026-03-15' },
  { id: 'q2', quotationCode: 'QT-2026-002', enquiryCode: 'ENQ-002', customerName: 'Infosys Technologies', productType: 'FL', leaseTenure: 24, interestRate: 10, assetCost: 800000, monthlyRental: 37200, totalLeaseValue: 892800, status: 'Submitted', createdAt: '2026-04-01' },
  { id: 'q3', quotationCode: 'QT-2026-003', enquiryCode: 'ENQ-003', customerName: 'Reliance Industries', productType: 'FL', leaseTenure: 48, interestRate: 9, assetCost: 2200000, monthlyRental: 54800, totalLeaseValue: 2630400, status: 'Draft', createdAt: '2026-04-10' },
  { id: 'q4', quotationCode: 'QT-2026-004', enquiryCode: 'ENQ-004', customerName: 'Wipro Limited', productType: 'FL', leaseTenure: 36, interestRate: 9.5, assetCost: 650000, monthlyRental: 21000, totalLeaseValue: 756000, status: 'Rejected', createdAt: '2026-04-05' },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const Quotes = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [tenure, setTenure] = useState("36");
  const [interestRate, setInterestRate] = useState("9.5");
  const [assetCost, setAssetCost] = useState("");
  const [rvPercent, setRvPercent] = useState("10");

  const calcMonthlyRental = () => {
    const cost = parseFloat(assetCost) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = parseInt(tenure) || 36;
    const rv = cost * (parseFloat(rvPercent) || 0) / 100;
    if (rate === 0) return (cost - rv) / n;
    return (cost - rv) * rate / (1 - Math.pow(1 + rate, -n));
  };

  const monthly = calcMonthlyRental();
  const totalValue = monthly * (parseInt(tenure) || 36);

  const filtered = sampleQuotes.filter((q) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search && !q.quotationCode.toLowerCase().includes(search.toLowerCase()) && !q.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogOpen(false);
    toast({ title: "Quote Created", description: "New quote has been saved as Draft." });
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Quote Management</h1>
          <p className="page-description">Create, manage, and convert lease quotes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Create Quote</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Enquiry Code</Label>
                  <Input placeholder="ENQ-XXX" />
                </div>
                <div className="space-y-2">
                  <Label>Quotation Code</Label>
                  <Input value="QT-2026-005" disabled className="bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select defaultValue="c1">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c1">Tata Motors Ltd</SelectItem>
                      <SelectItem value="c2">Infosys Technologies</SelectItem>
                      <SelectItem value="c3">Reliance Industries</SelectItem>
                      <SelectItem value="c4">Wipro Limited</SelectItem>
                      <SelectItem value="c5">Mahindra & Mahindra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select defaultValue="FL">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FL">Full-service Lease (FL)</SelectItem>
                      <SelectItem value="OL">Operating Lease (OL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <Input value="Monthly" disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Rental Mode</Label>
                  <Select defaultValue="advance">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advance">Advance</SelectItem>
                      <SelectItem value="arrears">Arrears</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moratorium (months)</Label>
                  <Input type="number" defaultValue="0" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Lease Tenure (months)</Label>
                  <Input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} min="1" required />
                </div>
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} min="0" required />
                </div>
                <div className="space-y-2">
                  <Label>Residual Value (%)</Label>
                  <Input type="number" step="0.1" value={rvPercent} onChange={(e) => setRvPercent(e.target.value)} min="0" max="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Cost (Ex-showroom ₹)</Label>
                  <Input type="number" value={assetCost} onChange={(e) => setAssetCost(e.target.value)} min="0" required placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Processing Charges (₹)</Label>
                  <Input type="number" defaultValue="0" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Insurance Charges (₹)</Label>
                  <Input type="number" defaultValue="0" min="0" />
                </div>
                <div className="space-y-2">
                  <Label>Lease Financing %</Label>
                  <Input type="number" defaultValue="100" min="0" max="100" />
                </div>
              </div>

              {/* Auto-calculated summary */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium font-heading">Calculated Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Monthly Rental (EMI):</span>
                  <span className="font-medium">{formatCurrency(monthly)}</span>
                  <span className="text-muted-foreground">Total Lease Value:</span>
                  <span className="font-medium">{formatCurrency(totalValue)}</span>
                  <span className="text-muted-foreground">Residual Value:</span>
                  <span className="font-medium">{formatCurrency((parseFloat(assetCost) || 0) * (parseFloat(rvPercent) || 0) / 100)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" variant="outline">Save as Draft</Button>
                <Button type="submit">Submit Quote</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quote Code</th>
              <th>Enquiry</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Tenure</th>
              <th>Asset Cost</th>
              <th>Monthly Rental</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id}>
                <td className="font-medium text-primary cursor-pointer hover:underline">{q.quotationCode}</td>
                <td>{q.enquiryCode}</td>
                <td>{q.customerName}</td>
                <td>{q.productType}</td>
                <td>{q.leaseTenure} mo</td>
                <td>{formatCurrency(q.assetCost)}</td>
                <td>{formatCurrency(q.monthlyRental)}</td>
                <td>{formatCurrency(q.totalLeaseValue)}</td>
                <td>
                  <span className={`status-badge ${q.status === 'Approved' ? 'status-active' : q.status === 'Submitted' ? 'status-pending' : q.status === 'Rejected' ? 'status-overdue' : 'status-closed'}`}>
                    {q.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{q.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default Quotes;
