import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Upload, CreditCard, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const rvLeases = [
  { id: "LC-2789", asset: "Honda City — MH-01-AB-1234",   rvAmount: 285000, dueDate: "2026-12-31", paid: false  },
  { id: "LC-2791", asset: "Maruti Swift — MH-01-CD-5678",  rvAmount: 180000, dueDate: "2026-06-30", paid: false  },
];

export default function RVPayments() {
  const { user } = useAuth();
  const [payModal, setPayModal] = useState<typeof rvLeases[0] | null>(null);
  const [paidLeases, setPaidLeases] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  const handlePay = () => {
    if (payModal) setPaidLeases(p => [...p, payModal.id]);
    setPayModal(null);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Residual Value (RV) Payments</h1>
        <p className="page-description">{user?.clientName} — RV amounts, due dates, and payment management</p>
      </div>

      <div className="space-y-4 mb-6">
        {rvLeases.map(lease => {
          const isPaid = paidLeases.includes(lease.id);
          const days = daysUntil(lease.dueDate);
          const isUrgent = days <= 90 && !isPaid;

          return (
            <div key={lease.id} className={`bg-card border rounded-xl p-5 ${isUrgent ? "border-amber-300 dark:border-amber-700" : ""}`}>
              {isUrgent && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-4">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  RV payment due in <strong>{days} days</strong> — please arrange payment before {fmtDate(lease.dueDate)}.
                </div>
              )}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{lease.id}</span>
                  <p className="font-semibold text-sm mt-0.5 font-heading">{lease.asset}</p>
                </div>
                {isPaid ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                  </span>
                ) : (
                  <button
                    onClick={() => setPayModal(lease)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors active:scale-95"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> Pay RV Amount
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <div className="bg-muted/40 rounded-lg p-3 border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RV Amount</p>
                  <p className="text-lg font-bold font-heading mt-1">{fmt(lease.rvAmount)}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Due Date</p>
                  <p className={`text-sm font-bold font-heading mt-1 ${isUrgent ? "text-amber-600" : ""}`}>{fmtDate(lease.dueDate)}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Days Remaining</p>
                  <p className={`text-sm font-bold font-heading mt-1 ${isPaid ? "text-emerald-600" : isUrgent ? "text-amber-600" : ""}`}>
                    {isPaid ? "Completed" : `${days} days`}
                  </p>
                </div>
              </div>

              {/* Document upload */}
              {!isPaid && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Supporting Documents</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Upload Valuation Report
                      <input type="file" className="hidden" />
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Upload Ownership Proof
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      <Dialog open={!!payModal} onOpenChange={v => !v && setPayModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">Pay Residual Value</DialogTitle>
          </DialogHeader>
          {payModal && (
            <div className="space-y-4">
              <div className="bg-muted/40 rounded-lg p-4 border text-sm space-y-1">
                <p className="font-semibold">{payModal.asset}</p>
                <p className="text-muted-foreground">RV Amount: <strong className="text-foreground">{fmt(payModal.rvAmount)}</strong></p>
                <p className="text-muted-foreground">Due: <strong className="text-foreground">{fmtDate(payModal.dueDate)}</strong></p>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select Payment Method</Label>
                <div className="grid grid-cols-1 gap-2">
                  <button className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-white flex items-center justify-center border shadow-sm">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Debit / Credit Card</p>
                        <p className="text-[10px] text-muted-foreground">Powered by Razorpay</p>
                      </div>
                    </div>
                    <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  </button>

                  <button className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-white flex items-center justify-center border shadow-sm">
                        <span className="font-bold text-[10px] text-blue-600">UPI</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold">UPI / QR Code</p>
                        <p className="text-[10px] text-muted-foreground">Google Pay, PhonePe, etc.</p>
                      </div>
                    </div>
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  </button>

                  <button className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-white flex items-center justify-center border shadow-sm">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Net Banking</p>
                        <p className="text-[10px] text-muted-foreground">All major Indian banks</p>
                      </div>
                    </div>
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setPayModal(null)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handlePay} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Confirm Payment</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
