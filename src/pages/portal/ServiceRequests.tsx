import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { CheckCircle2, Clock, X, Plus, Filter, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type RequestType = "Service" | "Foreclosure" | "Replacement" | "Accident" | "Query";

const REQUEST_TYPES: { type: RequestType; label: string; desc: string; color: string }[] = [
  { type: "Service",     label: "Service Request",       desc: "Routine service / maintenance",      color: "bg-sky-50 text-sky-600 dark:bg-sky-900/20" },
  { type: "Foreclosure", label: "Foreclosure Request",   desc: "Early lease termination",            color: "bg-rose-50 text-rose-600 dark:bg-rose-900/20" },
  { type: "Replacement", label: "Replacement Car",        desc: "Request a replacement vehicle",     color: "bg-violet-50 text-violet-600 dark:bg-violet-900/20" },
  { type: "Accident",    label: "Accident Reporting",     desc: "Report a vehicle accident",         color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20" },
  { type: "Query",       label: "General Query",          desc: "Any other query or communication",  color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" },
];

const statusColor: Record<string, string> = {
  Raised:     "bg-sky-50 text-sky-600 dark:bg-sky-900/20",
  "In Progress": "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  Resolved:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  Closed:     "bg-muted text-muted-foreground",
};

const mockRequests = [
  { id: "SR-4521", type: "Service",     subject: "Annual maintenance for MH-01-AB-1234", status: "In Progress", date: "10 Apr 2026", vehicle: "Honda City - MH-01-AB-1234" },
  { id: "SR-4398", type: "Query",       subject: "Clarification on April rental invoice", status: "Resolved",    date: "02 Apr 2026", vehicle: "—" },
  { id: "SR-4201", type: "Accident",    subject: "Minor accident — rear bumper damage",    status: "Closed",      date: "15 Mar 2026", vehicle: "Maruti Swift - MH-01-CD-5678" },
];

function fmtDate(d: string) { return d; }

export default function ServiceRequests() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");

  const filtered = mockRequests.filter(r =>
    (typeFilter === "all" || r.type === typeFilter) &&
    (statusFilter === "all" || r.status === statusFilter)
  );

  const handleSubmit = () => {
    if (!selectedType || !subject) return;
    setNewOpen(false);
    setSelectedType(null);
    setSubject("");
    setDesc("");
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Service Requests</h1>
            <p className="page-description">{user?.clientName} — Raise and track all your requests</p>
          </div>
          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95"
          >
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>
      </div>



      {/* Filters + list */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b flex-wrap gap-2">
          <h2 className="font-heading font-semibold text-sm">My Requests</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {REQUEST_TYPES.map(rt => <SelectItem key={rt.type} value={rt.type}>{rt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Raised">Raised</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="divide-y">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No requests found.</div>
          )}
          {filtered.map(req => (
            <div key={req.id}>
              <div
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setExpanded(expanded === req.id ? null : req.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{req.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${REQUEST_TYPES.find(r=>r.type===req.type)?.color}`}>{req.type}</span>
                    </div>
                    <p className="text-sm font-medium mt-0.5 leading-snug">{req.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.vehicle} · {fmtDate(req.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColor[req.status]}`}>{req.status}</span>
                  {expanded === req.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
              {expanded === req.id && (
                <div className="px-4 pb-4 bg-muted/10">
                  <div className="border rounded-lg p-4 text-xs space-y-2">
                    <p className="font-semibold text-sm">Request Timeline</p>
                    {[
                      { step: "Raised",      date: req.date,                done: true  },
                      { step: "In Review",   date: "12 Apr 2026",           done: req.status !== "Raised" },
                      { step: "In Progress", date: "13 Apr 2026",           done: req.status === "In Progress" || req.status === "Resolved" || req.status === "Closed" },
                      { step: "Resolved",    date: req.status === "Closed" || req.status === "Resolved" ? "14 Apr 2026" : "—", done: req.status === "Resolved" || req.status === "Closed" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-emerald-500" : "bg-muted border border-border"}`}>
                          {s.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.step}</span>
                        <span className="text-muted-foreground ml-auto">{s.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New Request Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">New Service Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select defaultValue="Vehicle">
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Request Type</Label>
                <Select defaultValue="Service Request">
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service Request">Service Request</SelectItem>
                    <SelectItem value="Closure Request">Closure Request</SelectItem>
                    <SelectItem value="Report Breakdown">Report Breakdown</SelectItem>
                    <SelectItem value="Report Stolen Item">Report Stolen Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Asset ID / Lease ID (Optional)</Label>
                <Input placeholder="e.g. VH-001" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-subject" className="text-xs">Subject</Label>
              <Input id="req-subject" placeholder="Brief description of your request" value={subject} onChange={e => setSubject(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-desc" className="text-xs">Details</Label>
              <textarea id="req-desc" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Provide additional details..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setNewOpen(false)} className="flex-1 h-10 rounded-lg border hover:bg-muted text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={!subject} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">Submit Request</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
