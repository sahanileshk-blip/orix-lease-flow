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
  faqItems
} from "@/data/sampleData";

export function useAppData() {
  const { user } = useAuth();
  
  if (!user) {
    return { assets: [], contracts: [], invoices: [], tickets: [], documents: [], notifications: [], dashboardKPIs, costCenters, locations, clients, faqItems };
  }

  // Superadmin sees all
  if (user.accessLevel === 'all') {
    return { assets, contracts, invoices, tickets, documents, notifications, dashboardKPIs, costCenters, locations, clients, faqItems };
  }

  // Admin with multiple clients
  if (user.accessLevel === 'multiple' && user.allowedClients) {
    return {
      assets: assets.filter(a => user.allowedClients!.includes(a.clientId)),
      contracts: contracts.filter(c => user.allowedClients!.includes(c.clientId)),
      invoices: invoices.filter(i => user.allowedClients!.includes(i.clientId)),
      tickets: tickets.filter(t => user.allowedClients!.includes(t.clientId)),
      documents: documents.filter(d => user.allowedClients!.includes(d.clientId)),
      notifications,
      dashboardKPIs, // Might want to compute dynamic KPIs here, but keeping static for demo
      costCenters,
      locations,
      clients: clients.filter(c => user.allowedClients!.includes(c.id)),
      faqItems
    };
  }

  // Client User - strictly single client
  if (user.clientId) {
    const clientAssets = assets.filter(a => a.clientId === user.clientId);
    return {
      assets: clientAssets,
      contracts: contracts.filter(c => c.clientId === user.clientId),
      invoices: invoices.filter(i => i.clientId === user.clientId),
      tickets: tickets.filter(t => t.clientId === user.clientId),
      documents: documents.filter(d => d.clientId === user.clientId),
      notifications,
      dashboardKPIs: {
        ...dashboardKPIs,
        totalAssets: clientAssets.length,
        assetsByType: {
          Vehicle: clientAssets.filter(a => a.type === 'Vehicle').length,
          IT: clientAssets.filter(a => a.type === 'IT').length,
        }
      },
      costCenters,
      locations,
      clients: clients.filter(c => c.id === user.clientId),
      faqItems
    };
  }

  return { assets, contracts, invoices, tickets, documents, notifications, dashboardKPIs, costCenters, locations, clients, faqItems };
}
