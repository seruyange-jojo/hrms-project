# HRMS Project

Updated: 2025-11-03

## Summary

This is a lightweight HR Management System (HRMS) sample project with:

- React + Vite frontend (Tailwind CSS + DaisyUI)

- Go backend using Gin and GORM

- PostgreSQL database (development via Docker Compose)

Current status: Core Employee, Manager, and Admin dashboards are implemented. Key flows (authentication, leave requests, approvals, attendance, payroll viewing) are functional in the local development environment.

## Tech stack

<!-- Condensed README: keep quickstart, stack, and links. -->

## Project overview

Last updated: 2025-11-03

Lightweight Human Resource Management System (HRMS) with a React (Vite) frontend and a Go (Gin + GORM) backend. Development uses PostgreSQL via Docker Compose.

Key implemented areas:

- Authentication (JWT)
- Employee: attendance, leave requests, payroll viewing, profile edit
- Manager: leave approvals, team overview
- Admin: employees & departments CRUD

## Quick start (development)

1. Start backend and Postgres (from repo root):

```bash
cd backend
docker-compose up --build -d
```

2. Start frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (default [http://localhost:5173](http://localhost:5173)).

## Important files & links

- `backend/` — Go API (controllers, models, routes)
- `frontend/` — React app (components, pages, services)
- `API.md`, `openapi.yaml` — API documentation
- `SDD.md`, `SRS.md`, `SETUP_GUIDE.md` — system & setup docs

## Dev notes

- Backend config: see `backend/config/config.go` for env keys.
- Frontend: set `VITE_API_BASE_URL` to the backend API URL in development.

## Next steps

- Add automated tests and CI
- Diagrams are embedded in `SDD.md` (inlined PlantUML/ASCII snippets)
- Implement server-side payslip generation (planned)

---

Next steps: fix remaining markdown-lint warnings across docs and (optionally) re-run PlantUML rendering to generate PNGs and embed them in `SDD.md`. Please indicate whether you'd like diagrams generated now or after the lint pass.


**Create Admin User:**
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "email": "newadmin@hrms.com",
    "firstName": "Jane",
    "lastName": "Admin",
    "role": "admin",
    "password": "securepass123"
  }'
```

**Create HR User:**
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "email": "hr.manager@hrms.com",
    "firstName": "Sarah",
    "lastName": "HR",
    "role": "hr",
    "password": "hrpass123"
  }'
```

**Create Manager User:**
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "email": "team.lead@hrms.com",
    "firstName": "Mike",
    "lastName": "Manager",
    "role": "manager",
    "password": "mgr123pass"
  }'
```

**Create Employee User:**
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "email": "john.doe@hrms.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "password": "emp123pass"
  }'
```

### **Get Admin JWT Token First:**
```bash
# Login as admin to get JWT token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4
```

### **Via Database (Direct Access)**

**Connect to Database:**
```bash
docker exec -it hrms_postgres psql -U hrms_user -d hrms_db
```

**Create User SQL:**
```sql
-- Insert new user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
VALUES (
  'newuser@hrms.com',
  '$2a$10$hashedpasswordhere',  -- Use bcrypt to hash password
  'First',
  'Last',
  'employee',  -- admin, hr, manager, employee
  true
);

-- Create corresponding employee record
INSERT INTO employees (employee_code, first_name, last_name, email, phone, hire_date, salary, position, status, department_id)
VALUES (
  'EMP005',
  'First',
  'Last', 
  'newuser@hrms.com',
  '+1234567890',
  CURRENT_DATE,
  50000.00,
  'Software Developer',
  'active',
  1  -- Assuming department ID 1 exists
);
```

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast development and building
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### **Backend**
- **Go 1.21** - High-performance backend language
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **JWT-Go** - JSON Web Token authentication
- **PostgreSQL** - Relational database
- **Docker** - Containerization

### **DevOps & Tools**
- **Docker Compose** - Multi-container orchestration
- **ESLint** - Code linting
- **Git** - Version control
- **Postman/curl** - API testing

## 📁 **Project Structure**

