# HRMS Database Design

Primary DB: PostgreSQL 16
Encoding: UTF-8; Extensions: uuid-ossp (or pgcrypto), pg_trgm (optional for search)

## Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
  organizations ||--o{ users : has
  organizations ||--o{ employees : has
  organizations ||--o{ departments : has
  departments ||--o{ employees : contains
  employees ||--o{ attendance : logs
  employees ||--o{ leaves : requests
  employees ||--o{ payrolls : has
  payrolls ||--o{ salary_components : includes
  employees ||--o{ documents : has
  users ||--o{ audit_logs : acts
  roles ||--o{ user_roles : assigns
  roles ||--o{ role_permissions : grants
  job_requisitions ||--o{ candidates : pipeline
  candidates ||--o{ interviews : scheduled

  users {
    uuid id PK
    uuid org_id FK
    text email UNIQUE
    text password_hash
    text name
    jsonb settings
    timestamptz created_at
    timestamptz updated_at
  }

  employees {
    uuid id PK
    uuid org_id FK
    text first_name
    text last_name
    text email UNIQUE(org)
    date dob
    text national_id
    date hire_date
    text status
    uuid manager_id FK(employees.id)
    uuid department_id FK
    timestamptz created_at
    timestamptz updated_at
  }

  payrolls {
    uuid id PK
    uuid employee_id FK
    date pay_period_start
    date pay_period_end
    numeric gross_amount
    numeric net_amount
    numeric tax_amount
    text status
    text currency
    timestamptz created_at
  }

  salary_components {
    uuid id PK
    uuid payroll_id FK
    text type
    numeric amount
    text label
  }

  attendance {
    uuid id PK
    uuid employee_id FK
    timestamptz timestamp
    text type
    text source
  }

  leaves {
    uuid id PK
    uuid employee_id FK
    text type
    date start_date
    date end_date
    text status
    uuid approver_id FK(users.id)
    text reason
  }

  job_requisitions {
    uuid id PK
    uuid org_id FK
    text title
    uuid department_id FK
    int openings
    text status
    text description
    timestamptz created_at
  }

  candidates {
    uuid id PK
    uuid requisition_id FK
    text name
    text email
    text stage
    text resume_url
    timestamptz created_at
  }

  interviews {
    uuid id PK
    uuid candidate_id FK
    timestamptz scheduled_at
    int duration_minutes
    text location
    jsonb panel
  }
```

## SQL Migrations (samples)

```sql
-- 0001_init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  currency char(3) NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC+3',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  password_hash text NOT NULL,
  name text,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY(user_id, role_id)
);

CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES departments(id),
  UNIQUE(org_id, name)
);

CREATE TABLE positions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  grade text
);

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  dob date,
  national_id text,
  hire_date date,
  status text NOT NULL DEFAULT 'ACTIVE',
  manager_id uuid REFERENCES employees(id),
  department_id uuid REFERENCES departments(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('IN','OUT')),
  source text NOT NULL
);

CREATE TABLE leaves (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  approver_id uuid REFERENCES users(id),
  reason text
);

CREATE TABLE payrolls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  gross_amount numeric(12,2) NOT NULL DEFAULT 0,
  net_amount numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE salary_components (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_id uuid NOT NULL REFERENCES payrolls(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('BASIC','ALLOWANCE','DEDUCTION','BONUS','TAX')),
  amount numeric(12,2) NOT NULL,
  label text
);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  path text NOT NULL,
  mime_type text,
  size bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id uuid REFERENCES users(id),
  entity text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE job_requisitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  department_id uuid REFERENCES departments(id),
  openings int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'OPEN',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisition_id uuid NOT NULL REFERENCES job_requisitions(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  stage text NOT NULL DEFAULT 'APPLIED',
  resume_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE interviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL,
  location text,
  panel jsonb NOT NULL DEFAULT '[]'
);

-- Indexes
CREATE INDEX idx_employees_org ON employees(org_id);
CREATE INDEX idx_attendance_emp_time ON attendance(employee_id, timestamp);
CREATE INDEX idx_leaves_emp ON leaves(employee_id);
CREATE INDEX idx_payrolls_emp_period ON payrolls(employee_id, pay_period_start, pay_period_end);
CREATE INDEX idx_candidates_requisition ON candidates(requisition_id);

```

## GORM Models (snippets)

```go
// Employee (excerpt)
type Employee struct {
  ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
  OrgID        uuid.UUID `gorm:"type:uuid;index"`
  FirstName    string    `gorm:"not null"`
  LastName     string    `gorm:"not null"`
  Email        string    `gorm:"not null"`
  Status       string    `gorm:"default:ACTIVE"`
  DepartmentID *uuid.UUID
  ManagerID    *uuid.UUID
  CreatedAt    time.Time
  UpdatedAt    time.Time
}
```

## Seed Data (sample)

```sql
INSERT INTO organizations (id, name, currency, timezone) VALUES
  ('11111111-1111-1111-1111-111111111111','Acme Corp','USD','UTC+3');

INSERT INTO departments (org_id, name) VALUES
  ('11111111-1111-1111-1111-111111111111','Engineering'),
  ('11111111-1111-1111-1111-111111111111','HR'),
  ('11111111-1111-1111-1111-111111111111','Finance');

INSERT INTO employees (org_id, first_name, last_name, email, status) VALUES
  ('11111111-1111-1111-1111-111111111111','Jane','Doe','jane.doe@acme.com','ACTIVE'),
  ('11111111-1111-1111-1111-111111111111','John','Smith','john.smith@acme.com','ACTIVE'),
  ('11111111-1111-1111-1111-111111111111','Aisha','Khan','aisha.khan@acme.com','ACTIVE'),
  ('11111111-1111-1111-1111-111111111111','Luis','Garcia','luis.garcia@acme.com','ACTIVE'),
  ('11111111-1111-1111-1111-111111111111','Chen','Wei','chen.wei@acme.com','ACTIVE');

-- Example payrolls will be inserted after components are computed in app logic.
```
