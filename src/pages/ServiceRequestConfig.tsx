import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, FileText, Settings2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useServiceRequest, DocumentChecklistItem, ServiceRequestCategory, ServiceRequestType } from "@/contexts/ServiceRequestContext";
import { useToast } from "@/hooks/use-toast";

const ServiceRequestConfig = () => {
  const { categories, requestTypes, addCategory, updateCategory, deleteCategory, addRequestType, updateRequestType, deleteRequestType } = useServiceRequest();
  const { toast } = useToast();

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceRequestCategory | null>(null);
  const [catName, setCatName] = useState("");

  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServiceRequestType | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeCatId, setTypeCatId] = useState("");
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocMandatory, setNewDocMandatory] = useState(false);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    if (editingCat) {
      updateCategory(editingCat.id, catName);
      toast({ title: "Category Updated", description: `Category "${catName}" has been updated.` });
    } else {
      addCategory(catName);
      toast({ title: "Category Created", description: `New category "${catName}" has been added.` });
    }
    setCatDialogOpen(false);
    setCatName("");
    setEditingCat(null);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim() || !typeCatId) return;
    if (editingType) {
      updateRequestType(editingType.id, typeName, checklist);
      toast({ title: "Request Type Updated", description: `Request type "${typeName}" has been updated.` });
    } else {
      addRequestType(typeCatId, typeName, checklist);
      toast({ title: "Request Type Created", description: `New request type "${typeName}" has been added.` });
    }
    setTypeDialogOpen(false);
    resetTypeForm();
  };

  const resetTypeForm = () => {
    setEditingType(null);
    setTypeName("");
    setTypeCatId("");
    setChecklist([]);
  };

  const addDocToChecklist = () => {
    if (!newDocName.trim()) return;
    setChecklist([...checklist, { id: `doc_${Date.now()}`, name: newDocName, isMandatory: newDocMandatory }]);
    setNewDocName("");
    setNewDocMandatory(false);
  };

  const removeDocFromChecklist = (id: string) => {
    setChecklist(checklist.filter(d => d.id !== id));
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            Service Request Configuration
          </h1>
          <p className="page-description">Manage categories, request types, and document requirements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading">Categories</h2>
            <Dialog open={catDialogOpen} onOpenChange={(open) => {
              setCatDialogOpen(open);
              if (!open) { setEditingCat(null); setCatName(""); }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCat ? "Edit Category" : "Add New Category"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveCategory} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="catName">Category Name</Label>
                    <Input 
                      id="catName" 
                      placeholder="e.g. Vehicle, IT, Finance" 
                      value={catName} 
                      onChange={e => setCatName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Category</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow group">
                <span className="font-medium">{cat.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    setEditingCat(cat);
                    setCatName(cat.name);
                    setCatDialogOpen(true);
                  }}>
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                    deleteCategory(cat.id);
                    toast({ title: "Category Deleted", description: "Category and its request types removed." });
                  }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Types Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading">Request Types & Document Checklists</h2>
            <Dialog open={typeDialogOpen} onOpenChange={(open) => {
              setTypeDialogOpen(open);
              if (!open) resetTypeForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Request Type</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingType ? "Edit Request Type" : "Add New Request Type"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveType} className="space-y-6 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={typeCatId} onValueChange={setTypeCatId} required>
                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type Name</Label>
                      <Input 
                        placeholder="e.g. Accident Reporting, Upgrade Request" 
                        value={typeName} 
                        onChange={e => setTypeName(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Document Checklist Configuration
                      </h3>
                    </div>
                    
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-xs">Document Name</Label>
                        <Input 
                          placeholder="e.g. Identity Proof" 
                          value={newDocName} 
                          onChange={e => setNewDocName(e.target.value)} 
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <Checkbox 
                          id="mandatory" 
                          checked={newDocMandatory} 
                          onCheckedChange={(checked) => setNewDocMandatory(!!checked)} 
                        />
                        <Label htmlFor="mandatory" className="text-xs cursor-pointer">Mandatory</Label>
                      </div>
                      <Button type="button" onClick={addDocToChecklist} className="h-9" variant="secondary">Add</Button>
                    </div>

                    <div className="space-y-2 mt-4">
                      {checklist.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4 italic">No documents configured yet.</p>
                      )}
                      {checklist.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 bg-background border rounded-md text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{doc.name}</span>
                            {doc.isMandatory ? (
                              <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded font-bold uppercase">Mandatory</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">Optional</span>
                            )}
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeDocFromChecklist(doc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setTypeDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Request Type</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{cat.name} Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requestTypes.filter(t => t.categoryId === cat.id).map(type => (
                    <div key={type.id} className="p-4 bg-card border rounded-xl hover:border-primary/30 transition-colors group">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-sm">{type.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            setEditingType(type);
                            setTypeName(type.name);
                            setTypeCatId(type.categoryId);
                            setChecklist(type.documentChecklist);
                            setTypeDialogOpen(true);
                          }}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                            deleteRequestType(type.id);
                            toast({ title: "Type Deleted", description: "Request type removed." });
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                          <FileText className="h-3 w-3" /> Checklist
                        </p>
                        {type.documentChecklist.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No documents</p>
                        ) : (
                          type.documentChecklist.map(doc => (
                            <div key={doc.id} className="flex items-center gap-2 text-xs">
                              {doc.isMandatory ? <Check className="h-3 w-3 text-rose-500" /> : <ArrowRight className="h-3 w-3 text-slate-400" />}
                              <span className={doc.isMandatory ? "text-foreground font-medium" : "text-muted-foreground"}>{doc.name}</span>
                              {doc.isMandatory && <span className="text-[9px] text-rose-500 font-bold ml-auto">* Mandatory</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                  {requestTypes.filter(t => t.categoryId === cat.id).length === 0 && (
                    <div className="col-span-2 p-8 border border-dashed rounded-xl text-center">
                      <p className="text-sm text-muted-foreground">No request types configured for this category.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ServiceRequestConfig;
