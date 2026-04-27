import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Monitor, Search, Cpu, HardDrive, Download, Save, MoreHorizontal, CalendarClock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SaveReportModal } from "@/components/SaveReportModal";
import { useFilter } from "@/contexts/FilterContext";
import { TablePagination, usePagination } from "@/components/TablePagination";

function downloadCSV(data: any[], filename: string) {
  const headers = ['Asset ID', 'Serial No', 'Description', 'Category', 'Client', 'Assigned To', 'Condition', 'Lease Status', 'Location', 'Cost Center', 'Lease Expiry'];
  const rows = data.map(a => [
    a.assetTag, a.serialNo || '', a.description, a.category || '', a.clientName, a.assignedTo, a.condition || '', a.leaseStatus, a.location, a.costCenter, a.leaseEndDate
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

const ITAssets = () => {
  const { assets } = useAppData();
  const { clientFilter, costCenterFilter, locationFilter } = useFilter();
  const itAssets = assets.filter(a => a.type === 'IT Equipment');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const filtered = itAssets.filter((a) => {
    if (categoryFilter.length > 0 && !categoryFilter.includes(a.category || '')) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase()) && !a.assetTag.toLowerCase().includes(search.toLowerCase())) return false;
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
          <h1 className="page-title">IT Equipment Management</h1>
          <p className="page-description">Track hardware and software assets, allocation, and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => setReportModalOpen(true)}>
            <Save className="h-4 w-4" /> Save Custom Report
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'it-assets.csv')}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total IT Equipment</p>
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
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Other</p>
            <p className="text-xl font-bold font-heading">{itAssets.filter(a => a.category !== 'Laptop' && a.category !== 'Desktop').length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search IT equipment..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <MultiSelect
          placeholder="Category"
          className="w-[150px]"
          selected={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { label: "Laptop", value: "Laptop" },
            { label: "Desktop", value: "Desktop" },
            { label: "Other", value: "Other" },
          ]}
        />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Serial No.</th>
              <th>Description</th>
              <th>Category</th>
              <th>Client</th>
              <th>Assigned To</th>
              <th>Condition</th>
              <th>Lease Status</th>
              <th>Location</th>
              <th>Cost Center</th>
              <th>Lease Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((a) => (
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
                <td>
                  <span className={`status-badge ${a.leaseStatus === 'Disbursed' ? 'status-active' : 'status-overdue'}`}>
                    {a.leaseStatus}
                  </span>
                </td>
                <td>{a.location}</td>
                <td className="text-muted-foreground">{a.costCenter}</td>
                <td className="text-muted-foreground">{a.leaseEndDate}</td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <CalendarClock className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">No IT equipment found</p>
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
      <SaveReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} moduleName="IT Assets" activeFilters={{ search, category: categoryFilter.join(','), client: clientFilter.join(','), costCenter: costCenterFilter.join(','), location: locationFilter.join(',') }} />
    </AppLayout>
  );
};

export default ITAssets;
