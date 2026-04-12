import { AppLayout } from "@/components/AppLayout";
import { assets } from "@/data/sampleData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Car, Search, Gauge, Shield } from "lucide-react";

const vehicles = assets.filter(a => a.type === 'Vehicle');

const VehicleFleet = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = vehicles.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase()) && !a.assetTag.toLowerCase().includes(search.toLowerCase()) && !a.registrationNo?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Vehicle Fleet Management</h1>
        <p className="page-description">Manage vehicle registrations, drivers, insurance, and lease details</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Vehicles</p>
            <p className="text-xl font-bold font-heading">{vehicles.length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-success mr-1" />
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-bold font-heading">{vehicles.filter(a => a.status === 'Active').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <Gauge className="h-5 w-5 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">In Maintenance</p>
            <p className="text-xl font-bold font-heading">{vehicles.filter(a => a.status === 'Under Maintenance').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <Shield className="h-5 w-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Insurance Due</p>
            <p className="text-xl font-bold font-heading">1</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Under Maintenance">Maintenance</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Disposed">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Registration No.</th>
              <th>Vehicle</th>
              <th>Client</th>
              <th>Driver</th>
              <th>Location</th>
              <th>Insurance Expiry</th>
              <th>Lease End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.assetTag}</td>
                <td>{a.registrationNo}</td>
                <td>{a.make} {a.model}</td>
                <td className="text-muted-foreground">{a.clientName}</td>
                <td>{a.driver}</td>
                <td>{a.location}</td>
                <td className="text-muted-foreground">{a.insuranceExpiry}</td>
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
          <p className="text-center py-8 text-muted-foreground text-sm">No vehicles found</p>
        )}
      </div>
    </AppLayout>
  );
};

export default VehicleFleet;
