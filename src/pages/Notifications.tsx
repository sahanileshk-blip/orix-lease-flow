import { AppLayout } from "@/components/AppLayout";
import { notifications } from "@/data/sampleData";
import { Bell, AlertTriangle, CheckCircle, Info, AlertCircle, Settings } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const colorMap = {
  error: "text-destructive bg-destructive/10",
  warning: "text-warning bg-warning/10",
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
};

const Notifications = () => {
  const location = useLocation();
  const [items, setItems] = useState(notifications);
  const [frequency, setFrequency] = useState("daily");
  const { toast } = useToast();

  const defaultTab = location.state?.tab || "notifications";

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));

  const handleSaveSettings = () => {
    toast({ title: "Settings Saved", description: `Your notification frequency context (${frequency}) has been updated successfully.` });
  };

  return (
    <AppLayout>
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-description">Stay updated with lease, payment, and service alerts</p>
          </div>
          <TabsList>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Alerts</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="notifications" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <button onClick={markAllRead} className="text-sm text-primary hover:underline font-medium">Mark all as read</button>
          </div>
          <div className="space-y-2">
            {items.map((n) => {
              const Icon = iconMap[n.type];
              return (
                <div key={n.id} className={`bg-card rounded-lg border p-4 flex items-start gap-4 transition-colors ${!n.read ? 'border-l-4 border-l-primary' : ''}`}>
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                  {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="w-full bg-card rounded-lg border p-6 space-y-8">
            <div>
              <h3 className="font-heading font-semibold text-lg">Email Notifications</h3>
              <p className="text-sm text-muted-foreground mb-4">Receive alerts directly to your registered email address.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Lease Extensions</Label>
                    <p className="text-xs text-muted-foreground">Alerts for upcoming lease extensions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Invoice Payments due</Label>
                    <p className="text-xs text-muted-foreground">Reminders before an invoice becomes overdue</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Service Request Updates</Label>
                    <p className="text-xs text-muted-foreground">When an ORIX team member updates your ticket</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-heading font-semibold text-lg">In-App Notifications</h3>
              <p className="text-sm text-muted-foreground mb-4">Push notifications inside the ORIX Customer Portal.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">System Maintenance</Label>
                    <p className="text-xs text-muted-foreground">Portal downtime and maintenance periods</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">New Documents</Label>
                    <p className="text-xs text-muted-foreground">When RC copies, insurance, or invoices are uploaded</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-heading font-semibold text-lg">Notification Frequency</h3>
              <p className="text-sm text-muted-foreground mb-4">Batch your summary notifications by user schedule level.</p>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Frequency Policy</Label>
                  <p className="text-xs text-muted-foreground">Select how often the system triggers routine emails</p>
                </div>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-2">
              <Button onClick={handleSaveSettings}>Save Preferences</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Notifications;
