import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { locations, costCenters } from "@/data/sampleData";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Search, Download, Save } from "lucide-react";
import { SaveReportModal } from "@/components/SaveReportModal";
import { useFilter } from "@/contexts/FilterContext";
import { TablePagination, usePagination } from "@/components/TablePagination";

function downloadCSV(data: any[], filename: string) {
  const headers = ['Asset ID', 'Category', 'Registration No', 'Vehicle', 'Client', 'Assigned To', 'Lease Status', 'Location', 'Cost Center', 'Insurance Expiry', 'Lease End'];
  const rows = data.map(a => [
    a.assetTag, a.category || 'Passenger Car', a.registrationNo || '', `${a.make} ${a.model}`, a.clientName, a.driver || a.assignedTo || '', a.leaseStatus, a.location, a.costCenter, a.insuranceExpiry || '', a.leaseEndDate
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

const VehicleFleet = () => {
  const { user } = useAuth();
  const { assets, clients } = useAppData();
  const { clientFilter, setClientFilter, locationFilter, setLocationFilter, leaseStatusFilter, setLeaseStatusFilter, costCenterFilter, setCostCenterFilter } = useFilter();
  const vehicles = assets.filter(a => a.type === 'Vehicle');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const filtered = vehicles.filter((a) => {
    if (categoryFilter.length > 0 && !categoryFilter.includes(a.category || '')) return false;
    if (clientFilter.length > 0 && !clientFilter.includes(a.clientId || '')) return false;
    if (locationFilter.length > 0 && !locationFilter.includes(a.location || '')) return false;
    if (costCenterFilter.length > 0 && !costCenterFilter.includes(a.costCenter || '')) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase()) && !a.assetTag.toLowerCase().includes(search.toLowerCase()) && !a.registrationNo?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(filtered, 5);

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Vehicle Fleet</h1>
          <p className="page-description">Manage and monitor your leased vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setReportModalOpen(true)}>
            <Save className="h-4 w-4" /> Save Custom Report
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'vehicles.csv')}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Passenger Car</p>
            <p className="text-xl font-bold font-heading">{vehicles.filter(a => a.category === 'Passenger Car').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Commercial Vehicle</p>
            <p className="text-xl font-bold font-heading">{vehicles.filter(a => a.category === 'Commercial Vehicle').length}</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-[hsl(var(--success))]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EPP</p>
            <p className="text-xl font-bold font-heading">{vehicles.filter(a => a.category === 'EPP').length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        {user?.isAdmin && (
          <MultiSelect
            placeholder="All Clients"
            className="w-[160px]"
            selected={clientFilter}
            onChange={setClientFilter}
            options={clients.map(c => ({ label: c.name, value: c.id }))}
          />
        )}
        <MultiSelect placeholder="Locations" className="w-[140px]" selected={locationFilter} onChange={setLocationFilter} options={locations.map(l => ({ label: l, value: l }))} />
        <MultiSelect
          placeholder="Lease Status"
          className="w-[155px]"
          selected={leaseStatusFilter}
          onChange={setLeaseStatusFilter}
          options={[
            { label: "Disbursed", value: "Disbursed" },
            { label: "Foreclosed", value: "Foreclosed" },
          ]}
        />
        <MultiSelect placeholder="Cost Center" className="w-[140px]" selected={costCenterFilter} onChange={setCostCenterFilter} options={costCenters.map(cc => ({ label: cc, value: cc }))} />
        <MultiSelect
          placeholder="Category"
          className="w-[175px]"
          selected={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { label: "Passenger Car", value: "Passenger Car" },
            { label: "Commercial Vehicle", value: "Commercial Vehicle" },
            { label: "EPP", value: "EPP" },
          ]}
        />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Category</th>
              <th>Registration No.</th>
              <th>Vehicle</th>
              <th>Client</th>
              <th>Assigned To</th>
              <th>Lease Status</th>
              <th>Location</th>
              <th>Cost Center</th>
              <th>Insurance Expiry</th>
              <th>Lease End</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.assetTag}</td>
                <td>{a.category || 'Passenger Car'}</td>
                <td>{a.registrationNo}</td>
                <td>{a.make} {a.model}</td>
                <td className="text-muted-foreground">{a.clientName}</td>
                <td>{a.driver || a.assignedTo || '—'}</td>
                <td>
                  <span className={`status-badge ${a.leaseStatus === 'Disbursed' ? 'status-active' : 'status-overdue'}`}>
                    {a.leaseStatus}
                  </span>
                </td>
                <td>{a.location}</td>
                <td className="text-muted-foreground">{a.costCenter}</td>
                <td className="text-muted-foreground">{a.insuranceExpiry}</td>
                <td className="text-muted-foreground">{a.leaseEndDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">No vehicles found</p>
        )}
        <TablePagination
          totalItems={totalItems}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>
      <SaveReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} moduleName="Vehicle Fleet" activeFilters={{ search, category: categoryFilter.join(','), client: clientFilter.join(','), costCenter: costCenterFilter.join(','), location: locationFilter.join(',') }} />
    </AppLayout>
  );
};

export default VehicleFleet;
