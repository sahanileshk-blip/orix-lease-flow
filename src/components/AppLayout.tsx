import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Headset, Mail, Phone, ExternalLink, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";
import { notifications, costCenters, locations } from "@/data/sampleData";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFilter } from "@/contexts/FilterContext";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { clientFilter, setClientFilter, costCenterFilter, setCostCenterFilter, locationFilter, setLocationFilter, leaseStatusFilter, setLeaseStatusFilter } = useFilter();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {user?.isAdmin && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Client:</span>
                  <MultiSelect
                    placeholder="All Clients"
                    className="w-[180px]"
                    selected={clientFilter}
                    onChange={setClientFilter}
                    options={[
                      { label: "Qualtech Edge Ltd", value: "c1" },
                      { label: "Infosys Technologies", value: "c2" },
                      { label: "Reliance Industries", value: "c3" },
                      { label: "Wipro Limited", value: "c4" },
                      { label: "Mahindra & Mahindra", value: "c5" },
                    ]}
                  />
                </div>
              )}
              {user && !user.isAdmin && (
                <span className="text-xs text-muted-foreground hidden sm:block">{user.clientName}</span>
              )}
              <div className="hidden md:flex items-center gap-2">
                <MultiSelect
                  placeholder="All Cost Centers"
                  className="w-[160px]"
                  selected={costCenterFilter}
                  onChange={setCostCenterFilter}
                  options={costCenters.map(cc => ({ label: cc, value: cc }))}
                />
                <MultiSelect
                  placeholder="All Locations"
                  className="w-[150px]"
                  selected={locationFilter}
                  onChange={setLocationFilter}
                  options={locations.map(loc => ({ label: loc, value: loc }))}
                />
                <MultiSelect
                  placeholder="Lease Status"
                  className="w-[165px]"
                  selected={leaseStatusFilter}
                  onChange={setLeaseStatusFilter}
                  options={[
                    { label: "Partially Disbursed", value: "Partially Disbursed" },
                    { label: "Disbursed", value: "Disbursed" },
                    { label: "Foreclosed", value: "Foreclosed" },
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground mr-1"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-2 rounded-md hover:bg-muted transition-colors" title="Contact Help Desk">
                    <Headset className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 mr-4 mt-2" align="end">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-heading font-medium text-sm leading-none">ORIX Help Desk</h4>
                      <p className="text-xs text-muted-foreground">We are here to assist you 24/7</p>
                    </div>
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Toll Free</p>
                          <a href="tel:1800-419-7878" className="text-xs text-muted-foreground hover:text-primary transition-colors">1800-419-7878</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-accent/10 p-2 rounded-full">
                          <Mail className="h-4 w-4 text-accent" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Email Support</p>
                          <a href="mailto:customerservice@orixindia.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">customerservice@orixindia.com</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Link to="/notifications" state={{ tab: 'notifications' }} className="relative p-2 rounded-md hover:bg-muted transition-colors">
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
