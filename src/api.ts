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

export const mockCompanies: Company[] = [
  { id: 'comp_1', name: 'Global Tech Solutions', company_type: 'GROUP', tax_code: '123456789', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'comp_2', name: 'Innovation Hub', company_type: 'LIMITED', tax_code: '987654321', status: 'ACTIVE', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id: 'comp_3', name: 'Enterprise Corp', company_type: 'JOINT_STOCK', tax_code: '456789123', status: 'ACTIVE', created_at: '2024-03-01', updated_at: '2024-03-01' },
];

export const companyService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockCompanies];
  },

  getById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const company = mockCompanies.find(c => c.id === id);
    if (!company) throw new Error('Company not found');
    return company;
  },

  create: async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newCompany: Company = {
      ...company,
      id: `comp_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCompanies.push(newCompany);
    return newCompany;
  },

  update: async (id: string, company: Partial<Company>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockCompanies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    mockCompanies[index] = { ...mockCompanies[index], ...company, updated_at: new Date().toISOString() };
    return mockCompanies[index];
  },

  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCompanies.findIndex(c => c.id === id);
    if (index !== -1) mockCompanies.splice(index, 1);
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

export interface UnitType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string;
}

export const mockUnitTypes: UnitType[] = [
  { id: 'ut_1', company_id: 'comp_1', name: 'Headquarters', code: 'HQ', description: 'Main office' },
  { id: 'ut_2', company_id: 'comp_1', name: 'Department', code: 'DEPT', description: 'Functional department' },
  { id: 'ut_3', company_id: 'comp_1', name: 'Branch', code: 'BRANCH', description: 'Regional branch' },
  { id: 'ut_4', company_id: 'comp_1', name: 'Team', code: 'TEAM', description: 'Small working group' },
];

export const unitTypeService = {
  getAll: async (companyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUnitTypes.filter(ut => ut.company_id === companyId);
  },
  create: async (companyId: string, data: Partial<UnitType>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newType: UnitType = {
      id: `ut_${Math.random().toString(36).substr(2, 9)}`,
      company_id: companyId,
      name: data.name || 'New Type',
      code: data.code || 'CODE',
      description: data.description || '',
    };
    mockUnitTypes.push(newType);
    return newType;
  },
  update: async (id: string, data: Partial<UnitType>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockUnitTypes.findIndex(ut => ut.id === id);
    if (index === -1) throw new Error('Unit type not found');
    mockUnitTypes[index] = { ...mockUnitTypes[index], ...data };
    return mockUnitTypes[index];
  },
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockUnitTypes.findIndex(ut => ut.id === id);
    if (index !== -1) mockUnitTypes.splice(index, 1);
  }
};

export const mockUnits: OrganizationUnit[] = [
  { id: 'unit_1', company_id: 'comp_1', parent_id: null, name: 'Headquarters', unit_type: 'HQ', level: 1, path: 'unit_1', created_at: '2024-01-01' },
  { id: 'unit_2', company_id: 'comp_1', parent_id: 'unit_1', name: 'Sales Department', unit_type: 'DEPT', level: 2, path: 'unit_1/unit_2', created_at: '2024-01-02' },
  { id: 'unit_3', company_id: 'comp_1', parent_id: 'unit_1', name: 'IT Department', unit_type: 'DEPT', level: 2, path: 'unit_1/unit_3', created_at: '2024-01-03' },
];

export const organizationService = {
  getAll: async (companyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockUnits.filter(u => u.company_id === companyId);
  },
  create: async (companyId: string, data: Partial<OrganizationUnit>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const id = `unit_${Math.random().toString(36).substr(2, 9)}`;
    const parent = data.parent_id ? mockUnits.find(u => u.id === data.parent_id) : null;
    
    const newUnit: OrganizationUnit = {
      id,
      company_id: companyId,
      parent_id: data.parent_id || null,
      name: data.name || 'New Unit',
      unit_type: data.unit_type || 'DEPARTMENT',
      level: parent ? parent.level + 1 : 1,
      path: parent ? `${parent.path}/${id}` : id,
      created_at: new Date().toISOString(),
    };
    mockUnits.push(newUnit);
    return newUnit;
  },
  update: async (id: string, data: Partial<OrganizationUnit>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUnits.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Unit not found');
    mockUnits[index] = { ...mockUnits[index], ...data };
    return mockUnits[index];
  },
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockUnits.findIndex(u => u.id === id);
    if (index !== -1) mockUnits.splice(index, 1);
  }
};

export interface Role {
  id: string;
  company_id: string;
  name: string;
  description: string;
  is_default: number;
  status: string;
  created_at: string;
}

export const mockRoles: Role[] = [
  { id: 'role_1', company_id: 'comp_1', name: 'Administrator', description: 'Full access to all features', is_default: 1, status: 'ACTIVE', created_at: '2024-01-01' },
  { id: 'role_2', company_id: 'comp_1', name: 'Manager', description: 'Access to management features', is_default: 0, status: 'ACTIVE', created_at: '2024-01-02' },
  { id: 'role_3', company_id: 'comp_1', name: 'Employee', description: 'Standard employee access', is_default: 0, status: 'ACTIVE', created_at: '2024-01-03' },
];

export const roleService = {
  getAll: async (companyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockRoles.filter(r => r.company_id === companyId);
  },
  create: async (companyId: string, data: Partial<Role>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newRole: Role = {
      id: `role_${Math.random().toString(36).substr(2, 9)}`,
      company_id: companyId,
      name: data.name || 'New Role',
      description: data.description || '',
      is_default: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };
    mockRoles.push(newRole);
    return newRole;
  },
  update: async (id: string, data: Partial<Role>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockRoles.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role not found');
    mockRoles[index] = { ...mockRoles[index], ...data };
    return mockRoles[index];
  },
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) mockRoles.splice(index, 1);
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

export interface Employee {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  positions: EmployeePosition[];
}

export interface EmployeePosition {
  employee_id: string;
  role_id: string;
  organization_unit_id: string;
  title: string;
  role_name?: string;
  unit_name?: string;
}

export const mockEmployees: Employee[] = [
  { 
    id: 'emp_1', 
    company_id: 'comp_1', 
    full_name: 'Admin User', 
    email: 'admin@enterprise.com', 
    phone: '0123456789', 
    status: 'ACTIVE', 
    created_at: '2024-01-01',
    positions: [
      { employee_id: 'emp_1', role_id: 'role_1', organization_unit_id: 'unit_1', title: 'System Administrator' }
    ]
  },
  { 
    id: 'emp_2', 
    company_id: 'comp_1', 
    full_name: 'John Doe', 
    email: 'john@enterprise.com', 
    phone: '0987654321', 
    status: 'ACTIVE', 
    created_at: '2024-01-02',
    positions: [
      { employee_id: 'emp_2', role_id: 'role_2', organization_unit_id: 'unit_2', title: 'Sales Manager' },
      { employee_id: 'emp_2', role_id: 'role_3', organization_unit_id: 'unit_3', title: 'IT Support (Acting)' }
    ]
  },
];

export const employeeService = {
  getAll: async (companyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockEmployees
      .filter(e => e.company_id === companyId)
      .map(e => ({
        ...e,
        positions: e.positions.map(p => ({
          ...p,
          unit_name: mockUnits.find(u => u.id === p.organization_unit_id)?.name,
          role_name: mockRoles.find(r => r.id === p.role_id)?.name,
        }))
      }));
  },
  create: async (companyId: string, data: Partial<Employee>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const id = `emp_${Math.random().toString(36).substr(2, 9)}`;
    const newEmployee: Employee = {
      id,
      company_id: companyId,
      full_name: data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      positions: (data.positions || []).map(p => ({ ...p, employee_id: id })),
    };
    mockEmployees.push(newEmployee);
    return newEmployee;
  },
  update: async (id: string, data: Partial<Employee>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    
    const updatedPositions = data.positions 
      ? data.positions.map(p => ({ ...p, employee_id: id }))
      : mockEmployees[index].positions;

    mockEmployees[index] = { 
      ...mockEmployees[index], 
      ...data, 
      positions: updatedPositions 
    };
    return mockEmployees[index];
  },
  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index !== -1) mockEmployees.splice(index, 1);
  },
  toggleStatus: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    mockEmployees[index].status = mockEmployees[index].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return mockEmployees[index];
  }
};

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
  { id: 'asset', code: 'ASSET', name: 'Asset Management', description: 'Track and manage physical assets across the organization.', is_active: 1 },
  { id: 'fleet', code: 'FLEET', name: 'Fleet Management', description: 'Manage company vehicles, maintenance, and fuel tracking.', is_active: 1 },
  { id: 'bi', code: 'BI', name: 'Business Intelligence', description: 'Advanced analytics, data visualization, and reporting.', is_active: 1 },
  { id: 'ecommerce', code: 'ECOM', name: 'E-commerce Platform', description: 'Online store management, orders, and payments.', is_active: 0 },
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
  ...Array.from({ length: 150 }).map((_, i) => ({
    id: `erp_extra_${i}`,
    service_id: 'erp',
    code: `ERP_FEAT_${i}`,
    name: `ERP Advanced Feature ${i + 1}`,
    service_name: 'Enterprise Resource Planning',
    is_active: Math.random() > 0.3 ? 1 : 0
  })),
  
  // Project Features
  { id: 'pm_1', service_id: 'project', code: 'TASK', name: 'Task Management', service_name: 'Project Management', is_active: 1 },
  { id: 'pm_2', service_id: 'project', code: 'GANTT', name: 'Gantt Charts', service_name: 'Project Management', is_active: 1 },
  { id: 'pm_3', service_id: 'project', code: 'TIME', name: 'Time Tracking', service_name: 'Project Management', is_active: 1 },
  { id: 'pm_4', service_id: 'project', code: 'AGILE', name: 'Agile Boards', service_name: 'Project Management', is_active: 1 },

  // BI Features
  ...Array.from({ length: 80 }).map((_, i) => ({
    id: `bi_extra_${i}`,
    service_id: 'bi',
    code: `BI_DASH_${i}`,
    name: `BI Dashboard ${i + 1}`,
    service_name: 'Business Intelligence',
    is_active: 1
  })),

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
  getAll: async (companyId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, we would filter by companyId or return company-specific status
    console.log(`Fetching services for company: ${companyId}`);
    return [...mockServices];
  },
  toggle: async (companyId: string, serviceId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Toggling service ${serviceId} for company ${companyId}`);
    const service = mockServices.find(s => s.id === serviceId);
    if (service) {
      service.is_active = service.is_active ? 0 : 1;
      return { success: true, is_active: service.is_active };
    }
    throw new Error('Service not found');
  }
};

