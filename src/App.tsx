import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { ReportProvider } from "@/contexts/ReportContext";
import { PersonalizationProvider } from "@/contexts/PersonalizationContext";

// ERP pages
import Dashboard from "./pages/Dashboard";
import IndividualDashboard from "./pages/IndividualDashboard";
import VehicleFleet from "./pages/VehicleFleet";
import ITAssets from "./pages/ITAssets";
import Contracts from "./pages/Contracts";
import Quotes from "./pages/Quotes";
import Invoices from "./pages/Invoices";
import Tickets from "./pages/Tickets";
import Reports from "./pages/Reports";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import LeaseDetail from "./pages/LeaseDetail";

// Customer portal pages
import PortalWelcome from "./pages/portal/PortalWelcome";
import DealerPortal from "./pages/portal/DealerPortal";
import VehicleClosures from "./pages/portal/VehicleClosures";
import BillingPayments from "./pages/portal/BillingPayments";
import LeaseProgress from "./pages/portal/LeaseProgress";
import ServiceRequests from "./pages/portal/ServiceRequests";
import RVPayments from "./pages/portal/RVPayments";
import InsuranceMaintenance from "./pages/portal/InsuranceMaintenance";
import PortalDocuments from "./pages/portal/PortalDocuments";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PortalRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isPortalUser) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function IndividualRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isIndividual) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Switches the root route between the standard Dashboard and Individual Dashboard
function DashboardSwitch() {
  const { user } = useAuth();
  return user?.isIndividual ? <IndividualDashboard /> : <Dashboard />;
}

// suppress unused-import warning (IndividualRoute kept for future guarded routes)
void IndividualRoute;

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  // Everyone lands on /
  const defaultRedirect = "/";

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRedirect} replace /> : <Login />} />

      {/* Root route — switches between ERP Dashboard and Individual Dashboard */}
      <Route path="/" element={<ProtectedRoute><DashboardSwitch /></ProtectedRoute>} />
      
      {/* ERP Routes */}
      <Route path="/vehicles"   element={<ProtectedRoute><VehicleFleet /></ProtectedRoute>} />
      <Route path="/it-assets"  element={<ProtectedRoute><ITAssets /></ProtectedRoute>} />
      <Route path="/contracts"  element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
      <Route path="/quotes"     element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
      <Route path="/invoices"   element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/tickets"    element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
      <Route path="/reports"    element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/documents"  element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/faq"        element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
      <Route path="/users"      element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/assets"     element={<Navigate to="/vehicles" replace />} />

      {/* Customer Portal Routes */}
      <Route path="/portal"                  element={<Navigate to="/" replace />} />
      <Route path="/portal/dealers"          element={<PortalRoute><DealerPortal /></PortalRoute>} />
      <Route path="/portal/closures"         element={<PortalRoute><VehicleClosures /></PortalRoute>} />
      <Route path="/portal/billing"          element={<PortalRoute><BillingPayments /></PortalRoute>} />
      <Route path="/portal/progress"         element={<PortalRoute><LeaseProgress /></PortalRoute>} />
      <Route path="/leases/:id"              element={<ProtectedRoute><LeaseDetail /></ProtectedRoute>} />
      <Route path="/portal/service-requests" element={<PortalRoute><ServiceRequests /></PortalRoute>} />
      <Route path="/portal/rv-payments"      element={<PortalRoute><RVPayments /></PortalRoute>} />
      <Route path="/portal/insurance"        element={<PortalRoute><InsuranceMaintenance /></PortalRoute>} />
      <Route path="/portal/documents"        element={<PortalRoute><PortalDocuments /></PortalRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <FilterProvider>
          <ReportProvider>
            <PersonalizationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </PersonalizationProvider>
          </ReportProvider>
        </FilterProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
