export interface Client {
  id: string;
  name: string;
  code: string;
}

export interface Asset {
  id: string;
  clientId: string;
  clientName: string;
  type: 'Vehicle' | 'IT';
  assetTag: string;
  description: string;
  status: 'Active' | 'Under Maintenance' | 'Disposed' | 'In Transit';
  location: string;
  costCenter: string;
  assignedTo: string;
  leaseStartDate: string;
  leaseEndDate: string;
  // Vehicle-specific
  registrationNo?: string;
  make?: string;
  model?: string;
  driver?: string;
  insuranceExpiry?: string;
  // IT-specific
  serialNo?: string;
  category?: string;
  condition?: string;
  leaseStatus: 'Partially Disbursed' | 'Disbursed' | 'Foreclosed';
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  contractNo: string;
  assetType: 'Vehicle' | 'IT';
  startDate: string;
  endDate: string;
  tenure: number;
  monthlyRental: number;
  totalValue: number;
  status: 'Active' | 'Expired' | 'Pending Renewal' | 'Terminated (Foreclosure)';
  assetsCount: number;
  costCenter: string;
  location: string;
  returnStatus?: 'Returned' | 'Pending Return' | 'Disposed';
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNo: string;
  contractNo: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
  generatedDate: string;
  costCenter: string;
  location: string;
  remarks?: string;
}

export interface Ticket {
  id: string;
  clientId: string;
  clientName: string;
  ticketNo: string;
  category: 'Vehicle' | 'IT' | 'Lease';
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  slaDeadline: string;
  assignedTo: string;
  costCenter: string;
  location: string;
  externalLink?: string;
  rating?: number;
  csatScore?: number;
}

export interface Document {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  type: string;
  category: 'Contract' | 'Insurance' | 'Registration' | 'Invoice' | 'TDS Certificate' | 'Other';
  uploadedAt: string;
  expiryDate?: string;
  version: number;
  size: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Master lists for global filters
export const costCenters = [
  'CC-MUM-001', 'CC-DEL-002', 'CC-BLR-003', 'CC-PUN-004', 'CC-HYD-005', 'CC-CHN-006',
];

export const locations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai',
];

export const clients: Client[] = [
  { id: 'c1', name: 'Qualtech Edge Ltd', code: 'QUALTECH' },
  { id: 'c2', name: 'Infosys Technologies', code: 'INFY' },
  { id: 'c3', name: 'Reliance Industries', code: 'RIL' },
  { id: 'c4', name: 'Wipro Limited', code: 'WIPRO' },
  { id: 'c5', name: 'Mahindra & Mahindra', code: 'M&M' },
];

const baseAssets: Asset[] = [
  // Core items preserved for explicit search / notification references
  { id: 'a1', clientId: 'c1', clientName: 'Qualtech Edge Ltd', type: 'Vehicle', assetTag: 'VH-001', category: 'Passenger Car', description: 'Toyota Innova Crysta', status: 'Active', location: 'Mumbai', costCenter: 'CC-MUM-001', assignedTo: 'Rajesh Kumar', leaseStartDate: '2024-01-15', leaseEndDate: '2027-01-14', registrationNo: 'MH-02-AB-1234', make: 'Toyota', model: 'Innova Crysta', driver: 'Suresh Patil', insuranceExpiry: '2025-06-30', leaseStatus: 'Disbursed' },
  { id: 'a10', clientId: 'c1', clientName: 'Qualtech Edge Ltd', type: 'IT', assetTag: 'IT-005', description: 'Dell Optiplex 7090 MFF', status: 'Active', location: 'Mumbai', costCenter: 'CC-MUM-001', assignedTo: 'Sunita Rao', leaseStartDate: '2023-11-01', leaseEndDate: '2026-10-31', serialNo: 'DL7090-48492', category: 'Desktop', condition: 'Good', leaseStatus: 'Disbursed' },
];

const baseContracts: Contract[] = [
  { id: 'ct1', clientId: 'c1', clientName: 'Qualtech Edge Ltd', contractNo: 'OL-2024-001', assetType: 'Vehicle', startDate: '2024-01-15', endDate: '2026-05-14', tenure: 36, monthlyRental: 45000, totalValue: 1620000, status: 'Disbursed', assetsCount: 2, costCenter: 'CC-MUM-001', location: 'Mumbai' },
];

const baseInvoices: Invoice[] = [
  { id: 'i1', clientId: 'c1', clientName: 'Qualtech Edge Ltd', invoiceNo: 'INV-2026-0401', contractNo: 'OL-2024-001', amount: 45000, generatedDate: '2026-03-25', dueDate: '2026-04-15', status: 'Pending', costCenter: 'CC-MUM-001', location: 'Mumbai' },
];

// GENERATOR FUNCTIONS 

