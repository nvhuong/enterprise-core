import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('enterprise.db');

// Initialize Schema
db.exec(`
  -- Enable foreign keys
  PRAGMA foreign_keys = ON;

  -- 1. COMPANY
  CREATE TABLE IF NOT EXISTS company (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company_type TEXT NOT NULL CHECK(company_type IN ('LIMITED', 'JOINT_STOCK', 'GROUP')),
    tax_code TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. SERVICE
  CREATE TABLE IF NOT EXISTS service (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. COMPANY SUBSCRIPTION
  CREATE TABLE IF NOT EXISTS company_subscription (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES company(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES service(id),
    user_limit INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, service_id)
  );

  -- 4. ORGANIZATION UNIT
  CREATE TABLE IF NOT EXISTS organization_unit (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES company(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES organization_unit(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit_type TEXT,
    level INTEGER DEFAULT 1,
    path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 5. EMPLOYEE
  CREATE TABLE IF NOT EXISTS employee (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES company(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, email)
  );

  -- 6. ROLE
  CREATE TABLE IF NOT EXISTS role (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES company(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    scope_type TEXT DEFAULT 'CUSTOM' CHECK(scope_type IN ('SELF', 'CUSTOM')),
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
  );

  -- 7. ROLE DATA SCOPE
  CREATE TABLE IF NOT EXISTS role_data_scope (
    role_id TEXT REFERENCES role(id) ON DELETE CASCADE,
    organization_unit_id TEXT REFERENCES organization_unit(id) ON DELETE CASCADE,
    include_child INTEGER DEFAULT 0,
    PRIMARY KEY(role_id, organization_unit_id)
  );

  -- 8. EMPLOYEE ROLE
  CREATE TABLE IF NOT EXISTS employee_role (
    employee_id TEXT REFERENCES employee(id) ON DELETE CASCADE,
    role_id TEXT REFERENCES role(id) ON DELETE CASCADE,
    organization_unit_id TEXT REFERENCES organization_unit(id) ON DELETE CASCADE,
    title TEXT,
    assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(employee_id, role_id, organization_unit_id)
  );

  -- 9. FEATURE
  CREATE TABLE IF NOT EXISTS feature (
    id TEXT PRIMARY KEY,
    service_id TEXT REFERENCES service(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, code)
  );

  -- 10. PERMISSION TYPE
  CREATE TABLE IF NOT EXISTS permission_type (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL
  );

  -- 11. ROLE PERMISSION
  CREATE TABLE IF NOT EXISTS role_permission (
    id TEXT PRIMARY KEY,
    role_id TEXT REFERENCES role(id) ON DELETE CASCADE,
    feature_id TEXT REFERENCES feature(id) ON DELETE CASCADE,
    permission_type_id TEXT REFERENCES permission_type(id) ON DELETE CASCADE,
    is_allowed INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, feature_id, permission_type_id)
  );
`);

// Seed some initial data if empty
const companyCount = db.prepare('SELECT count(*) as count FROM company').get() as { count: number };

