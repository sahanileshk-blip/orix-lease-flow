import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, FileText, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MultiSelect } from "@/components/ui/multi-select";
import { SaveReportModal } from "@/components/SaveReportModal";
import { Download, Save } from "lucide-react";

function downloadCSV(data: any[], filename: string) {
  const headers = ['Quote Code', 'Enquiry', 'Customer', 'Tenure', 'Asset Cost', 'Monthly Rental', 'Total Value', 'Status', 'Date'];
  const rows = data.map(q => [
    q.quotationCode, q.enquiryCode, q.customerName, q.leaseTenure, q.assetCost, q.monthlyRental, q.totalLeaseValue, q.status, q.createdAt
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
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  createdAt: string;
}

const sampleQuotes: Quote[] = [
  { id: 'q1', quotationCode: 'QT-2026-001', enquiryCode: 'ENQ-001', customerName: 'Qualtech Edge Ltd', productType: 'FL', leaseTenure: 36, interestRate: 9.5, assetCost: 1500000, monthlyRental: 48500, totalLeaseValue: 1746000, status: 'Approved', createdAt: '2026-03-15' },
  { id: 'q2', quotationCode: 'QT-2026-002', enquiryCode: 'ENQ-002', customerName: 'Reliance Industries', productType: 'FL', leaseTenure: 24, interestRate: 10, assetCost: 800000, monthlyRental: 37200, totalLeaseValue: 892800, status: 'Pending', createdAt: '2026-04-01' },
  { id: 'q3', quotationCode: 'QT-2026-003', enquiryCode: 'ENQ-003', customerName: 'Reliance Industries', productType: 'FL', leaseTenure: 48, interestRate: 9, assetCost: 2200000, monthlyRental: 54800, totalLeaseValue: 2630400, status: 'Expired', createdAt: '2026-04-10' },
  { id: 'q4', quotationCode: 'QT-2026-004', enquiryCode: 'ENQ-004', customerName: 'Wipro Limited', productType: 'FL', leaseTenure: 36, interestRate: 9.5, assetCost: 650000, monthlyRental: 21000, totalLeaseValue: 756000, status: 'Rejected', createdAt: '2026-04-05' },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const Quotes = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Dynamic Form state
  const [productType, setProductType] = useState("it-asset");
  const [manufacturer, setManufacturer] = useState("");
  const [productName, setProductName] = useState("");
  const [variant, setVariant] = useState("");

  // IT Specific
  const [storage, setStorage] = useState("");
  const [ram, setRam] = useState("");

  // Vehicle Specific
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [vehicleColour, setVehicleColour] = useState("");

  const filtered = sampleQuotes.filter((q) => {
    if (statusFilter.length > 0 && !statusFilter.includes(q.status)) return false;
    if (search && !q.quotationCode.toLowerCase().includes(search.toLowerCase()) && !q.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogOpen(false);
    toast({ title: "Request Submitted", description: "Your lease request has been sent to ORIX for review." });
  };

  const handleApprove = (code: string) => {
    toast({ title: "Request Approved", description: `Quotation ${code} has been approved and moved to contracts.` });
  };

  const handleReject = (code: string) => {
    toast({ title: "Request Rejected", description: `Quotation ${code} has been rejected.` });
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">{user?.role === "Fleet Manager" ? "Request Quotation" : "Quotations"}</h1>
          <p className="page-description">Create and manage lease requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setReportModalOpen(true)}>
            <Save className="h-4 w-4" /> Save Custom Report
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'lease-requests.csv')}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
          {user?.isPortalUser && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5"><Plus className="h-4 w-4" />Request</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{user?.role === "Fleet Manager" ? "Request Quotation" : "Quotation"}</DialogTitle>
                </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type of Request</Label>
                    <Input value="OL" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={productType} onValueChange={(v) => {
                      setProductType(v);
                      setManufacturer('');
                      setProductName('');
                      setVariant('');
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it-asset">IT Asset</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dynamic Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-2">
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    <Select value={manufacturer} onValueChange={setManufacturer} required>
                      <SelectTrigger><SelectValue placeholder="Select Manufacturer" /></SelectTrigger>
                      <SelectContent>
                        {productType === "it-asset" ? (
                          <>
                            <SelectItem value="Apple">Apple</SelectItem>
                            <SelectItem value="Dell">Dell</SelectItem>
                            <SelectItem value="HP">HP</SelectItem>
                            <SelectItem value="Lenovo">Lenovo</SelectItem>
                            <SelectItem value="Asus">Asus</SelectItem>
                            <SelectItem value="Acer">Acer</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Toyota">Toyota</SelectItem>
                            <SelectItem value="Hyundai">Hyundai</SelectItem>
                            <SelectItem value="Tata">Tata Motors</SelectItem>
                            <SelectItem value="Mahindra">Mahindra</SelectItem>
                            <SelectItem value="Maruti">Maruti Suzuki</SelectItem>
                            <SelectItem value="Kia">Kia</SelectItem>
                            <SelectItem value="Honda">Honda</SelectItem>
                            <SelectItem value="Royal Enfield">Royal Enfield</SelectItem>
                            <SelectItem value="Bajaj">Bajaj Auto</SelectItem>
                            <SelectItem value="TVS">TVS</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Select value={productName} onValueChange={setProductName} required>
                      <SelectTrigger><SelectValue placeholder="Select Product Type" /></SelectTrigger>
                      <SelectContent>
                        {productType === "it-asset" ? (
                          <>
                            <SelectItem value="Laptop">Laptop</SelectItem>
                            <SelectItem value="Desktop">Desktop</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Passenger Car">Passenger Car</SelectItem>
                            <SelectItem value="Commercial Vehicle">Commercial Vehicle</SelectItem>
                            <SelectItem value="Two Wheeler - Bike">Two Wheeler - Bike</SelectItem>
                            <SelectItem value="Two Wheeler - Scooty">Two Wheeler - Scooty</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Variant</Label>
                    <Input value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="e.g., M1, XZA+" required />
                  </div>
                </div>

                {/* IT Asset Specific */}
                {productType === "it-asset" && (productName.toLowerCase().includes("laptop") || productName.toLowerCase().includes("desktop") || productName.toLowerCase().includes("mac") || productName.toLowerCase().includes("pc")) && (
                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg mt-2 border border-border/50">
                    <div className="space-y-2">
                      <Label>Storage</Label>
                      <Input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="e.g., 512GB SSD" required />
                    </div>
                    <div className="space-y-2">
                      <Label>RAM</Label>
                      <Input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g., 16GB" required />
                    </div>
                  </div>
                )}

                {/* Vehicle Specific */}
                {productType === "vehicle" && (
                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg mt-2 border border-border/50">
                    <div className="space-y-2">
                      <Label>Fuel Type</Label>
                      <Select value={fuelType} onValueChange={setFuelType} required>
                        <SelectTrigger><SelectValue placeholder="Select Fuel" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="cng">CNG</SelectItem>
                          <SelectItem value="ev">EV</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Transmission</Label>
                      <Select value={transmission} onValueChange={setTransmission} required>
                        <SelectTrigger><SelectValue placeholder="Select Transmission" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sub Category</Label>
                      <Select value={subCategory} onValueChange={setSubCategory} required>
                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Colour</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="p-1 h-9 w-12 cursor-pointer" value={vehicleColour || '#ffffff'} onChange={(e) => setVehicleColour(e.target.value)} />
                        <Input placeholder="Colour Name" value={vehicleColour} onChange={(e) => setVehicleColour(e.target.value)} required />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="outline">Save as Draft</Button>
                  <Button type="submit">Submit Quotation</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <MultiSelect
          placeholder="Status"
          className="w-[160px]"
          selected={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Pending", value: "Pending" },
            { label: "Approved", value: "Approved" },
            { label: "Rejected", value: "Rejected" },
            { label: "Expired", value: "Expired" },
          ]}
        />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quote Code</th>
              <th>Enquiry</th>
              {user?.isAdmin && <th>Customer</th>}
              <th>Tenure</th>
              <th>Asset Cost</th>
              <th>Monthly Rental</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id}>
                <td className="font-medium text-primary cursor-pointer hover:underline">{q.quotationCode}</td>
                <td>{q.enquiryCode}</td>
                {user?.isAdmin && <td>{q.customerName}</td>}
                <td>{q.leaseTenure} mo</td>
                <td>{formatCurrency(q.assetCost)}</td>
                <td>{formatCurrency(q.monthlyRental)}</td>
                <td>{formatCurrency(q.totalLeaseValue)}</td>
                <td>
                  <span className={`status-badge ${q.status === 'Approved' ? 'status-active' : q.status === 'Pending' ? 'status-pending' : q.status === 'Rejected' ? 'status-overdue' : 'status-closed'}`}>
                    {q.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{q.createdAt}</td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/quotes/${q.id}`)}>
                        <FileText className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      {user?.isAdmin && q.status === 'Pending' && (
                        <>
                          <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50" onClick={() => handleApprove(q.quotationCode)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Request
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={() => handleReject(q.quotationCode)}>
                            <XCircle className="h-4 w-4 mr-2" /> Reject Request
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" /> Export Quote
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SaveReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} moduleName="Lease Requests" activeFilters={{ search, status: statusFilter.join(',') }} />
    </AppLayout>
  );
};

export default Quotes;
