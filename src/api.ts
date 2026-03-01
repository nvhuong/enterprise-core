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

export const permissionService = {
  getFeatures: async () => {
    const response = await api.get<Feature[]>('/features');
    return response.data;
  },
  toggleFeature: async (id: string) => {
    const response = await api.put<{success: boolean, is_active: number}>(`/features/${id}/toggle`);
    return response.data;
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

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: number;
}

export const serviceService = {
  getAll: async () => {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },
  toggle: async (id: string) => {
    const response = await api.put<{success: boolean, is_active: number}>(`/services/${id}/toggle`);
    return response.data;
  }
};
