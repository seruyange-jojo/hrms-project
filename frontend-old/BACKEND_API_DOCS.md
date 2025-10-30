# HR System - Backend API Documentation

This document describes the API endpoints that the frontend expects from the backend.

## Base URL

```
http://localhost:3000/api
```

Configure this in the frontend `.env` file as `VITE_API_URL`.

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login

**POST** `/api/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

### Logout

**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

## Employees

### Get All Employees

**GET** `/api/employees`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "emp_001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "department": "Engineering",
      "position": "Software Engineer",
      "joinDate": "2023-01-15",
      "status": "active",
      "salary": 75000
    }
  ]
}
```

### Get Employee by ID

**GET** `/api/employees/:id`

Response:
```json
{
  "success": true,
  "data": {
    "id": "emp_001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "department": "Engineering",
    "position": "Software Engineer",
    "joinDate": "2023-01-15",
    "status": "active",
    "salary": 75000
  }
}
```

### Create Employee

**POST** `/api/employees`

Request body:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "department": "Marketing",
  "position": "Marketing Manager",
  "joinDate": "2024-01-01",
  "salary": 65000
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "emp_002",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567891",
    "department": "Marketing",
    "position": "Marketing Manager",
    "joinDate": "2024-01-01",
    "status": "active",
    "salary": 65000
  },
  "message": "Employee created successfully"
}
```

### Update Employee

**PUT** `/api/employees/:id`

Request body (all fields optional):
```json
{
  "name": "Jane Doe",
  "position": "Senior Marketing Manager",
  "salary": 70000
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "emp_002",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567891",
    "department": "Marketing",
    "position": "Senior Marketing Manager",
    "joinDate": "2024-01-01",
    "status": "active",
    "salary": 70000
  },
  "message": "Employee updated successfully"
}
```

### Delete Employee

**DELETE** `/api/employees/:id`

Response:
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

## Departments

### Get All Departments

**GET** `/api/departments`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "dept_001",
      "name": "Engineering",
      "description": "Software development and engineering",
      "headOfDepartment": "John Manager",
      "employeeCount": 15
    }
  ]
}
```

### Get Department by ID

**GET** `/api/departments/:id`

Response: Same format as above (single object)

### Create Department

**POST** `/api/departments`

Request body:
```json
{
  "name": "Sales",
  "description": "Sales and customer relations",
  "headOfDepartment": "Sales Manager"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "dept_002",
    "name": "Sales",
    "description": "Sales and customer relations",
    "headOfDepartment": "Sales Manager",
    "employeeCount": 0
  },
  "message": "Department created successfully"
}
```

### Update Department

**PUT** `/api/departments/:id`

### Delete Department

**DELETE** `/api/departments/:id`

## Attendance

### Get All Attendance

**GET** `/api/attendance`

Query params (optional):
- `date`: Filter by specific date (YYYY-MM-DD)
- `employeeId`: Filter by employee

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "att_001",
      "employeeId": "emp_001",
      "employeeName": "John Doe",
      "date": "2024-01-15",
      "checkIn": "09:00",
      "checkOut": "17:00",
      "hours": 8,
      "status": "present"
    }
  ]
}
```

### Get Attendance by Employee

**GET** `/api/attendance/employee/:employeeId`

### Mark Check-In

**POST** `/api/attendance/checkin`

Request body:
```json
{
  "employeeId": "emp_001"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "att_001",
    "employeeId": "emp_001",
    "employeeName": "John Doe",
    "date": "2024-01-15",
    "checkIn": "09:00",
    "status": "present"
  },
  "message": "Check-in recorded"
}
```

### Mark Check-Out

**POST** `/api/attendance/checkout`

Request body:
```json
{
  "employeeId": "emp_001"
}
```

### Create Attendance Record

**POST** `/api/attendance`

Request body:
```json
{
  "employeeId": "emp_001",
  "date": "2024-01-15",
  "checkIn": "09:00",
  "checkOut": "17:00",
  "status": "present"
}
```

## Leave Requests

### Get All Leave Requests

**GET** `/api/leave-requests`

Query params (optional):
- `status`: Filter by status (pending, approved, rejected)
- `employeeId`: Filter by employee

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "leave_001",
      "employeeId": "emp_001",
      "employeeName": "John Doe",
      "leaveType": "vacation",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "reason": "Family vacation",
      "status": "pending",
      "appliedDate": "2024-01-20",
      "approverComments": null
    }
  ]
}
```

### Get Leave Requests by Employee

**GET** `/api/leave-requests/employee/:employeeId`

### Create Leave Request

**POST** `/api/leave-requests`

Request body:
```json
{
  "employeeId": "emp_001",
  "leaveType": "vacation",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "reason": "Family vacation"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "leave_001",
    "employeeId": "emp_001",
    "employeeName": "John Doe",
    "leaveType": "vacation",
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "reason": "Family vacation",
    "status": "pending",
    "appliedDate": "2024-01-20"
  },
  "message": "Leave request submitted successfully"
}
```

### Update Leave Request Status

**PUT** `/api/leave-requests/:id`

Request body:
```json
{
  "status": "approved",
  "approverComments": "Enjoy your vacation!"
}
```

### Delete Leave Request

**DELETE** `/api/leave-requests/:id`

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Data Types

### Employee Status
- `active`
- `inactive`

### Leave Type
- `sick`
- `vacation`
- `personal`
- `other`

### Leave Status
- `pending`
- `approved`
- `rejected`

### Attendance Status
- `present`
- `absent`
- `late`
- `half-day`

### User Roles
- `admin`
- `hr`
- `employee`

## CORS Configuration

Ensure CORS is enabled for the frontend origin:

```javascript
// Example for Express.js
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
```

## Docker Setup

For the backend developer using Docker, ensure:

1. Container exposes port 3000
2. CORS is configured for frontend origin
3. Environment variables are set:
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `PORT=3000`
4. Health check endpoint: `GET /api/health`

Example Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Example docker-compose.yml:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=your_secret
      - DATABASE_URL=your_database_url
```



