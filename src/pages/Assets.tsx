import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Monitor, Search, User, Download, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFilter } from "@/contexts/FilterContext";
import { SaveReportModal } from "@/components/SaveReportModal";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function downloadCSV(data: any[], filename: string) {
  const headers = ['Asset ID', 'Type', 'Description', 'Client', 'Location', 'Assigned To', 'Status', 'Lease End'];
  const rows = data.map(a => [
    a.assetTag, a.type, a.description, a.clientName, a.location, a.assignedTo, a.status, a.leaseEndDate
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

const Assets = () => {
  const { assets } = useAppData();
  const { clientFilter, costCenterFilter, locationFilter } = useFilter();
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { user } = useAuth();

  const filtered = assets.filter((a) => {
    if (typeFilter.length > 0 && !typeFilter.includes(a.type)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(a.status)) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase()) && !a.assetTag.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Asset Management</h1>
          <p className="page-description">Manage vehicles and IT assets across all clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setReportModalOpen(true)}>
            <Save className="h-4 w-4" /> Save Custom Report
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'assets.csv')}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
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
        <MultiSelect
          placeholder="Type"
          className="w-[140px]"
          selected={typeFilter}
          onChange={setTypeFilter}
          options={[
            { label: "Vehicle", value: "Vehicle" },
            { label: "IT Asset", value: "IT" },
          ]}
        />
        <MultiSelect
          placeholder="Status"
          className="w-[175px]"
          selected={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Active", value: "Active" },
            { label: "Under Maintenance", value: "Under Maintenance" },
            { label: "In Transit", value: "In Transit" },
            { label: "Disposed", value: "Disposed" },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Type</th>
              <th>Description</th>
              {user?.isAdmin && <th>Client</th>}
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
                {user?.isAdmin && <td className="text-muted-foreground">{a.clientName}</td>}
                <td>{a.location}</td>
                <td>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="text-primary hover:underline font-medium text-left">
                        {a.assignedTo}
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold flex items-center gap-1.5"><User className="h-4 w-4" /> {a.assignedTo}</h4>
                          <p className="text-sm text-muted-foreground">
                            {a.type === 'Vehicle' ? 'Assigned Driver / POC' : 'Asset Assigned User'}
                          </p>
                          <div className="flex items-center pt-2">
                            <span className="text-xs text-muted-foreground">
                              {a.type === 'Vehicle' ? (
                                <>Driver: {a.driver || a.assignedTo} <br /> Registration: {a.registrationNo}</>
                              ) : (
                                <>Category: {a.category} <br /> Serial: {a.serialNo}</>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </td>
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
      <SaveReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} moduleName="Assets" activeFilters={{ search, type: typeFilter.join(','), status: statusFilter.join(','), client: clientFilter.join(','), costCenter: costCenterFilter.join(','), location: locationFilter.join(',') }} />
    </AppLayout>
  );
};

export default Assets;
