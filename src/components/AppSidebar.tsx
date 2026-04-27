import {
  LayoutDashboard, Car, Monitor, FileText, Receipt,
  FileBarChart, TicketPlus, FolderOpen, Bell, User, Users,
  Calculator, LogOut, HelpCircle, CreditCard, TrendingUp,
  ShieldCheck, BarChart2, Wrench, Home, Store,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/AuthContext";

/* ── ERP nav items per role ──────────────────────────────────────── */
const allErpItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["all"] },
  { title: "Vehicle Fleet", url: "/vehicles", icon: Car, roles: ["ORIX User", "Vehicle Asset Manager", "Fleet Manager"] },
  { title: "IT Assets", url: "/it-assets", icon: Monitor, roles: ["ORIX User", "IT Asset Manager", "Fleet Manager"] },
  { title: "Lease Management", url: "/contracts", icon: FileText, roles: ["ORIX User", "Lease Manager", "Finance Manager", "Fleet Manager"] },
  { title: "Quotations", url: "/quotes", icon: Calculator, roles: ["all"] },
  { title: "Invoices", url: "/invoices", icon: Receipt, roles: ["ORIX User", "Finance Manager", "Lease Manager", "Fleet Manager"] },
  { title: "Custom Reports", url: "/reports", icon: FileBarChart, roles: ["ORIX User", "Finance Manager", "Fleet Manager"] },
  { title: "Service Requests", url: "/tickets", icon: TicketPlus, roles: ["all"] },
  { title: "Document Center", url: "/documents", icon: FolderOpen, roles: ["all"] },
  { title: "Notifications", url: "/notifications", icon: Bell, roles: ["all"], state: { tab: "settings" } },
  { title: "Profile", url: "/profile", icon: User, roles: ["all"] },
  { title: "FAQ", url: "/faq", icon: HelpCircle, roles: ["all"] },
];

const adminItems = [
  { title: "User Management", url: "/users", icon: Users, roles: ["all"] },
  { title: "Audit Log", url: "/audit-log", icon: ShieldCheck, roles: ["IT Admin (ORIX)"] }
];

/* ── Individual User nav (5 modules only) ────────────────────────── */
const individualItems = [
  { title: "Dashboard",        url: "/",              icon: LayoutDashboard },
  { title: "Request Quotation", url: "/quotes",       icon: Calculator      },
  { title: "Service Requests", url: "/tickets",       icon: TicketPlus      },
  { title: "Notifications",   url: "/notifications", icon: Bell            },
  { title: "Profile",          url: "/profile",       icon: User            },
  { title: "FAQ",              url: "/faq",           icon: HelpCircle      },
];

/* ── Customer Portal nav ─────────────────────────────────────────── */
const portalItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Dealer Portal", url: "/portal/dealers", icon: Store },
  { title: "Billing & Payments", url: "/portal/billing", icon: CreditCard },
  { title: "Lease Progress", url: "/portal/progress", icon: TrendingUp },
  { title: "Service Requests", url: "/portal/service-requests", icon: Wrench },
  { title: "RV Payments", url: "/portal/rv-payments", icon: BarChart2 },
  { title: "Insurance & Maint.", url: "/portal/insurance", icon: ShieldCheck },
  { title: "Vehicle Closures", url: "/portal/closures", icon: Car },
  { title: "Document Center", url: "/portal/documents", icon: FolderOpen },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state, isMobile, setOpen } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const location = useLocation();
  const { user, logout } = useAuth();

  const isPortal = !!user?.isPortalUser;
  const isIndividual = !!user?.isIndividual;

  /* Filter ERP items by role */
  const role: UserRole = user?.role ?? "ORIX User";
  const visibleErpItems = allErpItems.filter(i =>
    i.roles.includes("all") || i.roles.includes(role) || user?.isAdmin
  );

  const navItems = isIndividual ? individualItems : visibleErpItems;

  const linkClass = (active: boolean) =>
    `flex items-center rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors
     ${collapsed ? "justify-center w-8 h-8 mx-auto" : "gap-3 px-3 py-2 w-full"}
     ${active ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""}`;

  const visibleAdminItems = adminItems.filter(i =>
    i.roles.includes("all") || i.roles.includes(role)
  );

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => !isMobile && setOpen(true)}
      onMouseLeave={() => !isMobile && setOpen(false)}
    >
      <SidebarHeader className={`border-b border-sidebar-border py-4 transition-all duration-300 ${collapsed ? "px-0" : "px-4"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-9 w-9 flex items-center justify-center p-1.5 bg-white rounded-lg border border-sidebar-border shadow-sm overflow-hidden shrink-0">
            <img src="/orix-logo-original.png" alt="ORIX" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-sm text-[#ce1439] leading-tight truncate">ORIX India</p>
              <p className="text-[10px] text-sidebar-muted truncate">
            {isIndividual ? "Individual Lease Portal" : isPortal ? "Customer Portal" : "Enterprise Portal"}
          </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          {/* {!collapsed && !isPortal && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">Main</SidebarGroupLabel>}
          {!collapsed && isPortal && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">Portal</SidebarGroupLabel>} */}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      state={"state" in item ? item.state : undefined}
                      end={item.url === "/" || item.url === "/portal"}
                      className={({ isActive }: { isActive: boolean }) => linkClass(isActive)}
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="text-sm">
                          {item.url === "/quotes" && role === "Fleet Manager" ? "Request Quotation" : item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && !isPortal && !isIndividual && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">Admin</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdminItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }: { isActive: boolean }) => linkClass(isActive)}
                        activeClassName=""
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              {!isPortal && <p className="text-[10px] text-sidebar-muted truncate">{user.role}</p>}
            </div>
            <button onClick={logout} className="p-1.5 rounded hover:bg-sidebar-accent transition-colors" title="Sign out">
              <LogOut className="h-3.5 w-3.5 text-sidebar-muted" />
            </button>
          </div>
        )}
        {collapsed && user && (
          <button onClick={logout} className="mx-auto p-1.5 rounded hover:bg-sidebar-accent transition-colors" title="Sign out">
            <LogOut className="h-4 w-4 text-sidebar-muted" />
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
