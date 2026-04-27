import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TablePagination, usePagination } from "@/components/TablePagination";

const users = [
  { id: 'u1', name: 'Admin Kumar', email: 'admin@orixindia.com', role: 'ORIX Admin', client: 'ORIX', status: 'Active' },
  { id: 'u2', name: 'Rajesh Verma', email: 'rajesh@tatamotors.com', role: 'Fleet Manager', client: 'Tata Motors Ltd', status: 'Active' },
  { id: 'u3', name: 'Priya Mehta', email: 'priya@reliance.com', role: 'IT Manager', client: 'Reliance Industries', status: 'Active' },
  { id: 'u4', name: 'Sunil Sharma', email: 'sunil@reliance.com', role: 'Finance Manager', client: 'Reliance Industries', status: 'Active' },
  { id: 'u5', name: 'Kavita Iyer', email: 'kavita@wipro.com', role: 'Viewer', client: 'Wipro Limited', status: 'Inactive' },
  { id: 'u6', name: 'Deepak Nair', email: 'deepak@mahindra.com', role: 'Fleet Manager', client: 'Mahindra & Mahindra', status: 'Active' },
];

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogOpen(false);
    toast({ title: "User Created", description: "New user account has been created." });
  };

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Create users, assign roles, and manage client access</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input required />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue="Viewer">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORIX Admin">ORIX Admin</SelectItem>
                    <SelectItem value="Fleet Manager">Fleet Manager</SelectItem>
                    <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                    <SelectItem value="IT Manager">IT Manager</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Select defaultValue="c1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orix">ORIX (Admin)</SelectItem>
                    <SelectItem value="c1">Tata Motors Ltd</SelectItem>
                    <SelectItem value="c2">Reliance Industries</SelectItem>
                    <SelectItem value="c3">Reliance Industries</SelectItem>
                    <SelectItem value="c4">Wipro Limited</SelectItem>
                    <SelectItem value="c5">Mahindra & Mahindra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-[220px]" />
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Client</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td>{u.role}</td>
                <td>{u.client}</td>
                <td>
                  <span className={`status-badge ${u.status === 'Active' ? 'status-active' : 'status-closed'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </AppLayout>
  );
};

export default UserManagement;
