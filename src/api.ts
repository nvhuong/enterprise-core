import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // Relative path to use the same origin (proxied by Vite/Express)
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Company {
  id: string;
  name: string;
  company_type: 'LIMITED' | 'JOINT_STOCK' | 'GROUP';
  tax_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const companyService = {
  getAll: async () => {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  create: async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<Company>('/companies', company);
    return response.data;
  },

  update: async (id: string, company: Partial<Company>) => {
    const response = await api.put<Company>(`/companies/${id}`, company);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/companies/${id}`);
  }
};

export interface OrganizationUnit {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  unit_type: string;
  level: number;
  path: string;
  created_at: string;
}

export const organizationService = {
  getAll: async (companyId: string) => {
    const response = await api.get<OrganizationUnit[]>(`/companies/${companyId}/units`);
    return response.data;
  },
  create: async (companyId: string, data: Partial<OrganizationUnit>) => {
    const response = await api.post<OrganizationUnit>(`/companies/${companyId}/units`, data);
    return response.data;
  },
  update: async (id: string, data: Partial<OrganizationUnit>) => {
    const response = await api.put<OrganizationUnit>(`/units/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/units/${id}`);
  }
};

export interface Role {
  id: string;
  company_id: string;
  name: string;
  description: string;
  scope_type: 'SELF' | 'CUSTOM';
  is_default: number;
  created_at: string;
}

export const roleService = {
  getAll: async (companyId: string) => {
    const response = await api.get<Role[]>(`/companies/${companyId}/roles`);
    return response.data;
  },
  create: async (companyId: string, data: Partial<Role>) => {
    const response = await api.post<Role>(`/companies/${companyId}/roles`, data);
    return response.data;
  },
  update: async (id: string, data: Partial<Role>) => {
    const response = await api.put<Role>(`/roles/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/roles/${id}`);
  }
};

export interface Feature {
  id: string;
  service_id: string;
  code: string;
  name: string;
  service_name?: string;
  is_active: number;
}

export interface PermissionType {
  id: string;
  code: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  feature_id: string;
  permission_type_id: string;
  is_allowed: number;
  feature_code?: string;
  permission_code?: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: number;
}

export const mockServices: Service[] = [
  { id: 'hrm', code: 'HRM', name: 'Human Resource Management', description: 'Manage employees, payroll, and attendance', is_active: 1 },
  { id: 'crm', code: 'CRM', name: 'Customer Relationship Management', description: 'Track leads, opportunities, and customer interactions', is_active: 1 },
  { id: 'erp', code: 'ERP', name: 'Enterprise Resource Planning', description: 'Integrated management of main business processes', is_active: 1 },
  { id: 'project', code: 'PM', name: 'Project Management', description: 'Plan, track, and collaborate on projects', is_active: 1 },
  { id: 'acct', code: 'ACCT', name: 'Accounting & Finance', description: 'Manage finances, invoices, and expenses', is_active: 1 },
  { id: 'inv', code: 'INV', name: 'Inventory Management', description: 'Track stock levels, orders, and sales', is_active: 1 },
  { id: 'mkt', code: 'MKT', name: 'Marketing Automation', description: 'Automate marketing campaigns and lead nurturing', is_active: 0 },
  { id: 'help', code: 'HELP', name: 'Help Desk', description: 'Customer support and ticket management', is_active: 0 },
  { id: 'doc', code: 'DOC', name: 'Document Management', description: 'Store, manage, and track electronic documents', is_active: 1 },
  { id: 'wiki', code: 'WIKI', name: 'Knowledge Base', description: 'Internal wiki and knowledge sharing', is_active: 1 },
];

export const mockFeatures: Feature[] = [
  // HRM Features
  { id: 'hrm_1', service_id: 'hrm', code: 'EMP_MGT', name: 'Employee Management', service_name: 'Human Resource Management', is_active: 1 },
  { id: 'hrm_2', service_id: 'hrm', code: 'PAYROLL', name: 'Payroll Processing', service_name: 'Human Resource Management', is_active: 1 },
  { id: 'hrm_3', service_id: 'hrm', code: 'LEAVE', name: 'Leave Management', service_name: 'Human Resource Management', is_active: 1 },
  { id: 'hrm_4', service_id: 'hrm', code: 'ATTEND', name: 'Attendance Tracking', service_name: 'Human Resource Management', is_active: 1 },
  { id: 'hrm_5', service_id: 'hrm', code: 'RECRUIT', name: 'Recruitment', service_name: 'Human Resource Management', is_active: 0 },
  
  // CRM Features
  { id: 'crm_1', service_id: 'crm', code: 'LEAD_MGT', name: 'Lead Management', service_name: 'Customer Relationship Management', is_active: 1 },
  { id: 'crm_2', service_id: 'crm', code: 'OPP_MGT', name: 'Opportunity Tracking', service_name: 'Customer Relationship Management', is_active: 1 },
  { id: 'crm_3', service_id: 'crm', code: 'CONT_MGT', name: 'Contact Management', service_name: 'Customer Relationship Management', is_active: 1 },
  { id: 'crm_4', service_id: 'crm', code: 'EMAIL', name: 'Email Integration', service_name: 'Customer Relationship Management', is_active: 1 },
  
  // ERP Features
  { id: 'erp_1', service_id: 'erp', code: 'PROCURE', name: 'Procurement', service_name: 'Enterprise Resource Planning', is_active: 1 },
  { id: 'erp_2', service_id: 'erp', code: 'SUPPLY', name: 'Supply Chain', service_name: 'Enterprise Resource Planning', is_active: 1 },
  { id: 'erp_3', service_id: 'erp', code: 'MFG', name: 'Manufacturing', service_name: 'Enterprise Resource Planning', is_active: 0 },
  
  // Project Features
  { id: 'pm_1', service_id: 'project', code: 'TASK', name: 'Task Management', service_name: 'Project Management', is_active: 1 },
  { id: 'pm_2', service_id: 'project', code: 'GANTT', name: 'Gantt Charts', service_name: 'Project Management', is_active: 1 },
  { id: 'pm_3', service_id: 'project', code: 'TIME', name: 'Time Tracking', service_name: 'Project Management', is_active: 1 },
  { id: 'pm_4', service_id: 'project', code: 'AGILE', name: 'Agile Boards', service_name: 'Project Management', is_active: 1 },

  // Accounting Features
  { id: 'acct_1', service_id: 'acct', code: 'GL', name: 'General Ledger', service_name: 'Accounting & Finance', is_active: 1 },
  { id: 'acct_2', service_id: 'acct', code: 'AP', name: 'Accounts Payable', service_name: 'Accounting & Finance', is_active: 1 },
  { id: 'acct_3', service_id: 'acct', code: 'AR', name: 'Accounts Receivable', service_name: 'Accounting & Finance', is_active: 1 },
  
  // Inventory Features
  { id: 'inv_1', service_id: 'inv', code: 'STOCK', name: 'Stock Tracking', service_name: 'Inventory Management', is_active: 1 },
  { id: 'inv_2', service_id: 'inv', code: 'BARCODE', name: 'Barcode Scanning', service_name: 'Inventory Management', is_active: 1 },

  // Document Features
  { id: 'doc_1', service_id: 'doc', code: 'VER', name: 'Version Control', service_name: 'Document Management', is_active: 1 },
  { id: 'doc_2', service_id: 'doc', code: 'SHARE', name: 'File Sharing', service_name: 'Document Management', is_active: 1 },
];

export const serviceService = {
  getAll: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockServices];
  },
  toggle: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const service = mockServices.find(s => s.id === id);
    if (service) {
      service.is_active = service.is_active ? 0 : 1;
      return { success: true, is_active: service.is_active };
    }
    throw new Error('Service not found');
  }
};

export const permissionService = {
  getFeatures: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockFeatures];
  },
  toggleFeature: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const feature = mockFeatures.find(f => f.id === id);
    if (feature) {
      feature.is_active = feature.is_active ? 0 : 1;
      return { success: true, is_active: feature.is_active };
    }
    throw new Error('Feature not found');
  },
  getPermissionTypes: async () => {
    const response = await api.get<PermissionType[]>('/permission-types');
    return response.data;
  },
  getRolePermissions: async (roleId: string) => {
    const response = await api.get<RolePermission[]>(`/roles/${roleId}/permissions`);
    return response.data;
  },
  updateRolePermissions: async (roleId: string, permissions: Partial<RolePermission>[]) => {
    const response = await api.post(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  }
};
