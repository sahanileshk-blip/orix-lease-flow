import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Plus, Download, Filter, Search, FileText, Upload, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type DocType = "Rental Schedule" | "Offer Letter" | "Invoice" | "Debit/Credit Note" | "Receipt" | "TDS Certificate" | "NOC";

const DOC_TYPES: DocType[] = ["Rental Schedule", "Offer Letter", "Invoice", "Debit/Credit Note", "Receipt", "TDS Certificate", "NOC"];

const docColor: Record<DocType, string> = {
  "Rental Schedule":  "bg-sky-50 text-sky-600 dark:bg-sky-900/20",
  "Offer Letter":     "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
  "Invoice":          "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  "Debit/Credit Note":"bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  "Receipt":          "bg-violet-50 text-violet-600 dark:bg-violet-900/20",
  "TDS Certificate":  "bg-rose-50 text-rose-600 dark:bg-rose-900/20",
  "NOC":              "bg-teal-50 text-teal-600 dark:bg-teal-900/20",
};

const documents = [
  { id: "d1", name: "Rental Schedule — LC-2789.pdf",  type: "Rental Schedule" as DocType, date: "01 Jan 2024", lease: "LC-2789", size: "245 KB", version: "v1" },
  { id: "d2", name: "Offer Letter — LC-2789.pdf",     type: "Offer Letter"    as DocType, date: "20 Dec 2023", lease: "LC-2789", size: "128 KB", version: "v1" },
  { id: "d3", name: "INV-20041.pdf",                   type: "Invoice"         as DocType, date: "15 Mar 2026", lease: "LC-2789", size: "98 KB",  version: "v1" },
  { id: "d4", name: "INV-20042.pdf",                   type: "Invoice"         as DocType, date: "01 Apr 2026", lease: "LC-2789", size: "98 KB",  version: "v1" },
  { id: "d5", name: "Receipt-Mar2026.pdf",             type: "Receipt"         as DocType, date: "25 Mar 2026", lease: "LC-2789", size: "54 KB",  version: "v1" },
  { id: "d6", name: "TDS-Cert-FY2526.pdf",             type: "TDS Certificate" as DocType, date: "01 Apr 2026", lease: "LC-2789", size: "180 KB", version: "v2" },
  { id: "d7", name: "NOC-LC-2791.pdf",                 type: "NOC"             as DocType, date: "30 Jun 2026", lease: "LC-2791", size: "76 KB",  version: "v1" },
  { id: "d8", name: "Rental Schedule — LC-2791.pdf",  type: "Rental Schedule" as DocType, date: "01 Jul 2023", lease: "LC-2791", size: "210 KB", version: "v1" },
  { id: "d9", name: "DN-001-Apr2026.pdf",              type: "Debit/Credit Note" as DocType, date: "05 Apr 2026", lease: "LC-2789", size: "64 KB", version: "v1" },
];

export default function PortalDocuments() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState<"all" | DocType>("all");
  const [search, setSearch]       = useState("");

  const filtered = documents.filter(d =>
    (typeFilter === "all" || d.type === typeFilter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase()))
  );

  // Group counts by type
  const counts = DOC_TYPES.reduce((acc, t) => ({ ...acc, [t]: documents.filter(d => d.type === t).length }), {} as Record<DocType, number>);

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Document Center</h1>
            <p className="page-description">{user?.clientName} — Lease documents, certificates, and statements</p>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold hover:bg-muted cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5" /> Upload Document
            <input type="file" className="hidden" />
          </label>
        </div>
      </div>

      {/* Document type pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === "all" ? "bg-primary text-primary-foreground border-transparent" : "bg-card hover:bg-muted border-border"}`}
        >
          All ({documents.length})
        </button>
        {DOC_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === t ? "bg-primary text-primary-foreground border-transparent" : "bg-card hover:bg-muted border-border"}`}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents…" className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm">No documents found.</div>
        )}
        {filtered.map(doc => (
          <div key={doc.id} className="bg-card border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{doc.lease} · {doc.date}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${docColor[doc.type]}`}>{doc.type}</span>
                  <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                  <span className="text-[10px] text-muted-foreground">{doc.version}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                <Eye className="h-3 w-3" /> View
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                <Download className="h-3 w-3" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