```
software-project/
├── backend/                    # Go Backend API
│   ├── controllers/           # API route handlers
│   ├── models/               # Database models
│   ├── routes/               # API route definitions
│   ├── middleware/           # Authentication middleware
│   ├── database/             # DB connection & migrations
│   ├── seeds/                # Database seed data
│   ├── config/               # Configuration management
│   ├── utils/                # Utility functions
│   ├── main.go               # Application entry point
│   ├── go.mod                # Go modules
│   └── Dockerfile            # Backend container image
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components  
│   │   ├── pages/            # Page-level components
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript type definitions
│   │   ├── context/          # React Context providers
│   │   └── App.tsx           # Main app component
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── .env                  # Environment configuration
│   └── vite.config.ts        # Vite configuration
├── docker-compose.yml         # Backend services orchestration
├── SETUP_GUIDE.md            # Detailed setup instructions
├── README.md                 # This file
└── start.sh                  # Quick start script
```

## 🔧 **Configuration**

### **Backend Environment Variables**
```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=hrms_user
DB_PASSWORD=hrms_password
DB_NAME=hrms_db

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=8080
GIN_MODE=debug

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### **Frontend Environment Variables**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Demo Mode (false = real backend, true = mock data)
VITE_DEMO_MODE=false

# Application Info
VITE_APP_NAME=HR Management System
VITE_APP_VERSION=1.0.0
```

## 🎯 **Key Features**

### **👤 User Management**
- Role-based access control (Admin, HR, Manager, Employee)
- JWT authentication with secure token management
- User profile management and settings

### **👥 Employee Management**
- Complete CRUD operations for employee records
- Department assignment and management
- Employee status tracking (active/inactive)
- Salary and position management

### **🏢 Department Management**
- Department creation and organization
- Department head assignment
- Employee count tracking

### **📊 Dashboard & Analytics**
- Real-time employee statistics
- Department distribution charts
- Interactive data visualizations
- Key metrics overview

### **📱 Modern UI/UX**
- Responsive design for all screen sizes
- Clean, professional interface
- Intuitive navigation and workflows
- Real-time feedback and notifications

## 🛡️ **Security Features**

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password encryption
- **Role-Based Access** - Granular permission system
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side request validation
- **SQL Injection Prevention** - Parameterized queries with GORM

## 🧪 **Development & Testing**

### **Backend Testing**
```bash
cd backend
go test ./...
```

### **Frontend Testing**
```bash
cd frontend
npm run lint
npm run build
```

### **API Testing**
```bash
# Test authentication
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"admin123"}'

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/v1/employees
```

## 📈 **Available API Endpoints**

### **Authentication**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### **Users**
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users` - List all users (admin only)
- `POST /api/v1/users` - Create new user (admin only)

### **Employees**
- `GET /api/v1/employees` - List employees
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees/:id` - Get employee details
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### **Departments**
- `GET /api/v1/departments` - List departments
- `POST /api/v1/departments` - Create department
- `GET /api/v1/departments/:id` - Get department details
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department

## 🚨 **Troubleshooting**

### **Common Issues**

**Backend not starting:**
```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f backend

# Restart services
docker compose restart
```

**Frontend can't connect to backend:**
```bash
# Verify backend is running
curl http://localhost:8080/health

# Check CORS configuration
# Verify VITE_API_BASE_URL in frontend/.env
```

**Database connection issues:**
```bash
# Check database status
docker compose logs postgres

# Reset database (WARNING: destroys data)
docker compose down
docker volume rm software-project_postgres_data
docker compose up -d --build
```

## 🚀 **Production Deployment**

### **Backend (Docker)**
1. Update environment variables for production
2. Set `GIN_MODE=release`  
3. Use strong JWT secrets
4. Configure proper CORS origins
5. Set up SSL/TLS certificates

### **Frontend (Static Build)**
```bash
cd frontend
npm run build
# Deploy dist/ folder to CDN or web server
```

## 📚 **Documentation**

- `SETUP_GUIDE.md` - Comprehensive setup instructions
- `API.md` - Complete API documentation
- `DB.md` - Database schema and migrations
- `DESIGN_SYSTEM.md` - UI design guidelines
- `UX_FLOWS.md` - User experience workflows

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

If you encounter issues:

1. Check the troubleshooting section above
2. Review the `SETUP_GUIDE.md` for detailed instructions
3. Check Docker service logs: `docker compose logs -f`
4. Verify environment configuration files
5. Test API endpoints directly with curl

---

**Happy coding! 🎉**

**Built with ❤️ using React + TypeScript + Go + PostgreSQL**
