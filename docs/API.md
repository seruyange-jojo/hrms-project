# API Reference

Last updated: 2025-11-03

Base path (development): `/api` (backend default). Adjust for `/api/v1` or a reverse-proxied base depending on deployment.

Authentication

- All protected endpoints require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

- The token contains the user's `id` and `role` (e.g., `admin`, `manager`, `employee`). Backend middleware enforces RBAC.

Error format

- Errors are returned as JSON using a simple shape. Example:

```json
{ "error": true, "message": "Descriptive error message", "code": 400 }
```

Common endpoints

1) Authentication

- POST /api/auth/login

  - Description: Authenticate user and return access token.

  - Request body:

  ```json
  { "email": "user@example.com", "password": "plaintext" }
  ```

  - Response (200):

  ```json
  { "token": "<jwt>", "refreshToken": "<refresh>", "user": { "id": 1, "email": "user@example.com", "role": "employee" } }
  ```

2) Users

- GET /api/users/:id

  - Auth: required

  - Roles: any authenticated user (users can fetch their own record), admin can fetch any.

  - Response (200):

  ```json
  { "id": 1, "email": "user@example.com", "role": "employee", "created_at": "..." }
  ```

3) Employees

- GET /api/employees

  - Description: List employees (supports pagination/filtering).

  - Query params: `?page=1&limit=25&department=2&search=Jane`

  - Roles: Admin, Manager (manager may see only team members depending on backend rules).

- GET /api/employees/:id

  - Description: Get employee profile; includes linked user fields.

  - Roles: Admin, Manager (for reports), Employee (for own record).

- POST /api/employees

  - Description: Create an employee (Admin).

  - Request body (example):

  ```json
  {
    "user": { "email": "jane@example.com", "password": "secret" },
    "first_name": "Jane",
    "last_name": "Doe",
    "department_id": 2,
    "manager_id": 5,
    "hire_date": "2025-01-15"
  }
  ```

- PUT /api/employees/:id

  - Description: Update employee record (Admin or self for limited fields).

- DELETE /api/employees/:id

  - Description: Delete employee (Admin). Prefer soft-delete if implemented by model.

4) Departments

- GET /api/departments

  - Roles: Admin, Manager, Employee (read-only).

- POST /api/departments (Admin)

- PUT /api/departments/:id (Admin)

- DELETE /api/departments/:id (Admin)

5) Attendance

- GET /api/attendance?employee_id=1&from=2025-01-01&to=2025-01-31

  - Description: Query attendance records by employee and date range.

  - Roles: Admin, Manager (for team), Employee (own data).

- POST /api/attendance/checkin

  - Description: Create or update today's attendance check-in. Request body may include optional location or notes.

  - Request body example:

  ```json
  { "employee_id": 1, "type": "checkin", "timestamp": "2025-11-03T09:01:00Z", "notes": "Arrived" }
  ```

- POST /api/attendance/checkout

  - Description: Record check-out for the day.

6) Leave requests

- POST /api/leave

  - Description: Employee submits a leave request.

  - Request body example:

  ```json
  {
    "employee_id": 1,
    "start_date": "2025-12-15",
    "end_date": "2025-12-18",
    "type": "annual",
    "reason": "Family travel"
  }
  ```

  - Response: created leave request with `status: pending` and `id`.

- GET /api/leave?status=pending

  - Description: List leave requests filtered by status; managers fetch pending requests to approve.

- POST /api/leave/:id/approve

  - Roles: Manager or Admin — approves a pending leave, records `approver_id`.

  - Response: updated LeaveRequest with `status: approved`.

- POST /api/leave/:id/decline

  - Roles: Manager or Admin — declines and adds optional comment.

7) Payroll

- GET /api/payroll?employee_id=1&period=2025-10

  - Description: Fetch payroll summary for period or employee.

- GET /api/payroll/:id

  - Description: Fetch payslip details; roles: employee (own), manager/admin (depending on policy).

Notes & conventions

- All request and response bodies are JSON. Content-Type: application/json is expected.

- Use UTC timestamps where possible (ISO 8601 string format).

- Status codes follow REST conventions: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error).

Generating an OpenAPI spec

- Recommendation: generate an OpenAPI (Swagger) spec from backend route definitions or hand-author one in `API.md` or `openapi.yaml` for tooling and client generation.

Where to find implementation

- Source of truth for exact request/response fields: `backend/controllers/` and `backend/models/`.

To generate a full OpenAPI spec from the backend routes, run a controller scanner or use the existing `openapi.yaml` as a starting point and refine schemas as needed.
