import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { CheckCircle2, Clock, X, Plus, Filter, ChevronDown, ChevronUp, FileText, Upload, AlertCircle, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TablePagination, usePagination } from "@/components/TablePagination";
import { useServiceRequest } from "@/contexts/ServiceRequestContext";
import { useToast } from "@/hooks/use-toast";

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
  const { categories, requestTypes } = useServiceRequest();
  const { toast } = useToast();
  
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  
  // Form State
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File | null>>({});

  const currentType = useMemo(() => 
    requestTypes.find(t => t.id === selectedTypeId),
  [selectedTypeId, requestTypes]);

  const filtered = mockRequests.filter(r =>
    (typeFilter === "all" || r.id === typeFilter) &&
    (statusFilter === "all" || r.status === statusFilter)
  );

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

  const handleFileChange = (docId: string, file: File | null) => {
    setUploadedDocs(prev => ({ ...prev, [docId]: file }));
  };

  const isSubmitDisabled = useMemo(() => {
    if (!selectedTypeId || !subject) return true;
    if (!currentType) return false;
    
    // Check if all mandatory documents are uploaded
    const mandatoryDocs = currentType.documentChecklist.filter(d => d.isMandatory);
    return mandatoryDocs.some(d => !uploadedDocs[d.id]);
  }, [selectedTypeId, subject, currentType, uploadedDocs]);

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    setNewOpen(false);
    setSelectedCatId("");
    setSelectedTypeId("");
    setSubject("");
    setDesc("");
    setUploadedDocs({});
    toast({ title: "Request Submitted", description: "Your service request has been raised successfully." });
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

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b flex-wrap gap-2">
          <h2 className="font-heading font-semibold text-sm">My Requests</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {requestTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
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
          {paginatedItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No requests found.</div>
          )}
          {paginatedItems.map(req => (
            <div key={req.id}>
              <div
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setExpanded(expanded === req.id ? null : req.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{req.id}</span>
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

      {/* New Request Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">New Service Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select value={selectedCatId} onValueChange={(val) => { setSelectedCatId(val); setSelectedTypeId(""); }}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Request Type</Label>
                <Select value={selectedTypeId} onValueChange={setSelectedTypeId} disabled={!selectedCatId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder={selectedCatId ? "Select Type" : "Select category first"} /></SelectTrigger>
                  <SelectContent>
                    {selectedCatId && requestTypes.filter(t => t.categoryId === selectedCatId).map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
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

            {/* Document Checklist Section */}
            {selectedTypeId && currentType && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-dashed border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Required Documents
                  </h3>
                  <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border italic">
                    Supported: PDF, JPG, PNG (Max 5MB)
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {currentType.documentChecklist.map(doc => (
                    <div key={doc.id} className="flex flex-col gap-2 p-3 bg-background rounded-lg border shadow-sm group hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-1.5">
                          {doc.name}
                          {doc.isMandatory && <span className="text-rose-500 font-bold">*</span>}
                        </Label>
                        {uploadedDocs[doc.id] ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase">
                            <Check className="h-3 w-3" /> Uploaded
                          </div>
                        ) : doc.isMandatory ? (
                          <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase">
                            <AlertCircle className="h-3 w-3" /> Mandatory
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[10px] font-bold uppercase">Optional</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 group">
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full" 
                            onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                          />
                          <div className={`flex items-center gap-2 px-3 h-9 rounded-md border text-xs transition-colors ${uploadedDocs[doc.id] ? "bg-emerald-50/50 border-emerald-200" : "bg-muted/30 group-hover:bg-muted"}`}>
                            <Upload className={`h-3.5 w-3.5 ${uploadedDocs[doc.id] ? "text-emerald-600" : "text-muted-foreground"}`} />
                            <span className={`truncate flex-1 ${uploadedDocs[doc.id] ? "text-emerald-700 font-medium" : "text-muted-foreground"}`}>
                              {uploadedDocs[doc.id] ? (uploadedDocs[doc.id] as File).name : "Click to browse..."}
                            </span>
                          </div>
                        </div>
                        {uploadedDocs[doc.id] && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => handleFileChange(doc.id, null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {currentType.documentChecklist.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2 italic">No documents required for this request type.</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="req-desc" className="text-xs">Details</Label>
              <textarea id="req-desc" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Provide additional details..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button onClick={() => setNewOpen(false)} className="flex-1 h-10 rounded-lg border hover:bg-muted text-sm font-medium transition-colors">Cancel</button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitDisabled}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Submit Request
              </button>
            </div>
            {isSubmitDisabled && selectedTypeId && (
              <p className="text-[10px] text-rose-500 text-center font-medium">Please upload all mandatory documents to proceed.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
