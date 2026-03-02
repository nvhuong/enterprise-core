-- ==========================================================
-- SUBSCRIPTION + RBAC + DYNAMIC DATA SCOPE (ENTERPRISE)
-- PostgreSQL
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 1. ENUM LOẠI HÌNH DOANH NGHIỆP
-- ==========================================================
CREATE TYPE company_type_enum AS ENUM (
    'LIMITED',
    'JOINT_STOCK',
    'GROUP'
);

-- ==========================================================
-- 2. COMPANY (TENANT)
-- ==========================================================
CREATE TABLE company (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_type company_type_enum NOT NULL,
    tax_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ==========================================================
-- 3. SERVICE
-- ==========================================================
CREATE TABLE service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- ==========================================================
-- 4. COMPANY SUBSCRIPTION
-- ==========================================================
CREATE TABLE company_subscription (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES company(id) ON DELETE CASCADE,
    service_id UUID REFERENCES service(id),
    user_limit INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(company_id, service_id)
);

-- ==========================================================
-- 5. ORGANIZATION UNIT (CÂY TỔ CHỨC)
-- ==========================================================
CREATE TABLE organization_unit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES company(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES organization_unit(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(100),
    level INT DEFAULT 1,
    path VARCHAR(500),
    created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_org_company ON organization_unit(company_id);
CREATE INDEX idx_org_parent ON organization_unit(parent_id);

-- ==========================================================
-- 6. EMPLOYEE
-- ==========================================================
CREATE TABLE employee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES company(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(company_id, email)
);
CREATE INDEX idx_employee_company ON employee(company_id);

-- ==========================================================
-- 7. ROLE (TẬP QUYỀN + DATA SCOPE)
-- ==========================================================
CREATE TYPE role_scope_type_enum AS ENUM (
    'SELF', -- chỉ chính mình
    'CUSTOM' -- danh sách unit cụ thể
);

CREATE TABLE role (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES company(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scope_type role_scope_type_enum DEFAULT 'CUSTOM',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(company_id, name)
);
CREATE INDEX idx_role_company ON role(company_id);

-- ==========================================================
-- 8. ROLE DATA SCOPE (CHỈ DÙNG KHI scope_type = CUSTOM)
-- ==========================================================
CREATE TABLE role_data_scope (
    role_id UUID REFERENCES role(id) ON DELETE CASCADE,
    organization_unit_id UUID REFERENCES organization_unit(id) ON DELETE CASCADE,
    include_child BOOLEAN DEFAULT false,
    PRIMARY KEY(role_id, organization_unit_id)
);
CREATE INDEX idx_scope_role ON role_data_scope(role_id);
CREATE INDEX idx_scope_unit ON role_data_scope(organization_unit_id);

-- ==========================================================
-- 9. EMPLOYEE_ROLE
-- Membership + Scope Role + Title hiển thị
-- ==========================================================
CREATE TABLE employee_role (
    employee_id UUID REFERENCES employee(id) ON DELETE CASCADE,
    role_id UUID REFERENCES role(id) ON DELETE CASCADE,
    organization_unit_id UUID REFERENCES organization_unit(id) ON DELETE CASCADE,
    title VARCHAR(255), -- Chức danh hiển thị (Giám đốc, Trưởng phòng...)
    assigned_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY(employee_id, role_id, organization_unit_id)
);
CREATE INDEX idx_emp_role_employee ON employee_role(employee_id);
CREATE INDEX idx_emp_role_unit ON employee_role(organization_unit_id);

-- ==========================================================
-- 10. FEATURE
-- ==========================================================
CREATE TABLE feature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES service(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(service_id, code)
);
CREATE INDEX idx_feature_service ON feature(service_id);

-- ==========================================================
-- 11. PERMISSION TYPE
-- ==========================================================
CREATE TABLE permission_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL
);

-- ==========================================================
-- 12. ROLE_PERMISSION
-- ==========================================================
CREATE TABLE role_permission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES role(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES feature(id) ON DELETE CASCADE,
    permission_type_id UUID REFERENCES permission_type(id) ON DELETE CASCADE,
    is_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(role_id, feature_id, permission_type_id)
);
CREATE INDEX idx_role_permission_role ON role_permission(role_id);
CREATE INDEX idx_role_permission_feature ON role_permission(feature_id);

-- ==========================================================
-- 13. TRIGGER CHỐNG CROSS-TENANT
-- ==========================================================
CREATE OR REPLACE FUNCTION check_employee_role_company()
RETURNS TRIGGER AS $$
DECLARE
    emp_company UUID;
    role_company UUID;
    org_company UUID;
BEGIN
    SELECT company_id INTO emp_company FROM employee WHERE id = NEW.employee_id;
    SELECT company_id INTO role_company FROM role WHERE id = NEW.role_id;
    SELECT company_id INTO org_company FROM organization_unit WHERE id = NEW.organization_unit_id;

    IF emp_company IS NULL OR role_company IS NULL OR org_company IS NULL THEN
        RAISE EXCEPTION 'Invalid foreign key reference';
    END IF;

    IF emp_company <> role_company OR emp_company <> org_company THEN
        RAISE EXCEPTION 'Cross-tenant role assignment is not allowed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_employee_role_company
BEFORE INSERT OR UPDATE ON employee_role
FOR EACH ROW
EXECUTE FUNCTION check_employee_role_company();
