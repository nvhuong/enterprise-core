# Enterprise System Database Schema (Base)

Tài liệu này mô tả cấu trúc cơ sở dữ liệu nền tảng cho hệ thống Enterprise, bao gồm quản lý Tenant (Công ty), Cơ cấu tổ chức, Nhân sự, và Phân quyền (RBAC).

## 1. Core Entities (Thực thể cốt lõi)

### `company` (Tenant)
Bảng chứa thông tin các công ty thuê bao sử dụng hệ thống.
- **id**: UUID (Primary Key)
- **name**: Tên công ty
- **company_type**: Loại hình (TNHH, Cổ phần, Tập đoàn)
- **tax_code**: Mã số thuế
- **status**: Trạng thái (ACTIVE, INACTIVE, SUSPENDED)

### `service`
Danh sách các dịch vụ/module phần mềm trong hệ sinh thái (ví dụ: HRM, ERP, CRM).
- **code**: Mã dịch vụ (Unique)
- **name**: Tên hiển thị
- **is_active**: Trạng thái kích hoạt

### `company_subscription`
Quản lý việc đăng ký sử dụng dịch vụ của từng công ty.
- **company_id**: FK tới `company`
- **service_id**: FK tới `service`
- **user_limit**: Giới hạn số lượng người dùng
- **start_date**, **end_date**: Thời hạn thuê bao

## 2. Organization Structure (Cơ cấu tổ chức)

### `organization_unit`
Cây tổ chức của doanh nghiệp (Phòng ban, Đội nhóm, Chi nhánh).
- **company_id**: Thuộc về công ty nào (Tenant isolation)
- **parent_id**: Đơn vị cha (Self-reference cho cấu trúc cây)
- **name**: Tên đơn vị
- **unit_type**: Loại đơn vị (DEPARTMENT, TEAM, DIVISION, BRANCH)
- **level**: Cấp độ trong cây (1, 2, 3...)
- **path**: Đường dẫn phân cấp (Materialized path để truy vấn nhanh, ví dụ: `root_id/child_id`)

## 3. Human Resources (Nhân sự)

### `employee`
Hồ sơ nhân viên.
- **company_id**: Thuộc về công ty nào
- **email**: Email đăng nhập (Unique trong phạm vi công ty)
- **full_name**: Họ tên đầy đủ
- **status**: Trạng thái làm việc

## 4. RBAC & Permissions (Phân quyền)

### `role`
Định nghĩa các vai trò trong hệ thống.
- **company_id**: Vai trò thuộc về công ty nào
- **name**: Tên vai trò (Admin, Manager, Staff...)
- **scope_type**: Phạm vi dữ liệu mặc định của vai trò
    - `SELF`: Chỉ nhìn thấy dữ liệu của chính mình
    - `CUSTOM`: Nhìn thấy dữ liệu theo danh sách đơn vị tổ chức được gán (Role Data Scope)

### `role_data_scope`
Chi tiết phạm vi dữ liệu cho vai trò có `scope_type = CUSTOM`.
- **role_id**: FK tới `role`
- **organization_unit_id**: Đơn vị được phép truy cập
- **include_child**: Có bao gồm các đơn vị con hay không (True/False)

### `employee_role` (Membership)
Gán nhân viên vào vai trò tại một đơn vị tổ chức cụ thể.
- **employee_id**: Nhân viên nào
- **role_id**: Vai trò gì
- **organization_unit_id**: Tại đơn vị nào (Context)
- **title**: Chức danh hiển thị (Giám đốc, Trưởng phòng...)

### `feature`
Các tính năng cụ thể trong từng dịch vụ.
- **service_id**: Thuộc dịch vụ nào
- **code**: Mã tính năng (EMPLOYEE_MANAGEMENT, REPORT_VIEW...)

### `permission_type`
Các loại quyền thao tác.
- **code**: VIEW, CREATE, EDIT, DELETE, APPROVE, EXPORT...

### `role_permission`
Ma trận phân quyền: Vai trò này được làm gì trên tính năng nào.
- **role_id**: Vai trò
- **feature_id**: Tính năng
- **permission_type_id**: Loại quyền
- **is_allowed**: Cho phép hay không

## 5. Security & Isolation
- Tất cả các bảng dữ liệu chính (`employee`, `organization_unit`, `role`) đều có `company_id` để đảm bảo **Tenant Isolation**.
- Trigger `check_employee_role_company` (trong PostgreSQL base) đảm bảo không gán quyền chéo giữa các công ty khác nhau.
