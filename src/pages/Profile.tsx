import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Profile Updated", description: "Your changes have been saved." });
  };

  const nameParts = user?.name.split(" ") || ["", ""];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-description">Manage your account and security preferences</p>
      </div>

      <div className="w-full space-y-6">
        {/* Profile Info */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold text-base mb-4">Personal Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue={firstName} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue={lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email || ""} type="email" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue={user?.isIndividual ? "+91 97654 32109" : "+91 98765 43210"} />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input defaultValue={user?.isIndividual ? "Software Engineer" : user?.role || "Manager"} />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold text-base mb-4">Change Password</h2>
          <form onSubmit={(e) => { e.preventDefault(); toast({ title: "Password Updated" }); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" />
              </div>
            </div>
            <Button type="submit" variant="outline">Update Password</Button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold text-base mb-4">Security</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Multi-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
