import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { CheckCircle2, ChevronRight, Star, Lock } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const dealers = [
  { id: "D01", name: "AutoNation Mumbai",   location: "Mumbai, MH",   empanelled: true,  rating: 4.7, brands: ["Honda", "Maruti", "Hyundai"] },
  { id: "D02", name: "Delhi Auto Hub",      location: "Delhi, DL",    empanelled: true,  rating: 4.5, brands: ["Toyota", "Tata", "Kia"] },
  { id: "D03", name: "Bengaluru CarZone",   location: "Bengaluru, KA",empanelled: true,  rating: 4.8, brands: ["BMW", "Mercedes", "Audi"] },
  { id: "D04", name: "Pune Motor Express",  location: "Pune, MH",     empanelled: false, rating: 3.9, brands: ["Maruti", "Renault"] },
];

const quotes = [
  { dealer: "AutoNation Mumbai",   asset: "Honda City ZX",    specs: "1.5L Petrol, Auto", price: 1250000, leadTime: "3 weeks" },
  { dealer: "Delhi Auto Hub",      asset: "Toyota Innova ZX", specs: "2.4L Diesel, Manual",price: 1780000, leadTime: "2 weeks" },
  { dealer: "Bengaluru CarZone",   asset: "Honda City ZX",    specs: "1.5L Petrol, Auto", price: 1235000, leadTime: "4 weeks" },
];

export default function DealerPortal() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [chosenQuote, setChosenQuote] = useState<typeof quotes[0] | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const toggleDealer = (id: string) => {
    setSelected(p => p.includes(id) ? p.filter(d => d !== id) : [...p, id]);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Dealer Selection & Pricing Portal</h1>
        <p className="page-description">{user?.clientName} — Compare empanelled dealers and confirm asset pricing</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto">
        {[
          { n: 1, label: "Select Dealers" },
          { n: 2, label: "Compare Quotes" },
          { n: 3, label: "Confirm Selection" },
        ].map((s, i, arr) => (
          <div key={s.n} className="flex items-center shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${step >= s.n ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s.n ? "bg-primary text-primary-foreground" : step === s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {step > s.n ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.n}
              </div>
              {s.label}
            </div>
            {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step 1: Dealer List */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dealers.map(d => (
              <button
                key={d.id}
                onClick={() => d.empanelled && toggleDealer(d.id)}
                className={`text-left rounded-xl border p-4 transition-all duration-200 ${!d.empanelled ? "opacity-50 cursor-not-allowed bg-muted/30" : selected.includes(d.id) ? "border-primary bg-primary/5 shadow-sm" : "bg-card hover:shadow-md hover:border-primary/30"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-semibold text-sm">{d.name}</p>
                      {!d.empanelled && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.location}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {d.brands.map(b => (
                        <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{b}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> {d.rating}
                    </div>
                    {d.empanelled
                      ? <span className="text-[10px] text-emerald-600 font-medium">Empanelled</span>
                      : <span className="text-[10px] text-muted-foreground">Not Empanelled</span>}
                    {selected.includes(d.id) && <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-primary ml-auto" /></div>}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              disabled={selected.length === 0}
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Request Quotes from {selected.length} dealer{selected.length !== 1 ? "s" : ""} →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Quote Comparison */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Dealer", "Asset", "Specifications", "Offered Price", "Lead Time", ""].map(h => (
                    <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.filter(q => selected.some(s => dealers.find(d => d.id === s)?.name === q.dealer)).map((q, i) => (
                  <tr key={i} className={`border-t hover:bg-muted/20 transition-colors ${chosenQuote?.dealer === q.dealer ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                    <td className="py-3 px-4 font-medium text-xs">{q.dealer}</td>
                    <td className="py-3 px-4 text-xs">{q.asset}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{q.specs}</td>
                    <td className="py-3 px-4 text-xs font-bold">{fmt(q.price)}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{q.leadTime}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setChosenQuote(q)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${chosenQuote?.dealer === q.dealer ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
                      >{chosenQuote?.dealer === q.dealer ? "✓ Selected" : "Select"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors">← Back</button>
            <button disabled={!chosenQuote} onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40">Proceed to Confirm →</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && !confirmed && chosenQuote && (
        <div className="max-w-md space-y-5">
          <div className="bg-card border rounded-xl p-5 space-y-3">
            <p className="font-heading font-semibold text-sm">Confirm Your Selection</p>
            {[
              { label: "Dealer",       value: chosenQuote.dealer },
              { label: "Asset",        value: chosenQuote.asset },
              { label: "Specs",        value: chosenQuote.specs },
              { label: "Price",        value: fmt(chosenQuote.price) },
              { label: "Lead Time",    value: chosenQuote.leadTime },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm border-b last:border-0 py-2">
                <span className="text-muted-foreground text-xs">{r.label}</span>
                <span className="font-medium text-xs">{r.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">By confirming, this selection will be locked and forwarded to the lease creation workflow. This cannot be reversed.</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition-colors">← Back</button>
            <button onClick={() => setConfirmed(true)} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Confirm & Lock Selection</button>
          </div>
        </div>
      )}

      {confirmed && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="font-heading font-bold text-lg">Selection Confirmed!</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Your selection of <strong>{chosenQuote?.dealer}</strong> for <strong>{chosenQuote?.asset}</strong> at <strong>{chosenQuote ? fmt(chosenQuote.price) : ""}</strong> has been locked and forwarded to the lease creation team.
          </p>
          <button onClick={() => { setStep(1); setSelected([]); setChosenQuote(null); setConfirmed(false); }} className="text-xs text-primary hover:underline">Start a new selection</button>
        </div>
      )}
    </AppLayout>
  );
}
