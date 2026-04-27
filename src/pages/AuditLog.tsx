import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TablePagination, usePagination } from "@/components/TablePagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Search, Download, ShieldAlert, ArrowLeft, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const AuditLog = () => {
  const { auditLogs } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // RBAC Check
  const isITAdmin = user?.role === "IT Admin (ORIX)";

  // Filter State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [actionFilter, setActionFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  if (!isITAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">403 – Forbidden</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            You do not have the necessary permissions to access the Audit Logs. 
            This area is restricted to System Administrators only.
          </p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Get unique values for filters
  const uniqueRoles = Array.from(new Set(auditLogs.map(l => l.userRole)));
  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));
  const uniqueStatuses = Array.from(new Set(auditLogs.map(l => l.status)));

  // Filter Logic
  const filtered = auditLogs.filter(log => {
    if (search && !log.userName.toLowerCase().includes(search.toLowerCase()) && !log.recordAffected.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter.length > 0 && !roleFilter.includes(log.userRole)) return false;
    if (actionFilter.length > 0 && !actionFilter.includes(log.action)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(log.status)) return false;
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

  const downloadCSV = () => {
    const headers = ['Timestamp (UTC)', 'User', 'Role', 'Action', 'Module', 'Record Affected', 'IP Address', 'Status'];
    const rows = filtered.map(l => [
      l.timestamp, l.userName, l.userRole, l.action, l.module, l.recordAffected, l.ipAddress, l.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Audit Log</h1>
            <p className="text-sm text-muted-foreground">Monitor system activities and security events</p>
          </div>
          <Button variant="outline" className="gap-2 self-start" onClick={downloadCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search user or record..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <MultiSelect
              options={uniqueRoles.map(r => ({ label: r, value: r }))}
              selected={roleFilter}
              onChange={setRoleFilter}
              placeholder="Filter by Role"
            />
            <MultiSelect
              options={uniqueActions.map(a => ({ label: a, value: a }))}
              selected={actionFilter}
              onChange={setActionFilter}
              placeholder="Filter by Action"
            />
            <MultiSelect
              options={uniqueStatuses.map(s => ({ label: s, value: s }))}
              selected={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by Status"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Timestamp (UTC)</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Module</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Record Affected</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedItems.length > 0 ? paginatedItems.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs whitespace-nowrap font-mono text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{log.userName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{log.userRole}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] font-semibold bg-primary/5">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{log.module}</td>
                    <td className="px-4 py-3 text-sm font-medium">{log.recordAffected}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.ipAddress}</td>
                    <td className="px-4 py-3">
                      <Badge 
                        className={`text-[10px] ${
                          log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                          log.status === 'Denied' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                          'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                        variant="outline"
                      >
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No audit logs found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
      </div>
    </AppLayout>
  );
};

export default AuditLog;