const generateAssets = (count: number): Asset[] => {
  const result: Asset[] = [];
  const roles = ['Software Engineer', 'Manager', 'Direct Sales', 'Director', 'HR Exec', 'Tech Lead', 'Support Staff'];
  const vehicleMakes = ['Toyota', 'Honda', 'Tata', 'Mahindra', 'Hyundai', 'TVS', 'Bajaj', 'Royal Enfield'];
  const categories = ['Passenger Car', 'Commercial Vehicle', 'Two Wheeler - Bike', 'Two Wheeler - Scooty'];
  const statuses = ['Active', 'Under Maintenance', 'In Transit', 'Disposed'];
  const leaseStatuses = ['Partially Disbursed', 'Disbursed', 'Foreclosed'];
  
  for (let i = 0; i < count; i++) {
    const isVehicle = i % 2 === 0;
    const cl = clients[i % clients.length];
    const loc = locations[i % locations.length];
    const cc = costCenters[i % costCenters.length];
    
    const endDates = ['2025-03-31', '2026-09-30', '2026-12-31', '2027-01-01', '2028-06-30'];
    if (isVehicle) {
      const vCat = categories[i % categories.length];
      const model = vCat.includes('Bike') ? 'Motorcycle' : (vCat.includes('Scooty') ? 'Activa' : 'Sedan');
      result.push({
        id: `gen-a-${i}`, clientId: cl.id, clientName: cl.name, type: 'Vehicle',
        assetTag: `VH-GEN-${1000 + i}`, description: `${vehicleMakes[i % 8]} ${model}`,
        category: vCat, status: statuses[i % 4] as any, location: loc, costCenter: cc,
        assignedTo: roles[i % roles.length], leaseStartDate: '2024-01-01', leaseEndDate: endDates[i % 5],
        registrationNo: `${loc.substring(0,2).toUpperCase()}-1${i}-GEN`, make: vehicleMakes[i % 8], model: model,
        driver: `Driver ${i}`, insuranceExpiry: '2025-01-01', leaseStatus: leaseStatuses[i % 3] as any
      });
    } else {
      const isLaptop = i % 3 === 0;
      result.push({
        id: `gen-a-${i}`, clientId: cl.id, clientName: cl.name, type: 'IT',
        assetTag: `IT-GEN-${1000 + i}`, description: isLaptop ? 'Dell Latitude 5540' : 'Dell Optiplex',
        category: isLaptop ? 'Laptop' : 'Desktop', status: statuses[i % 4] as any, location: loc, costCenter: cc,
        assignedTo: roles[i % roles.length], leaseStartDate: '2024-01-01', leaseEndDate: endDates[i % 5],
        serialNo: `SNGEN-${i}`, condition: i % 2 === 0 ? 'Good' : 'Excellent', leaseStatus: leaseStatuses[i % 3] as any
      });
    }
  }
  return result;
}

const generateContracts = (count: number): Contract[] => {
  const result: Contract[] = [];
  const statuses = ['Partially Disbursed', 'Disbursed', 'Foreclosed'];
  const endDates = ['2025-03-31', '2026-09-30', '2026-12-31', '2027-01-01', '2028-06-30'];
  for (let i = 0; i < count; i++) {
    const cl = clients[i % clients.length];
    result.push({
      id: `gen-ct-${i}`, clientId: cl.id, clientName: cl.name, contractNo: `OL-GEN-${2000 + i}`,
      assetType: i % 2 === 0 ? 'Vehicle' : 'IT', startDate: '2024-01-01', endDate: endDates[i % 5],
      tenure: 36, monthlyRental: 25000 + (i * 1000), totalValue: (25000 + (i * 1000)) * 36,
      status: statuses[i % 3] as any, assetsCount: 2 + (i % 5), costCenter: costCenters[i % costCenters.length],
      location: locations[i % locations.length]
    });
  }
  return result;
}

const generateInvoices = (count: number): Invoice[] => {
  const result: Invoice[] = [];
  const statuses = ['Paid', 'Pending', 'Overdue'];
  for (let i = 0; i < count; i++) {
    const cl = clients[i % clients.length];
    result.push({
      id: `gen-inv-${i}`, clientId: cl.id, clientName: cl.name, invoiceNo: `INV-GEN-${3000 + i}`,
      contractNo: `OL-GEN-${2000 + (i % 50)}`, amount: 15000 + (i * 500), dueDate: '2026-05-01',
      status: statuses[i % 3] as any, generatedDate: '2026-04-01', 
      costCenter: costCenters[i % costCenters.length],
      location: locations[i % locations.length]
    });
  }
  return result;
}

export const assets = [...baseAssets, ...generateAssets(100)];
export const contracts = [...baseContracts, ...generateContracts(80)];
export const invoices = [...baseInvoices, ...generateInvoices(120)];

