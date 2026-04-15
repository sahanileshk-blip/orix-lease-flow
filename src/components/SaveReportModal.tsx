import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReports } from "@/contexts/ReportContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SaveReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName: string;
  activeFilters: Record<string, string>;
}

export function SaveReportModal({ open, onOpenChange, moduleName, activeFilters }: SaveReportModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { addReport } = useReports();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addReport({
      name,
      description,
      module: moduleName,
      filters: activeFilters,
      createdBy: user?.id || 'unknown',
    });

    toast({
      title: "Report Saved Successfully",
      description: `Your custom report for ${moduleName} has been saved.`,
    });

    onOpenChange(false);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save Custom Report — {moduleName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Report Name <span className="text-destructive">*</span></Label>
            <Input 
              placeholder="e.g., Q1 Monthly Layout" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea 
              placeholder="Brief description of this report configuration..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs font-medium mb-1">Active Filters to be saved:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(activeFilters).map(([k, v]) => (
                <span key={k} className="bg-background text-xs px-2 py-0.5 rounded border capitalize">
                  {k}: <strong>{v || 'All'}</strong>
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Report</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
