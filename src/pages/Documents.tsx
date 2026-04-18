import { AppLayout } from "@/components/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Upload, FileText, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function downloadCSV(data: any[], filename: string) {
  const headers = ['Document', 'Client', 'Category', 'Type', 'Version', 'Uploaded', 'Expiry', 'Size'];
  const rows = data.map(d => [d.name, d.clientName, d.category, d.type, `v${d.version}`, d.uploadedAt, d.expiryDate || '', d.size]);
  const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const Documents = () => {
  const { documents } = useAppData();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filtered = documents.filter((d) => {
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Document Centre</h1>
          <p className="page-description">Upload, manage, and track document versions and expiry</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => downloadCSV(filtered, 'documents.csv')}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
          <Button className="gap-1.5" onClick={() => toast({ title: "Upload", description: "Document upload feature coming soon." })}>
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Insurance">Insurance</SelectItem>
            <SelectItem value="Registration">Registration</SelectItem>
            <SelectItem value="Invoice">Invoice</SelectItem>
            <SelectItem value="TDS Certificate">TDS Certificate</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Client</th>
              <th>Category</th>
              <th>Type</th>
              <th>Version</th>
              <th>Uploaded</th>
              <th>Expiry</th>
              <th>Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td className="font-medium">
                  <div className="flex items-center gap-2">
                    {d.category === 'TDS Certificate' ? (
                      <Shield className="h-4 w-4 text-accent shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    {d.name}
                  </div>
                </td>
                <td className="text-muted-foreground">{d.clientName}</td>
                <td>
                  <span className={`status-badge ${d.category === 'TDS Certificate' ? 'status-active' : 'status-closed'}`}>
                    {d.category}
                  </span>
                </td>
                <td>{d.type}</td>
                <td className="text-center">v{d.version}</td>
                <td className="text-muted-foreground">{d.uploadedAt}</td>
                <td>
                  {d.expiryDate ? (
                    <span className="flex items-center gap-1">
                      {new Date(d.expiryDate) < new Date() && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      {d.expiryDate}
                    </span>
                  ) : '—'}
                </td>
                <td className="text-muted-foreground">{d.size}</td>
                <td>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <Download className="h-3.5 w-3.5" />
                    {d.category === 'TDS Certificate' ? 'Download TDS' : 'Download'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default Documents;
