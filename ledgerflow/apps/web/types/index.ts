export interface Tenant {
  id: string;
  name: string;
  slug: string;
  invitation_code: string;
  plan: 'free' | 'pro' | 'enterprise';
  max_clients: number;
  max_projects: number;
  max_storage_mb: number;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'accountant' | 'viewer';
  full_name: string | null;
  avatar_url: string | null;
  preferences: {
    theme: 'dark' | 'light';
    language: string;
  };
  last_login: string | null;
  is_active: boolean;
}

export interface Client {
  id: string;
  tenant_id: string;
  access_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  tax_id: string | null;
  preferences: {
    notifications: boolean;
    language: string;
    channels: string[];
  };
  last_access: string | null;
  access_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  tenant_id: string;
  client_id: string | null;
  client?: Client;
  title: string;
  description: string | null;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number | null;
  spent: number;
  estimated_hours: number | null;
  logged_hours: number;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  due_date: string | null;
  tags: string[];
  created_at: string;
}

export interface Task {
  id: string;
  tenant_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id: string | null;
  assignee?: User;
  estimated_hours: number | null;
  logged_hours: number;
  due_date: string | null;
  completed_at: string | null;
  position: number;
  tags: string[];
  created_at: string;
}

export interface Document {
  id: string;
  tenant_id: string;
  client_id: string | null;
  project_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string | null;
  storage_url: string;
  status: 'uploaded' | 'processing' | 'processed' | 'verified' | 'error';
  document_type: 'invoice' | 'receipt' | 'expense' | 'contract' | 'other' | null;
  extracted_data: {
    vendor_name?: string;
    tax_id?: string;
    date?: string;
    invoice_number?: string;
    items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;
    subtotal?: number;
    tax_amount?: number;
    total?: number;
    currency?: string;
  } | null;
  raw_text: string | null;
  confidence: number | null;
  is_verified: boolean;
  notes: string | null;
  tags: string[];
  created_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  project_id: string | null;
  document_id: string | null;
  client_id: string | null;
  type: 'income' | 'expense' | 'transfer' | 'refund';
  category: string | null;
  subcategory: string | null;
  amount: number;
  currency: string;
  amount_eur: number | null;
  date: string;
  description: string | null;
  vendor_name: string | null;
  vendor_tax_id: string | null;
  invoice_number: string | null;
  is_reconciled: boolean;
  source: 'manual' | 'email' | 'upload' | 'bank_sync' | 'api';
  created_at: string;
}

export interface Activity {
  id: string;
  tenant_id: string;
  project_id: string | null;
  client_id: string | null;
  user_id: string | null;
  document_id: string | null;
  transaction_id: string | null;
  type: string;
  title: string;
  description: string | null;
  metadata: any;
  is_visible_to_client: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  activeProjects: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface CashFlowData {
  labels: string[];
  income: number[];
  expenses: number[];
}
