# Software Requirements Specification (SRS)

Last updated: 2025-11-03

This document summarizes the requirements covered by the current milestone and the implemented subset of features in this repository.

## Overview

Stack: React (Vite) frontend, Go (Gin + GORM) backend, PostgreSQL. Authentication is JWT-based and the backend enforces role-based access control (Admin, Manager, Employee).

Core implemented flows:

- Authentication (login with JWT)
- Employee features: dashboard, leave requests, attendance check-in/out, payroll viewing, profile edit
- Manager features: team overview, leave approvals
- Admin features: CRUD for employees and departments

See `backend/controllers`, `backend/models`, `frontend/src/pages` for implementation details and exact route paths.
````markdown
# Software Requirements Specification (SRS)

Last updated: 2025-11-03

This SRS documents the currently implemented functionality and the most important requirements for the HRMS project in this repository. It is intentionally focused on the features implemented to date and the near-term acceptance criteria.

## Overview

Stack: React (Vite) frontend, Go (Gin + GORM) backend, PostgreSQL. Authentication is JWT-based and the backend enforces RBAC for Admin, Manager, and Employee roles.

Core implemented flows (current state):
- Authentication (login with JWT)
- Employee features: dashboard, leave requests, attendance check-in/out, payroll viewing, profile edit
- Manager features: team overview, leave approvals
- Admin features: CRUD for employees and departments

For exact API routes and request/response shapes see `API.md`, `openapi.yaml`, and `backend/controllers`.

## Data model (summary)

- User: id, email, password_hash, role, created_at
- Employee: id, user_id, first_name, last_name, department_id, manager_id, hire_date
- Department: id, name, description
- Attendance: id, employee_id, date, check_in_time, check_out_time, status
- LeaveRequest: id, employee_id, start_date, end_date, type, reason, status, approver_id
- Payroll: id, employee_id, period_start, period_end, gross, net, deductions

## Non-functional requirements (high level)

- Security: JWT tokens, RBAC middleware, use HTTPS in production
- Performance: index commonly queried fields (employee_id, date); add pagination for large lists
- Reliability: use DB transactions for critical operations; provide seeders for dev
- Maintainability: modular code organization (controllers, models, services)

## Testing & Verification

- Unit tests: minimal at present
- Integration tests: not included; recommend adding CI and automated tests

## Known limitations and next steps

- Pay stub PDF generation not implemented (planned)
- No automated test suite or CI configured yet
- Add pagination and server-side filtering for large datasets

## Acceptance criteria for this milestone

1. Role-based login functions and dashboards render correctly for each role.
2. Employees can create leave requests; managers can approve/decline and status updates propagate.
3. Attendance and payroll data are available and displayed in the employee dashboard.
4. Admin APIs for managing employees and departments are functional.

References: see `backend/controllers`, `backend/models`, and `frontend/src/pages` for implementation details.

````
  return func(c *gin.Context) {
    perms := c.GetStringSlice("perms")
    for _, p := range perms { if p == key { c.Next(); return } }
    c.AbortWithStatusJSON(403, gin.H{"code":"RBAC_001","message":"forbidden"})
  }
}
```

### FR3: Employee Records Management
- Description: Full employee profile CRUD, documents, employment history, termination, audit trail
- Actors: HR Manager/Staff; Manager (limited); Employee (self)
- Preconditions: RBAC; org exists
- Normal: Create/update employees; upload docs to S3; audit changes
- Alternate: Soft-delete or terminate with reason; rehire
- API: `/employees` CRUD, `/employees/{id}/documents`
- Data: `employees`, `departments`, `positions`, `documents`, `audit_logs`
- Validation: Email unique per org; required fields; document MIME/type/size limits
- Acceptance: CRUD works; audits recorded; secure doc storage
- Tests: happy CRUD, duplicate email 409, invalid doc type 415

<!-- Rewritten SRS: keep concise and lint-friendly. -->

# SRS: HRMS (condensed)

Last updated: 2025-11-03

This file is a concise SRS describing the implemented features, data model summary, non-functional requirements, limitations, and acceptance criteria for the current milestone.

## Implemented features (short)

- Auth: JWT login and basic session handling
- Employee flows: attendance (check-in/out), leave requests, payroll viewing, profile editing
- Manager flows: review and approve/reject leave requests, view team attendance
- Admin flows: CRUD for employees and departments

## Data model (high level)

- users, employees, departments, attendance, leave_requests, payroll_records

Refer to `backend/models/models.go` for precise field definitions.

## Limitations and next steps

- No automated test suite or CI yet
- Pay-stub PDF generation is a placeholder
- Add pagination and server-side filtering for large datasets

## Acceptance criteria (milestone)

1. Role-based dashboards render and enforce permissions.
2. Employee can submit a leave request; manager can approve/decline.
3. Attendance records are created by check-in/out flows and visible in the UI.
4. Admin APIs support employee and department management.

--

References: `API.md`, `openapi.yaml`, `backend/controllers`.
