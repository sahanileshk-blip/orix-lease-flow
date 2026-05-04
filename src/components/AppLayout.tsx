import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Headset, Mail, Phone, Moon, Sun, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";
import { notifications, costCenters, locations } from "@/data/sampleData";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFilter } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { QuickActionsBar } from "@/components/dashboard/QuickActionsBar";
import { usePersonalization } from "@/contexts/PersonalizationContext";
import { useEffect } from "react";

// Map of path → label for recent module tracking
const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
  "/":           { label: "Dashboard",       icon: "layout" },
  "/vehicles":   { label: "Vehicle Fleet",   icon: "car"    },
  "/equipment":  { label: "Equipments",       icon: "monitor"},
  "/contracts":  { label: "Leases",          icon: "file"   },
  "/invoices":   { label: "Invoices",        icon: "receipt"},
  "/reports":    { label: "Reports",         icon: "chart"  },
  "/tickets":    { label: "Tickets",         icon: "ticket" },
  "/documents":  { label: "Documents",       icon: "folder" },
  "/quotes":     { label: "Lease Requests",  icon: "calc"   },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { clientFilter, setClientFilter, locationFilter, setLocationFilter, leaseStatusFilter, setLeaseStatusFilter } = useFilter();
  const unreadCount = notifications.filter(n => !n.read).length;
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { trackModule } = usePersonalization();
  const isIndividual = !!user?.isIndividual;

  // Track route visits for "Recently Accessed"
  useEffect(() => {
    const meta = MODULE_LABELS[location.pathname];
    if (meta && location.pathname !== "/") {
      trackModule(location.pathname, meta.label, meta.icon);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <SidebarTrigger />
              <Link to="/" className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground shrink-0" title="Go to Home">
                <Home className="h-4 w-4" />
              </Link>

              {/* Quick Actions Bar */}
              {!isIndividual && <QuickActionsBar />}

              {/* Admin global filters */}
              {user?.isAdmin && !isIndividual && location.pathname === '/' && (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <span className="text-xs text-muted-foreground">Client:</span>
                  <MultiSelect
                    placeholder="All Clients"
                    className="w-[160px]"
                    selected={clientFilter}
                    onChange={setClientFilter}
                    options={[
                      { label: "Qualtech Edge Ltd",    value: "c1" },
                      { label: "Reliance Industries",  value: "c2" },
                    ]}
                  />
                </div>
              )}
              {user && !user.isAdmin && !isIndividual && location.pathname === '/' && (
                <span className="text-xs text-muted-foreground hidden sm:block truncate">{user.clientName}</span>
              )}
              {!isIndividual && location.pathname === '/' && (
              <div className="hidden lg:flex items-center gap-2">
                <MultiSelect placeholder="Locations" className="w-[140px]" selected={locationFilter} onChange={setLocationFilter} options={locations.map(l => ({ label: l, value: l }))} />
                <MultiSelect
                  placeholder="Lease Status"
                  className="w-[155px]"
                  selected={leaseStatusFilter}
                  onChange={setLeaseStatusFilter}
                  options={[
                    { label: "Disbursed",           value: "Disbursed"           },
                    { label: "Foreclosed",          value: "Foreclosed"          },
                  ]}
                />
              </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Help desk */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 rounded-md hover:bg-muted transition-colors" title="Help Desk">
                    <Headset className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 mr-4 mt-2" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-heading font-medium text-sm">ORIX Help Desk</h4>
                      <p className="text-xs text-muted-foreground">Available 24/7</p>
                    </div>
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full"><Phone className="h-4 w-4 text-primary" /></div>
                        <div className="text-sm">
                          <p className="font-medium">Toll Free</p>
                          <a href="tel:1800-419-7878" className="text-xs text-muted-foreground hover:text-primary transition-colors">1800-419-7878</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-accent/10 p-2 rounded-full"><Mail className="h-4 w-4 text-accent" /></div>
                        <div className="text-sm">
                          <p className="font-medium">Email Support</p>
                          <a href="mailto:customerservice@orixindia.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">customerservice@orixindia.com</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Notifications */}
              <Link to="/notifications" state={{ tab: "notifications" }} className="relative p-2 rounded-md hover:bg-muted transition-colors">
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
