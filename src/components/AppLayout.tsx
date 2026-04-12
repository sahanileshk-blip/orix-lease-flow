import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { notifications } from "@/data/sampleData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [clientFilter, setClientFilter] = useState("all");
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {user?.isAdmin && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Client:</span>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="h-8 w-[180px] text-xs">
                      <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      <SelectItem value="c1">Tata Motors Ltd</SelectItem>
                      <SelectItem value="c2">Infosys Technologies</SelectItem>
                      <SelectItem value="c3">Reliance Industries</SelectItem>
                      <SelectItem value="c4">Wipro Limited</SelectItem>
                      <SelectItem value="c5">Mahindra & Mahindra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {user && !user.isAdmin && (
                <span className="text-xs text-muted-foreground hidden sm:block">{user.clientName}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/notifications" className="relative p-2 rounded-md hover:bg-muted transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