if (companyCount.count === 0) {
  const companyId = uuidv4();
  db.prepare(`
    INSERT INTO company (id, name, company_type, tax_code, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(companyId, 'Acme Corp', 'LIMITED', 'TAX-123456', 'ACTIVE');

  const serviceId = uuidv4();
  db.prepare(`
    INSERT INTO service (id, code, name, description)
    VALUES (?, ?, ?, ?)
  `).run(serviceId, 'HRM', 'HR Management', 'Human Resource Management System');
  
  // Seed Permission Types
  const permissions = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE'];
  const insertPerm = db.prepare('INSERT OR IGNORE INTO permission_type (id, code) VALUES (?, ?)');
  permissions.forEach(p => insertPerm.run(uuidv4(), p));

  // Seed Features for HRM
  const features = [
    { code: 'EMPLOYEE_MANAGEMENT', name: 'Employee Management' },
    { code: 'ORGANIZATION_MANAGEMENT', name: 'Organization Management' },
    { code: 'ROLE_MANAGEMENT', name: 'Role Management' }
  ];
  const insertFeature = db.prepare('INSERT OR IGNORE INTO feature (id, service_id, code, name) VALUES (?, ?, ?, ?)');
  features.forEach(f => insertFeature.run(uuidv4(), serviceId, f.code, f.name));

  // --- MOCK DATA GENERATION ---
  console.log('Generating mock data...');

  // 1. Create Organization Structure
  // Root: Head Office
  const rootId = uuidv4();
  db.prepare('INSERT INTO organization_unit (id, company_id, parent_id, name, unit_type, level, path) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    rootId, companyId, null, 'Head Office', 'DIVISION', 1, rootId
  );

  // Child: Engineering
  const engId = uuidv4();
  db.prepare('INSERT INTO organization_unit (id, company_id, parent_id, name, unit_type, level, path) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    engId, companyId, rootId, 'Engineering', 'DEPARTMENT', 2, `${rootId}/${engId}`
  );

  // Child: Sales
  const salesId = uuidv4();
  db.prepare('INSERT INTO organization_unit (id, company_id, parent_id, name, unit_type, level, path) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    salesId, companyId, rootId, 'Sales', 'DEPARTMENT', 2, `${rootId}/${salesId}`
  );

  // Child: Backend Team (under Engineering)
  const beId = uuidv4();
  db.prepare('INSERT INTO organization_unit (id, company_id, parent_id, name, unit_type, level, path) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    beId, companyId, engId, 'Backend Team', 'TEAM', 3, `${rootId}/${engId}/${beId}`
  );

  // 2. Create Roles
  const adminRoleId = uuidv4();
  db.prepare('INSERT INTO role (id, company_id, name, description, scope_type) VALUES (?, ?, ?, ?, ?)').run(
    adminRoleId, companyId, 'System Admin', 'Full access to all resources', 'CUSTOM'
  );

  const managerRoleId = uuidv4();
  db.prepare('INSERT INTO role (id, company_id, name, description, scope_type) VALUES (?, ?, ?, ?, ?)').run(
    managerRoleId, companyId, 'Manager', 'Manage own department', 'CUSTOM'
  );

  const employeeRoleId = uuidv4();
  db.prepare('INSERT INTO role (id, company_id, name, description, scope_type) VALUES (?, ?, ?, ?, ?)').run(
    employeeRoleId, companyId, 'Employee', 'Standard access', 'SELF'
  );

  // 3. Assign Permissions to Roles
  // Admin gets everything
  const allFeatures = db.prepare('SELECT id FROM feature').all() as {id: string}[];
  const allPermTypes = db.prepare('SELECT id FROM permission_type').all() as {id: string}[];
  
  const insertRolePerm = db.prepare('INSERT INTO role_permission (id, role_id, feature_id, permission_type_id, is_allowed) VALUES (?, ?, ?, ?, ?)');
  
  allFeatures.forEach(f => {
    allPermTypes.forEach(p => {
      insertRolePerm.run(uuidv4(), adminRoleId, f.id, p.id, 1);
    });
  });

  // Manager gets VIEW/EDIT on Employee Management
  const empFeature = db.prepare("SELECT id FROM feature WHERE code = 'EMPLOYEE_MANAGEMENT'").get() as {id: string};
  const viewPerm = db.prepare("SELECT id FROM permission_type WHERE code = 'VIEW'").get() as {id: string};
  const editPerm = db.prepare("SELECT id FROM permission_type WHERE code = 'EDIT'").get() as {id: string};
  
  if (empFeature && viewPerm) insertRolePerm.run(uuidv4(), managerRoleId, empFeature.id, viewPerm.id, 1);
  if (empFeature && editPerm) insertRolePerm.run(uuidv4(), managerRoleId, empFeature.id, editPerm.id, 1);

  // 4. Create Employees
  const emp1Id = uuidv4();
  db.prepare('INSERT INTO employee (id, company_id, email, full_name, status) VALUES (?, ?, ?, ?, ?)').run(
    emp1Id, companyId, 'admin@enterprise.com', 'Super Admin', 'ACTIVE'
  );

  const emp2Id = uuidv4();
  db.prepare('INSERT INTO employee (id, company_id, email, full_name, status) VALUES (?, ?, ?, ?, ?)').run(
    emp2Id, companyId, 'manager@enterprise.com', 'Engineering Manager', 'ACTIVE'
  );

  const emp3Id = uuidv4();
  db.prepare('INSERT INTO employee (id, company_id, email, full_name, status) VALUES (?, ?, ?, ?, ?)').run(
    emp3Id, companyId, 'dev@enterprise.com', 'Senior Developer', 'ACTIVE'
  );

  // 5. Assign Roles to Employees
  const insertEmpRole = db.prepare('INSERT INTO employee_role (employee_id, role_id, organization_unit_id, title) VALUES (?, ?, ?, ?)');
  
  // Admin is Admin of Head Office
  insertEmpRole.run(emp1Id, adminRoleId, rootId, 'Director');
  
  // Manager is Manager of Engineering
  insertEmpRole.run(emp2Id, managerRoleId, engId, 'Engineering Head');
  
  // Developer is Employee of Backend Team
  insertEmpRole.run(emp3Id, employeeRoleId, beId, 'Backend Dev');

  console.log('Mock data generation complete.');
}

export default db;
