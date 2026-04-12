import { AppLayout } from "@/components/AppLayout";
import { assets } from "@/data/sampleData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Car, Monitor, Search } from "lucide-react";

const Assets = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = assets.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase()) && !a.assetTag.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Asset Management</h1>
        <p className="page-description">Manage vehicles and IT assets across all clients</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vehicles</p>
            <p className="text-xl font-bold font-heading">{assets.filter(a => a.type === 'Vehicle').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">IT Assets</p>
            <p className="text-xl font-bold font-heading">{assets.filter(a => a.type === 'IT').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-success mr-1" />
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-bold font-heading">{assets.filter(a => a.status === 'Active').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-warning mr-1" />
          <div>
            <p className="text-xs text-muted-foreground">Maintenance</p>
            <p className="text-xl font-bold font-heading">{assets.filter(a => a.status === 'Under Maintenance').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Vehicle">Vehicle</SelectItem>
            <SelectItem value="IT">IT Asset</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Disposed">Disposed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Type</th>
              <th>Description</th>
              <th>Client</th>
              <th>Location</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Lease End</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.assetTag}</td>
                <td>
                  <span className="inline-flex items-center gap-1.5">
                    {a.type === 'Vehicle' ? <Car className="h-3.5 w-3.5 text-primary" /> : <Monitor className="h-3.5 w-3.5 text-accent" />}
                    {a.type}
                  </span>
                </td>
                <td>{a.description}</td>
                <td className="text-muted-foreground">{a.clientName}</td>
                <td>{a.location}</td>
                <td>{a.assignedTo}</td>
                <td>
                  <span className={`status-badge ${a.status === 'Active' ? 'status-active' : a.status === 'Under Maintenance' ? 'status-pending' : 'status-closed'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{a.leaseEndDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">No assets found matching filters</p>
        )}
      </div>
    </AppLayout>
  );
};

export default Assets;
