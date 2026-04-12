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
  status: 'Active' | 'Expired' | 'Pending Renewal' | 'Terminated';
  assetsCount: number;
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
}

export interface Document {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  type: string;
  category: 'Contract' | 'Insurance' | 'Registration' | 'Invoice' | 'Other';
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

export const clients: Client[] = [
  { id: 'c1', name: 'Tata Motors Ltd', code: 'TATA' },
  { id: 'c2', name: 'Infosys Technologies', code: 'INFY' },
  { id: 'c3', name: 'Reliance Industries', code: 'RIL' },
  { id: 'c4', name: 'Wipro Limited', code: 'WIPRO' },
  { id: 'c5', name: 'Mahindra & Mahindra', code: 'M&M' },
];

export const assets: Asset[] = [
  { id: 'a1', clientId: 'c1', clientName: 'Tata Motors Ltd', type: 'Vehicle', assetTag: 'VH-001', description: 'Toyota Innova Crysta', status: 'Active', location: 'Mumbai', assignedTo: 'Rajesh Kumar', leaseStartDate: '2024-01-15', leaseEndDate: '2027-01-14', registrationNo: 'MH-02-AB-1234', make: 'Toyota', model: 'Innova Crysta', driver: 'Suresh Patil', insuranceExpiry: '2025-06-30' },
  { id: 'a2', clientId: 'c1', clientName: 'Tata Motors Ltd', type: 'Vehicle', assetTag: 'VH-002', description: 'Maruti Suzuki Ertiga', status: 'Active', location: 'Delhi', assignedTo: 'Amit Sharma', leaseStartDate: '2024-03-01', leaseEndDate: '2027-02-28', registrationNo: 'DL-03-CD-5678', make: 'Maruti Suzuki', model: 'Ertiga', driver: 'Vikram Singh', insuranceExpiry: '2025-08-15' },
  { id: 'a3', clientId: 'c2', clientName: 'Infosys Technologies', type: 'IT', assetTag: 'IT-001', description: 'Dell Latitude 5540 Laptop', status: 'Active', location: 'Bangalore', assignedTo: 'Priya Mehta', leaseStartDate: '2024-06-01', leaseEndDate: '2027-05-31', serialNo: 'DL5540-78923', category: 'Laptop', condition: 'Good' },
  { id: 'a4', clientId: 'c2', clientName: 'Infosys Technologies', type: 'IT', assetTag: 'IT-002', description: 'HP ProDesk 400 Desktop', status: 'Under Maintenance', location: 'Pune', assignedTo: 'Rahul Joshi', leaseStartDate: '2023-09-01', leaseEndDate: '2026-08-31', serialNo: 'HP400-45612', category: 'Desktop', condition: 'Fair' },
  { id: 'a5', clientId: 'c3', clientName: 'Reliance Industries', type: 'Vehicle', assetTag: 'VH-003', description: 'Hyundai Creta', status: 'Active', location: 'Mumbai', assignedTo: 'Sneha Reddy', leaseStartDate: '2024-02-01', leaseEndDate: '2027-01-31', registrationNo: 'MH-04-EF-9012', make: 'Hyundai', model: 'Creta', driver: 'Manoj Yadav', insuranceExpiry: '2025-05-20' },
  { id: 'a6', clientId: 'c3', clientName: 'Reliance Industries', type: 'IT', assetTag: 'IT-003', description: 'Lenovo ThinkPad X1 Carbon', status: 'Active', location: 'Hyderabad', assignedTo: 'Deepak Nair', leaseStartDate: '2024-04-15', leaseEndDate: '2027-04-14', serialNo: 'LNV-X1-33456', category: 'Laptop', condition: 'Excellent' },
  { id: 'a7', clientId: 'c4', clientName: 'Wipro Limited', type: 'Vehicle', assetTag: 'VH-004', description: 'Honda City', status: 'In Transit', location: 'Chennai', assignedTo: 'Kavita Iyer', leaseStartDate: '2024-05-01', leaseEndDate: '2027-04-30', registrationNo: 'TN-09-GH-3456', make: 'Honda', model: 'City', driver: 'Ravi Kumar', insuranceExpiry: '2025-09-10' },
  { id: 'a8', clientId: 'c5', clientName: 'Mahindra & Mahindra', type: 'IT', assetTag: 'IT-004', description: 'Apple MacBook Pro 14"', status: 'Active', location: 'Mumbai', assignedTo: 'Anita Deshmukh', leaseStartDate: '2024-07-01', leaseEndDate: '2027-06-30', serialNo: 'APL-MBP-88901', category: 'Laptop', condition: 'Excellent' },
];

export const contracts: Contract[] = [
  { id: 'ct1', clientId: 'c1', clientName: 'Tata Motors Ltd', contractNo: 'OL-2024-001', assetType: 'Vehicle', startDate: '2024-01-15', endDate: '2027-01-14', tenure: 36, monthlyRental: 45000, totalValue: 1620000, status: 'Active', assetsCount: 2 },
  { id: 'ct2', clientId: 'c2', clientName: 'Infosys Technologies', contractNo: 'OL-2024-002', assetType: 'IT', startDate: '2024-06-01', endDate: '2027-05-31', tenure: 36, monthlyRental: 28000, totalValue: 1008000, status: 'Active', assetsCount: 5 },
  { id: 'ct3', clientId: 'c3', clientName: 'Reliance Industries', contractNo: 'OL-2023-015', assetType: 'Vehicle', startDate: '2023-04-01', endDate: '2026-03-31', tenure: 36, monthlyRental: 52000, totalValue: 1872000, status: 'Pending Renewal', assetsCount: 3 },
  { id: 'ct4', clientId: 'c4', clientName: 'Wipro Limited', contractNo: 'OL-2024-003', assetType: 'Vehicle', startDate: '2024-05-01', endDate: '2027-04-30', tenure: 36, monthlyRental: 35000, totalValue: 1260000, status: 'Active', assetsCount: 1 },
  { id: 'ct5', clientId: 'c5', clientName: 'Mahindra & Mahindra', contractNo: 'OL-2024-004', assetType: 'IT', startDate: '2024-07-01', endDate: '2027-06-30', tenure: 36, monthlyRental: 62000, totalValue: 2232000, status: 'Active', assetsCount: 8 },
  { id: 'ct6', clientId: 'c1', clientName: 'Tata Motors Ltd', contractNo: 'OL-2022-009', assetType: 'IT', startDate: '2022-06-01', endDate: '2025-05-31', tenure: 36, monthlyRental: 18000, totalValue: 648000, status: 'Expired', assetsCount: 3 },
];

export const invoices: Invoice[] = [
  { id: 'i1', clientId: 'c1', clientName: 'Tata Motors Ltd', invoiceNo: 'INV-2026-0401', contractNo: 'OL-2024-001', amount: 45000, dueDate: '2026-04-15', status: 'Pending' },
  { id: 'i2', clientId: 'c2', clientName: 'Infosys Technologies', invoiceNo: 'INV-2026-0402', contractNo: 'OL-2024-002', amount: 28000, dueDate: '2026-04-01', status: 'Paid', paidDate: '2026-03-29' },
  { id: 'i3', clientId: 'c3', clientName: 'Reliance Industries', invoiceNo: 'INV-2026-0301', contractNo: 'OL-2023-015', amount: 52000, dueDate: '2026-03-01', status: 'Overdue' },
  { id: 'i4', clientId: 'c4', clientName: 'Wipro Limited', invoiceNo: 'INV-2026-0403', contractNo: 'OL-2024-003', amount: 35000, dueDate: '2026-04-20', status: 'Pending' },
  { id: 'i5', clientId: 'c5', clientName: 'Mahindra & Mahindra', invoiceNo: 'INV-2026-0404', contractNo: 'OL-2024-004', amount: 62000, dueDate: '2026-04-01', status: 'Paid', paidDate: '2026-03-30' },
  { id: 'i6', clientId: 'c1', clientName: 'Tata Motors Ltd', invoiceNo: 'INV-2026-0301', contractNo: 'OL-2024-001', amount: 45000, dueDate: '2026-03-15', status: 'Paid', paidDate: '2026-03-14' },
  { id: 'i7', clientId: 'c3', clientName: 'Reliance Industries', invoiceNo: 'INV-2026-0201', contractNo: 'OL-2023-015', amount: 52000, dueDate: '2026-02-01', status: 'Overdue' },
];

export const tickets: Ticket[] = [
  { id: 't1', clientId: 'c1', clientName: 'Tata Motors Ltd', ticketNo: 'SR-2026-001', category: 'Vehicle', subject: 'Flat tyre replacement - VH-001', priority: 'High', status: 'Open', createdAt: '2026-04-10', slaDeadline: '2026-04-12', assignedTo: 'ORIX Service Desk' },
  { id: 't2', clientId: 'c2', clientName: 'Infosys Technologies', ticketNo: 'SR-2026-002', category: 'IT', subject: 'Laptop screen flickering - IT-001', priority: 'Medium', status: 'In Progress', createdAt: '2026-04-08', slaDeadline: '2026-04-13', assignedTo: 'Tech Support' },
  { id: 't3', clientId: 'c3', clientName: 'Reliance Industries', ticketNo: 'SR-2026-003', category: 'Lease', subject: 'Contract renewal inquiry - OL-2023-015', priority: 'Low', status: 'Open', createdAt: '2026-04-09', slaDeadline: '2026-04-16', assignedTo: 'Lease Team' },
  { id: 't4', clientId: 'c4', clientName: 'Wipro Limited', ticketNo: 'SR-2026-004', category: 'Vehicle', subject: 'Insurance claim assistance - VH-004', priority: 'Critical', status: 'In Progress', createdAt: '2026-04-07', slaDeadline: '2026-04-09', assignedTo: 'Claims Dept' },
  { id: 't5', clientId: 'c1', clientName: 'Tata Motors Ltd', ticketNo: 'SR-2026-005', category: 'Vehicle', subject: 'Scheduled service due - VH-002', priority: 'Medium', status: 'Resolved', createdAt: '2026-04-05', slaDeadline: '2026-04-10', assignedTo: 'ORIX Service Desk' },
];

export const documents: Document[] = [
  { id: 'd1', clientId: 'c1', clientName: 'Tata Motors Ltd', name: 'Lease Agreement - OL-2024-001', type: 'PDF', category: 'Contract', uploadedAt: '2024-01-15', expiryDate: '2027-01-14', version: 2, size: '2.4 MB' },
  { id: 'd2', clientId: 'c1', clientName: 'Tata Motors Ltd', name: 'Vehicle Insurance - VH-001', type: 'PDF', category: 'Insurance', uploadedAt: '2024-06-15', expiryDate: '2025-06-30', version: 1, size: '1.1 MB' },
  { id: 'd3', clientId: 'c2', clientName: 'Infosys Technologies', name: 'IT Asset Lease Agreement', type: 'PDF', category: 'Contract', uploadedAt: '2024-06-01', expiryDate: '2027-05-31', version: 1, size: '3.2 MB' },
  { id: 'd4', clientId: 'c3', clientName: 'Reliance Industries', name: 'Registration Certificate - VH-003', type: 'PDF', category: 'Registration', uploadedAt: '2024-02-01', version: 1, size: '0.8 MB' },
  { id: 'd5', clientId: 'c5', clientName: 'Mahindra & Mahindra', name: 'Quarterly Invoice Summary Q1', type: 'XLSX', category: 'Invoice', uploadedAt: '2026-04-01', version: 1, size: '0.5 MB' },
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'Invoice Overdue', message: 'Invoice INV-2026-0301 for Reliance Industries is overdue by 42 days', type: 'error', read: false, createdAt: '2026-04-12T09:00:00' },
  { id: 'n2', title: 'Contract Expiring Soon', message: 'Contract OL-2023-015 (Reliance Industries) expires in 3 days', type: 'warning', read: false, createdAt: '2026-04-11T14:30:00' },
  { id: 'n3', title: 'Payment Received', message: 'Payment of ₹28,000 received from Infosys Technologies', type: 'success', read: true, createdAt: '2026-04-10T10:15:00' },
  { id: 'n4', title: 'SLA Breach Alert', message: 'Ticket SR-2026-004 has breached SLA deadline', type: 'error', read: false, createdAt: '2026-04-09T16:00:00' },
  { id: 'n5', title: 'New Ticket Assigned', message: 'Ticket SR-2026-001 has been assigned to ORIX Service Desk', type: 'info', read: true, createdAt: '2026-04-10T11:00:00' },
  { id: 'n6', title: 'Insurance Expiry Reminder', message: 'Vehicle VH-001 insurance expires on 30 Jun 2025', type: 'warning', read: false, createdAt: '2026-04-08T08:00:00' },
  { id: 'n7', title: 'Document Uploaded', message: 'Quarterly Invoice Summary Q1 uploaded for Mahindra & Mahindra', type: 'info', read: true, createdAt: '2026-04-01T12:00:00' },
];

export const dashboardKPIs = {
  totalLeases: 6,
  activeLeases: 4,
  totalAssets: 8,
  totalLeaseValue: 8640000,
  pendingTickets: 3,
  overdueInvoices: 2,
  overdueAmount: 104000,
  assetsByType: { Vehicle: 4, IT: 4 },
  assetsByStatus: { Active: 6, 'Under Maintenance': 1, 'In Transit': 1 },
};
