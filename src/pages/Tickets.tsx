import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Star, Download, SmilePlus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFilter } from "@/contexts/FilterContext";
import { SaveReportModal } from "@/components/SaveReportModal";

function downloadCSV(data: any[], filename: string) {
  const headers = ['Ticket No', 'Category', 'Subject', 'Client', 'Priority', 'Status', 'Created', 'SLA Deadline', 'Assigned To', 'Cost Center', 'Location', 'Rating', 'CSAT'];
  const rows = data.map(t => [
    t.ticketNo, t.category, t.subject, t.clientName, t.priority, t.status, t.createdAt, t.slaDeadline, t.assignedTo, t.costCenter, t.location, t.rating || '', t.csatScore || ''
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

const TICKET_CATEGORIES: Record<string, string[]> = {
  "Vehicle": [
    "Service / Maintenance",
    "Accident Reporting",
    "Replacement Request",
    "General Vehicle Query"
  ],
  "IT Equipment": [
    "Hardware Issue",
    "Software Issue",
    "Replacement Request",
    "Upgrade Request",
    "General IT Query"
  ]
};

const Tickets = () => {
  const { tickets } = useAppData();
  const { clientFilter, costCenterFilter, locationFilter } = useFilter();
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState<string>("");
  const [ticketType, setTicketType] = useState<string>("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("Open");
  const [remarkText, setRemarkText] = useState("");
  const [, setRefresh] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const isIndividual = !!user?.isIndividual;

  const filtered = tickets.filter((t) => {
    // Individual users only see their own asset's tickets
    if (isIndividual) {
      const myAssets = ['VH-001', 'IT-005'];
      const isMyTicket = myAssets.some(tag => t.subject.includes(tag)) || t.clientId === 'c1';
      if (!isMyTicket) return false;
    }
    if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false;
    if (categoryFilter.length > 0 && !categoryFilter.includes(t.category)) return false;
    if (priorityFilter.length > 0 && !priorityFilter.includes(t.priority)) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.ticketNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const closedTickets = tickets.filter(t => t.status === 'Closed' && t.rating);
  const avgRating = closedTickets.length > 0 ? (closedTickets.reduce((s, t) => s + (t.rating || 0), 0) / closedTickets.length).toFixed(1) : '—';
  const avgCSAT = closedTickets.length > 0 ? Math.round(closedTickets.reduce((s, t) => s + (t.csatScore || 0), 0) / closedTickets.length) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: "Validation Error", description: "Description is mandatory.", variant: "destructive" });
      return;
    }
    setDialogOpen(false);
    toast({ title: "Ticket Created", description: "Your service request has been submitted successfully." });
    setDescription("");
  };

  const openUpdateDialog = (t: any) => {
    setSelectedTicket(t);
    setNewStatus(t.status);
    setRemarkText("");
    setUpdateDialogOpen(true);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket) {
      selectedTicket.status = newStatus;
      toast({ title: "Ticket Updated", description: `Status changed to ${newStatus}. Remark added successfully.` });
      setRefresh(r => r + 1);
    }
    setUpdateDialogOpen(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Service Requests</h1>
          <p className="page-description">Create and track service tickets with SLA tracking</p>
        </div>
        <div className="flex gap-2">
          {!isIndividual && (
            <>
              <Button variant="outline" className="gap-1.5" onClick={() => setReportModalOpen(true)}>
                <Save className="h-4 w-4" /> Save Custom Report
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'service-requests.csv')}>
                <Download className="h-4 w-4" /> Download CSV
              </Button>
            </>
          )}
          {(user?.isPortalUser || isIndividual) && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5"><Plus className="h-4 w-4" /> Create Ticket</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Service Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={ticketCategory} onValueChange={(val) => {
                        setTicketCategory(val);
                        setTicketType("");
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vehicle">Vehicle</SelectItem>
                          {!isIndividual && <SelectItem value="IT Equipment">IT Equipment</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Request Type</Label>
                      <Select
                        value={ticketType}
                        onValueChange={setTicketType}
                        disabled={!ticketCategory}
                      >
                        <SelectTrigger><SelectValue placeholder={ticketCategory ? "Select Type" : "Select Category first"} /></SelectTrigger>
                        <SelectContent>
                          {ticketCategory && TICKET_CATEGORIES[ticketCategory]?.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Asset ID / Lease ID {isIndividual ? '' : '(Optional)'}</Label>
                      <Input
                        placeholder="e.g. VH-001 or OL-2024-001"
                        defaultValue={isIndividual ? 'VH-001' : ''}
                        readOnly={isIndividual}
                        className={isIndividual ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select defaultValue="Medium">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="Brief description of the issue" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description <span className="text-destructive">*</span></Label>
                    <Textarea placeholder="Provide detailed information..." rows={4} required value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Submit Ticket</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* CSAT KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Total Tickets</p>
          <p className="text-2xl font-bold font-heading">{tickets.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-muted-foreground">Open / In Progress</p>
          <p className="text-2xl font-bold font-heading text-warning">{tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}</p>
        </div>
        {user?.isAdmin && (
          <>
            <div className="kpi-card flex items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold font-heading">{avgRating}</p>
                <div className="mt-1">{closedTickets.length > 0 && renderStars(Math.round(parseFloat(avgRating as string)))}</div>
              </div>
              <Star className="h-6 w-6 text-warning fill-warning shrink-0" />
            </div>
            <div className="kpi-card flex items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground">CSAT Score</p>
                <p className="text-2xl font-bold font-heading text-success">{avgCSAT}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">from {closedTickets.length} closed tickets</p>
              </div>
              <SmilePlus className="h-6 w-6 text-success shrink-0" />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <MultiSelect
          placeholder="Status"
          className="w-[150px]"
          selected={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Open", value: "Open" },
            { label: "In Progress", value: "In Progress" },
            { label: "Resolved", value: "Resolved" },
            { label: "Closed", value: "Closed" },
          ]}
        />
        <MultiSelect
          placeholder="Category"
          className="w-[150px]"
          selected={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { label: "Vehicle", value: "Vehicle" },
            { label: "IT", value: "IT" },
            { label: "Lease", value: "Lease" },
          ]}
        />
        <MultiSelect
          placeholder="Priority"
          className="w-[140px]"
          selected={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { label: "High", value: "High" },
            { label: "Medium", value: "Medium" },
            { label: "Low", value: "Low" },
          ]}
        />
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket No.</th>
              <th>Category</th>
              <th>Subject</th>
              {user?.isAdmin && <th>Client</th>}
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>SLA Deadline</th>
              <th>Assigned To</th>
              {user?.isAdmin && <th>Rating</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="font-medium">
                  {user?.isAdmin ? (
                    <button
                      onClick={() => openUpdateDialog(t)}
                      className="text-primary hover:underline inline-flex items-center gap-1 font-medium bg-transparent border-none p-0 cursor-pointer"
                    >
                      {t.ticketNo}
                    </button>
                  ) : (
                    t.ticketNo
                  )}
                </td>
                <td>{t.category}</td>
                <td>{t.subject}</td>
                {user?.isAdmin && <td className="text-muted-foreground">{t.clientName}</td>}
                <td>
                  <span className={`status-badge ${t.priority === 'Critical' ? 'status-overdue' : t.priority === 'High' ? 'status-pending' : t.priority === 'Medium' ? 'status-active' : 'status-closed'}`}>
                    {t.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${t.status === 'Open' ? 'status-pending' : t.status === 'In Progress' ? 'status-active' : t.status === 'Resolved' ? 'status-active' : 'status-closed'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{t.createdAt}</td>
                <td className="text-muted-foreground">{t.slaDeadline}</td>
                <td>{t.assignedTo}</td>
                {user?.isAdmin && (
                  <td>
                    {t.status === 'Closed' && t.rating ? (
                      <div className="flex flex-col gap-0.5">
                        {renderStars(t.rating)}
                        {t.csatScore !== undefined && (
                          <span className="text-[10px] text-muted-foreground">CSAT {t.csatScore}%</span>
                        )}
                      </div>
                    ) : t.status === 'Closed' ? (
                      <span className="text-xs text-muted-foreground">No rating</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStatus} className="space-y-4 mt-2">
            <div className="text-sm space-y-1 mb-2">
              <p><span className="text-muted-foreground mr-2">Ticket:</span>{selectedTicket?.ticketNo}</p>
              <p><span className="text-muted-foreground mr-2">Client:</span>{selectedTicket?.clientName}</p>
              <p><span className="text-muted-foreground mr-2">Subject:</span>{selectedTicket?.subject}</p>
            </div>
            <div className="space-y-2">
              <Label>Update Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Add Remark</Label>
              <Textarea 
                placeholder="Enter progress remarks or resolution details..." 
                rows={3} 
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <SaveReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} moduleName="Service Requests" activeFilters={{ search, status: statusFilter.join(','), category: categoryFilter.join(','), priority: priorityFilter.join(','), client: clientFilter.join(','), costCenter: costCenterFilter.join(','), location: locationFilter.join(',') }} />
    </AppLayout>
  );
};

export default Tickets;