export const mockPermissionTypes: PermissionType[] = [
  { id: 'pt_1', code: 'VIEW' },
  { id: 'pt_2', code: 'CREATE' },
  { id: 'pt_3', code: 'EDIT' },
  { id: 'pt_4', code: 'DELETE' },
  { id: 'pt_5', code: 'IMPORT' },
  { id: 'pt_6', code: 'EXPORT' },
];

export const mockRolePermissions: RolePermission[] = [
  { id: 'rp_1', role_id: 'role_1', feature_id: 'hrm_1', permission_type_id: 'pt_1', is_allowed: 1 },
  { id: 'rp_2', role_id: 'role_1', feature_id: 'hrm_1', permission_type_id: 'pt_2', is_allowed: 1 },
];

export const permissionService = {
  getFeatures: async (companyId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (companyId) {
      console.log(`Fetching features for company: ${companyId}`);
    }
    return [...mockFeatures];
  },
  toggleFeature: async (companyId: string, featureId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Toggling feature ${featureId} for company ${companyId}`);
    const feature = mockFeatures.find(f => f.id === featureId);
    if (feature) {
      feature.is_active = feature.is_active ? 0 : 1;
      return { success: true, is_active: feature.is_active };
    }
    throw new Error('Feature not found');
  },
  getPermissionTypes: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockPermissionTypes];
  },
  getRolePermissions: async (roleId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockRolePermissions.filter(rp => rp.role_id === roleId);
  },
  updateRolePermissions: async (roleId: string, permissions: Partial<RolePermission>[]) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Remove old permissions for this role
    const filtered = mockRolePermissions.filter(rp => rp.role_id !== roleId);
    mockRolePermissions.length = 0;
    mockRolePermissions.push(...filtered);
    
    // Add new ones
    permissions.forEach(p => {
      if (p.is_allowed) {
        mockRolePermissions.push({
          id: `rp_${Math.random().toString(36).substr(2, 9)}`,
          role_id: roleId,
          feature_id: p.feature_id!,
          permission_type_id: p.permission_type_id!,
          is_allowed: 1
        });
      }
    });
    return { success: true };
  }
};
