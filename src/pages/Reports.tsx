import { AppLayout } from "@/components/AppLayout";
import { useReports, ReportFrequency } from "@/contexts/ReportContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Mail, Play, Pause, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TablePagination, usePagination } from "@/components/TablePagination";

export default function Reports() {
  const { reports, toggleStatus, deleteReport, scheduleReport } = useReports();
  const { user } = useAuth();
  const { toast } = useToast();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toEmail, setToEmail] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [freq, setFreq] = useState<ReportFrequency>("weekly");

  const myReports = reports.filter(r => r.createdBy === user?.id);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems,
    totalItems,
    startIndex,
    endIndex,
  } = usePagination(myReports, 5);

  const handleDownload = (r: any) => {
    toast({ title: "Report Generating...", description: `Downloading ${r.name}` });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !toEmail) return;
    const finalEmail = ccEmail ? `${toEmail},${ccEmail}` : toEmail;
    scheduleReport(selectedId, freq, finalEmail);
    toast({ title: "Schedule Deployed", description: `Report will be run ${freq} to ${toEmail}${ccEmail ? ` and CC'd to ${ccEmail}` : ''}.` });
    setScheduleModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="page-header mb-6">
        <h1 className="page-title">Custom Reports</h1>
        <p className="page-description">Manage and schedule your saved data snapshots</p>
      </div>
      
      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Module</th>
              <th>Filters Summarized</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">No custom reports saved yet. Browse to any Module to save a view.</td>
              </tr>
            ) : paginatedItems.map(r => (
              <tr key={r.id}>
                <td className="font-medium">
                  {r.name}
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                </td>
                <td>{r.module}</td>
                <td>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {Object.entries(r.filters).map(([k,v]) => (
                      <span key={k} className="text-[10px] bg-muted px-1.5 py-0.5 rounded border capitalize">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-muted-foreground whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <span className={`status-badge ${r.status === 'Active' ? 'status-active' : 'status-closed'}`}>
                    {r.status}
                  </span>
                  {r.scheduleFrequency && r.scheduleFrequency !== 'none' && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Runs {r.scheduleFrequency}
                    </p>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={r.status === 'Active' ? 'Pause' : 'Resume'} onClick={() => toggleStatus(r.id)}>
                      {r.status === 'Active' ? <Pause className="h-3.5 w-3.5 text-warning" /> : <Play className="h-3.5 w-3.5 text-success" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Schedule Email" onClick={() => { 
                      setSelectedId(r.id); 
                      const storedEmails = r.scheduledEmail?.split(',') || [];
                      setToEmail(storedEmails[0] || user?.email || ""); 
                      setCcEmail(storedEmails.slice(1).join(',') || "");
                      setFreq(r.scheduleFrequency || "weekly"); 
                      setScheduleModalOpen(true); 
                    }}>
                      <Mail className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Run Now" onClick={() => handleDownload(r)}>
                      <Download className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/10" title="Delete" onClick={() => deleteReport(r.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Email Schedule Trigger</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>To <span className="text-destructive">*</span></Label>
              <Input type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} required placeholder="finance@company.com" />
            </div>
            <div className="space-y-2">
              <Label>CC Email (Optional)</Label>
              <Input type="text" value={ccEmail} onChange={e => setCcEmail(e.target.value)} placeholder="manager@company.com, team@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={freq} onValueChange={(v: any) => setFreq(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="none">None (Pause Schedule)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!toEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)}>Deploy Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
