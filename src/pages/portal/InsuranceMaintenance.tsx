import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Plus, CheckCircle2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const requests = [
  { id: "INS-001", type: "Insurance",    vehicle: "Toyota Innova — KA-01-MN-7890", date: "01 Apr 2026", status: "In Progress", notes: "Renewal due May 2026" },
  { id: "MNT-002", type: "Maintenance",  vehicle: "Honda Amaze — MH-04-PQ-1234",   date: "20 Mar 2026", status: "Resolved",    notes: "Oil change completed" },
];

const statusColor: Record<string, string> = {
  Raised:       "bg-sky-50 text-sky-600 dark:bg-sky-900/20",
  "In Progress":"bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  Resolved:     "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
};

export default function InsuranceMaintenance() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reqType, setReqType] = useState<"Insurance" | "Maintenance">("Insurance");
  const [vehicle, setVehicle] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Insurance & Maintenance</h1>
            <p className="page-description">{user?.clientName} — Self-owned vehicle insurance and maintenance requests</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95"
          >
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-6 text-sm text-indigo-700 dark:text-indigo-300">
        This section is for your <strong>self-owned vehicles</strong> (non-leased). Raise insurance renewals or maintenance requests here and we will coordinate with our service partners.
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          { type: "Insurance" as const,    title: "Insurance Request",    desc: "Raise a request for insurance of your own vehicle. Our team will connect you with empanelled insurers.", color: "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700" },
          { type: "Maintenance" as const,  title: "Maintenance Request",  desc: "Request routine or breakdown maintenance for your self-owned vehicle through our service network.", color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" },
        ].map(t => (
          <button key={t.type} onClick={() => { setReqType(t.type); setOpen(true); }}
            className={`text-left rounded-xl border p-5 hover:shadow-md transition-all duration-200 ${t.color}`}>
            <p className="font-heading font-semibold text-sm">{t.title}</p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{t.desc}</p>
            <span className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Raise Request →</span>
          </button>
        ))}
      </div>

      {/* Request history */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-heading font-semibold text-sm">My Requests</h2>
        </div>
        <div className="divide-y">
          {requests.map(r => (
            <div key={r.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${r.type === "Insurance" ? "bg-sky-50 dark:bg-sky-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"}`}>
                  {r.status === "Resolved" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.type === "Insurance" ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"}`}>{r.type}</span>
                  </div>
                  <p className="text-sm font-medium mt-0.5">{r.vehicle}</p>
                  <p className="text-xs text-muted-foreground">{r.notes} · {r.date}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ml-4 shrink-0 ${statusColor[r.status]}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">New {reqType} Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex rounded-lg border overflow-hidden text-xs">
              {(["Insurance", "Maintenance"] as const).map(t => (
                <button key={t} onClick={() => setReqType(t)}
                  className={`flex-1 py-2 font-medium transition-colors ${reqType === t ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>{t}</button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vehicle Registration Number</Label>
              <Input placeholder="e.g. MH-01-AB-1234" value={vehicle} onChange={e => setVehicle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes / Description</Label>
              <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Details about the request…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setOpen(false)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => setOpen(false)} disabled={!vehicle} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">Submit</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