// Original Tickets & Docs preserved for standard workflow
export const tickets: Ticket[] = [
  { id: 't1', clientId: 'c1', clientName: 'Qualtech Edge Ltd', ticketNo: 'SR-2026-001', category: 'Vehicle', subject: 'Flat tyre replacement - VH-001', priority: 'High', status: 'Open', createdAt: '2026-04-10', slaDeadline: '2026-04-12', assignedTo: 'ORIX Service Desk', costCenter: 'CC-MUM-001', location: 'Mumbai', externalLink: 'https://orix-internal.service-now.com/sr/SR-2026-001' },
  { id: 't5', clientId: 'c1', clientName: 'Qualtech Edge Ltd', ticketNo: 'SR-2026-005', category: 'Vehicle', subject: 'Scheduled service due - VH-002', priority: 'Medium', status: 'Closed', createdAt: '2026-04-05', slaDeadline: '2026-04-10', assignedTo: 'ORIX Service Desk', costCenter: 'CC-DEL-002', location: 'Delhi', rating: 5, csatScore: 95 },
  { id: 't7', clientId: 'c1', clientName: 'Qualtech Edge Ltd', ticketNo: 'SR-2026-010', category: 'IT', subject: 'Laptop battery replacement - IT-005', priority: 'Medium', status: 'In Progress', createdAt: '2026-04-12', slaDeadline: '2026-04-15', assignedTo: 'Hardware Ops', costCenter: 'CC-MUM-001', location: 'Mumbai' },

  { id: 't2', clientId: 'c2', clientName: 'Infosys Technologies', ticketNo: 'SR-2026-002', category: 'IT', subject: 'Laptop screen flickering - IT-001', priority: 'Medium', status: 'In Progress', createdAt: '2026-04-08', slaDeadline: '2026-04-13', assignedTo: 'Tech Support', costCenter: 'CC-BLR-003', location: 'Bangalore' },
  { id: 't8', clientId: 'c2', clientName: 'Infosys Technologies', ticketNo: 'SR-2026-011', category: 'Lease', subject: 'Inquiry on bulk asset return', priority: 'Low', status: 'Open', createdAt: '2026-04-14', slaDeadline: '2026-04-20', assignedTo: 'Account Mgmt', costCenter: 'CC-BLR-003', location: 'Bangalore' },
];

export const documents: Document[] = [
  { id: 'd1', clientId: 'c1', clientName: 'Qualtech Edge Ltd', name: 'Lease Agreement - OL-2024-001', type: 'PDF', category: 'Contract', uploadedAt: '2024-01-15', expiryDate: '2027-01-14', version: 2, size: '2.4 MB' },
  { id: 'd2', clientId: 'c1', clientName: 'Qualtech Edge Ltd', name: 'Vehicle Insurance - VH-001', type: 'PDF', category: 'Insurance', uploadedAt: '2024-06-15', expiryDate: '2025-06-30', version: 1, size: '1.1 MB' },
  { id: 'd6', clientId: 'c1', clientName: 'Qualtech Edge Ltd', name: 'TDS Certificate - FY 2025-26 Q4', type: 'PDF', category: 'TDS Certificate', uploadedAt: '2026-04-05', version: 1, size: '0.3 MB' },
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'Invoice Overdue', message: 'Invoice INV-2026-0301 for Reliance Industries is overdue by 42 days', type: 'error', read: false, createdAt: '2026-04-12T09:00:00' },
  { id: 'n2', title: 'Contract Expiring Soon', message: 'Contract OL-2023-015 (Reliance Industries) expires in 3 days', type: 'warning', read: false, createdAt: '2026-04-11T14:30:00' },
  { id: 'n3', title: 'Payment Received', message: 'Payment of ₹28,000 received from Infosys Technologies', type: 'success', read: true, createdAt: '2026-04-10T10:15:00' },
];

export const faqItems: FAQItem[] = [
  { id: 'faq1', question: 'How do I request a lease extension?', answer: 'To request a lease extension, navigate to Lease Management, find your active contract, and click the "Amendment/Extension" button. Fill in the extension details and submit for approval. The ORIX team will review and respond within 2-3 business days.', category: 'Lease' },
  { id: 'faq2', question: 'What happens at the end of a lease term?', answer: 'At the end of a lease term, you have three options: (1) Return the asset, (2) Extend the lease, or (3) Request a buyout at residual value. You can initiate any of these through the Lease Management section of the portal.', category: 'Lease' },
];

export const dashboardKPIs = {
  totalLeases: 0,
  activeLeases: 0,
  totalAssets: 0,
  totalLeaseValue: 0,
  pendingTickets: 0,
  overdueInvoices: 0,
  overdueAmount: 0,
  assetsByType: { Vehicle: 0, IT: 0 },
  assetsByStatus: { Active: 0, 'Under Maintenance': 0, 'In Transit': 0 },
};
