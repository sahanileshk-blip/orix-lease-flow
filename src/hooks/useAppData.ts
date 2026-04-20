import { useAuth } from "@/contexts/AuthContext";
import {
  assets,
  contracts,
  invoices,
  tickets,
  documents,
  notifications,
  dashboardKPIs,
  costCenters,
  locations,
  clients,
  faqItems,
  auditLogs
} from "@/data/sampleData";

import { useFilter } from "@/contexts/FilterContext";

export function useAppData() {
  const { user } = useAuth();
  const { clientFilter, costCenterFilter, locationFilter, leaseStatusFilter } = useFilter();

  if (!user) {
    return { assets: [], contracts: [], invoices: [], tickets: [], documents: [], notifications: [], dashboardKPIs, costCenters, locations, clients, faqItems, auditLogs: [] };
  }

  const applyUniversalFilter = (item: any) => {
    if (clientFilter.length > 0 && !clientFilter.includes(item.clientId)) return false;
    if (costCenterFilter.length > 0 && item.costCenter && !costCenterFilter.includes(item.costCenter)) return false;
    if (locationFilter.length > 0 && item.location && !locationFilter.includes(item.location)) return false;
    return true;
  };

  let allowedClients = clients.map(c => c.id);
  if (user.accessLevel === 'multiple' && user.allowedClients) {
    allowedClients = user.allowedClients;
  } else if (user.clientId) {
    allowedClients = [user.clientId];
  }

  // rawContracts: scoped to user access + global lease status filter (ignores client/costCenter/location header filters)
  // Used by Lease Management so the status filter is global across all clients
  const rawContracts = contracts
    .filter(i => allowedClients.includes(i.clientId))
    .filter(i => leaseStatusFilter.length === 0 || leaseStatusFilter.includes(i.status));

  // Pre-filter by user access first, then by universal filters
  const fAssets = assets
    .filter(i => allowedClients.includes(i.clientId))
    .filter(applyUniversalFilter)
    .filter(i => leaseStatusFilter.length === 0 || leaseStatusFilter.includes(i.leaseStatus));
  const fContracts = contracts
    .filter(i => allowedClients.includes(i.clientId))
    .filter(applyUniversalFilter)
    .filter(i => leaseStatusFilter.length === 0 || leaseStatusFilter.includes(i.status));
  const fInvoices = invoices.filter(i => allowedClients.includes(i.clientId)).filter(applyUniversalFilter);
  const fTickets = tickets.filter(i => allowedClients.includes(i.clientId)).filter(applyUniversalFilter);
  const fDocuments = documents.filter(i => allowedClients.includes(i.clientId)).filter(applyUniversalFilter);

  // Dynamic KPIs derived from filtered data
  const dynamicKPIs = {
    ...dashboardKPIs,
    totalLeases: fContracts.length,
    activeLeases: fContracts.filter(c => c.status === 'Disbursed' || c.status === 'Partially Disbursed').length,
    totalAssets: fAssets.length,
    totalLeaseValue: fContracts.reduce((sum, c) => sum + c.totalValue, 0),
    activeLeaseValue: fContracts.filter(c => c.status === 'Disbursed' || c.status === 'Partially Disbursed').reduce((sum, c) => sum + c.totalValue, 0),
    assetsByType: {
      Vehicle: fAssets.filter(a => a.type === 'Vehicle').length,
      'IT Equipment': fAssets.filter(a => a.type === 'IT Equipment').length,
    },
    assetsByStatus: {
      Active: fAssets.filter(a => a.status === 'Active').length,
      'Under Maintenance': fAssets.filter(a => a.status === 'Under Maintenance').length,
      'In Transit': fAssets.filter(a => a.status === 'In Transit').length,
    }
  };

  return {
    assets: fAssets,
    contracts: fContracts,
    rawContracts,
    invoices: fInvoices,
    tickets: fTickets,
    documents: fDocuments,
    notifications, // kept global
    dashboardKPIs: dynamicKPIs,
    locations,
    clients: clients.filter(c => allowedClients.includes(c.id)),
    faqItems,
    auditLogs
  };
}
