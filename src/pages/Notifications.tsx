import { AppLayout } from "@/components/AppLayout";
import { notifications } from "@/data/sampleData";
import { Bell, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { useState } from "react";

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
  const [items, setItems] = useState(notifications);

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));

  return (
    <AppLayout>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">Stay updated with lease, payment, and service alerts</p>
        </div>
        <button onClick={markAllRead} className="text-sm text-accent hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-2">
        {items.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <div key={n.id} className={`bg-card rounded-lg border p-4 flex items-start gap-4 transition-colors ${!n.read ? 'border-l-4 border-l-accent' : ''}`}>
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
              {!n.read && <div className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Notifications;
