import { AppLayout } from "@/components/AppLayout";
import { assets } from "@/data/sampleData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Monitor, Search, Cpu, HardDrive } from "lucide-react";

const itAssets = assets.filter(a => a.type === 'IT');

const ITAssets = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = itAssets.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase()) && !a.assetTag.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">IT Asset Management</h1>
        <p className="page-description">Track hardware and software assets, allocation, and compliance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total IT Assets</p>
            <p className="text-xl font-bold font-heading">{itAssets.length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <Cpu className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Laptops</p>
            <p className="text-xl font-bold font-heading">{itAssets.filter(a => a.category === 'Laptop').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Desktops</p>
            <p className="text-xl font-bold font-heading">{itAssets.filter(a => a.category === 'Desktop').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-success mr-1" />
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-bold font-heading">{itAssets.filter(a => a.status === 'Active').length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search IT assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Laptop">Laptop</SelectItem>
            <SelectItem value="Desktop">Desktop</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Under Maintenance">Maintenance</SelectItem>
            <SelectItem value="Disposed">Disposed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Serial No.</th>
              <th>Description</th>
              <th>Category</th>
              <th>Client</th>
              <th>Assigned To</th>
              <th>Condition</th>
              <th>Lease Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.assetTag}</td>
                <td>{a.serialNo}</td>
                <td>{a.description}</td>
                <td>{a.category}</td>
                <td className="text-muted-foreground">{a.clientName}</td>
                <td>{a.assignedTo}</td>
                <td>
                  <span className={`status-badge ${a.condition === 'Excellent' ? 'status-active' : a.condition === 'Good' ? 'status-active' : 'status-pending'}`}>
                    {a.condition}
                  </span>
                </td>
                <td className="text-muted-foreground">{a.leaseEndDate}</td>
                <td>
                  <span className={`status-badge ${a.status === 'Active' ? 'status-active' : a.status === 'Under Maintenance' ? 'status-pending' : 'status-closed'}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">No IT assets found</p>
        )}
      </div>
    </AppLayout>
  );
};

export default ITAssets;
