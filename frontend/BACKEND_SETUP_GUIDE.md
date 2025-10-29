# Backend Setup Guide for HR System

This document provides everything needed to build and deploy the backend API that works with the HR System frontend.

## Overview

The backend needs to expose a REST API that the frontend will consume. The frontend is ready and waiting for the backend implementation.

## Required Tech Stack

We recommend (but you can choose):
- **Node.js** + Express.js or **Python** + FastAPI/Flask or **Java** + Spring Boot
- **Database**: PostgreSQL, MySQL, or MongoDB
- **Authentication**: JWT tokens
- **Docker** for containerization

## API Endpoints Required

The frontend expects the following endpoints. See `BACKEND_API_DOCS.md` for detailed specifications:

### Base URL
- All endpoints under: `/api/*`
- Accept JSON requests/responses

### Authentication (`/api/auth/*`)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Employees (`/api/employees/*`)
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments (`/api/departments/*`)
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Attendance (`/api/attendance/*`)
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/employee/:employeeId` - Get by employee
- `POST /api/attendance/checkin` - Mark check-in
- `POST /api/attendance/checkout` - Mark check-out
- `POST /api/attendance` - Create attendance record

### Leave Requests (`/api/leave-requests/*`)
- `GET /api/leave-requests` - Get all leave requests
- `GET /api/leave-requests/employee/:employeeId` - Get by employee
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update leave status
- `DELETE /api/leave-requests/:id` - Delete leave request

## Response Format

All successful responses should follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Authentication

### JWT Token System
- Generate JWT tokens on login
- Include user info in token payload (id, email, name, role)
- Validate token on protected routes
- Token should be valid for 24 hours

### Token in Header
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

### User Roles
- `admin` - Full access
- `hr` - HR operations
- `employee` - Limited access

## CORS Configuration

**IMPORTANT**: Enable CORS for the frontend origin.

### If using Express.js (Node.js):
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### If using FastAPI (Python):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Docker Setup

### Recommended Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: hr_db
    environment:
      POSTGRES_DB: hrdb
      POSTGRES_USER: hruser
      POSTGRES_PASSWORD: hrpass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hruser"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: hr_backend
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://hruser:hrpass@db:5432/hrdb
      - JWT_SECRET=your_secret_key_here_change_in_production
      - CORS_ORIGIN=http://localhost:5173
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

## Environment Variables

Your backend needs these environment variables:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hrdb

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Database Schema (Example for PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(255),
  position VARCHAR(255),
  join_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  salary DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  head_of_department VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id),
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  hours DECIMAL(4,2),
  status VARCHAR(50) DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests table
CREATE TABLE leave_requests (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id),
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  applied_date DATE DEFAULT CURRENT_DATE,
  approver_comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (id, email, password_hash, name, role) VALUES 
('u_admin', 'admin@hrsystem.com', '$2b$10$hashed_password_here', 'Admin User', 'admin');
```

## Testing the API

### Health Check Endpoint
Add this endpoint for Docker health checks:
```
GET /api/health

Response: { "status": "ok" }
```

### Test with curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrsystem.com","password":"admin123"}'

# Get employees (with token)
curl -X GET http://localhost:3000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test with Postman
1. Import the API endpoints from `BACKEND_API_DOCS.md`
2. Save auth token as environment variable
3. Run tests

## Deployment Checklist

- [ ] Database created and migrations run
- [ ] Environment variables set
- [ ] JWT secret configured (strong random string)
- [ ] CORS enabled for frontend origin
- [ ] All API endpoints implemented
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Password hashing implemented (bcrypt)
- [ ] Token expiration handled
- [ ] Health check endpoint added
- [ ] Dockerfile created
- [ ] docker-compose.yml configured
- [ ] Tested locally with frontend

## Quick Start for Backend Developer

1. **Create backend directory structure**
   ```
   backend/
   ├── src/
   │   ├── routes/        # API routes
   │   ├── controllers/   # Business logic
   │   ├── models/        # Database models
   │   ├── middleware/    # Auth, validation
   │   └── config/        # Config files
   ├── Dockerfile
   ├── docker-compose.yml
   └── package.json (or requirements.txt)
   ```

2. **Start with authentication**
   - Implement login endpoint
   - Generate JWT tokens
   - Create middleware to verify tokens

3. **Implement CRUD operations**
   - Start with Employees
   - Then Departments
   - Then Attendance
   - Finally Leave Requests

4. **Connect to database**
   - Set up ORM/ODM
   - Create models
   - Implement queries

5. **Test with frontend**
   - Run backend: `docker-compose up`
   - Frontend will connect automatically

## Support

For detailed API specifications, see `BACKEND_API_DOCS.md`

For frontend integration, see `FRONTEND_README.md`



