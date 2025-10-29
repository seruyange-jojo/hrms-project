# 🚀 HRMS Project Setup Guide

This guide provides step-by-step instructions for running the HRMS (Human Resource Management System) project, which consists of a Go backend API with PostgreSQL database and a React TypeScript frontend.

## 📋 Prerequisites

- **Docker & Docker Compose** (for backend services)
- **Node.js 18+** (for frontend development)
- **npm** (comes with Node.js)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Go Backend    │    │   PostgreSQL    │
│   (Port 5173)   │───▶│   (Port 8080)   │───▶│   (Port 5433)   │
│   npm run dev   │    │   Docker        │    │   Docker        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Key Features:**
- **Backend**: Go 1.21 + Gin framework + GORM + PostgreSQL 16
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Authentication**: JWT-based with role management
- **Development**: Backend in Docker, Frontend via npm dev server
- **Database**: PostgreSQL with health checks and persistent volumes

## 🚦 Quick Start

### Step 1: Start Backend Services (Database + API)

```bash
cd /home/jojo/Desktop/Code/software-project
docker compose up -d --build
```

This will start:
- PostgreSQL Database (Port 5433)
- Go Backend API (Port 8080)

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

### Step 4: Access the Application

- **Frontend**: <http://localhost:5173>
- **Backend API**: <http://localhost:8080>
- **Health Check**: <http://localhost:8080/health>
cd /home/jojo/Desktop/Code/software-project/frontend
npm run dev
```

## � Detailed Setup Instructions

### Prerequisites Verification

Before starting, ensure you have:

```bash
# Check Docker
docker --version
docker compose version

# Check Node.js (should be 18+)
node --version
npm --version
```

### Backend Services Setup

The backend uses Docker Compose to orchestrate:

- **PostgreSQL Database** (Port 5433)
- **Go Backend API** (Port 8080)

1. **Navigate to project root**:

   ```bash
   cd /home/jojo/Desktop/Code/software-project
   ```

2. **Start backend services**:

   ```bash
   docker compose up -d --build
   ```

3. **Verify services are running**:

   ```bash
   docker compose ps
   ```

4. **Check backend health**:

   ```bash
   curl -s http://localhost:8080/health
   ```

### Frontend Development Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

## ⚙️ Environment Configuration

### Backend Configuration

### 2. Frontend Setup

The frontend is a React TypeScript application with Vite for development.

**Install dependencies (first time only):**
```bash
cd /home/jojo/Desktop/Code/software-project/frontend
npm install
```

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## 🔧 Configuration

### Backend Configuration

The backend is configured through Docker Compose environment variables in `docker-compose.yml`:

```yaml
environment:
  PORT: "8080"
  GIN_MODE: "debug"
  DB_HOST: "postgres"
  DB_PORT: "5432"
  DB_USER: "hrms_user"
  DB_PASSWORD: "hrms_password"
  DB_NAME: "hrms_db"
  DB_SSLMODE: "disable"
  JWT_SECRET: "your-super-secret-jwt-key-change-in-production"
  JWT_EXPIRES_IN: "24h"
  ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
```

### Frontend Configuration

The frontend configuration is in `frontend/.env`:

**Current Configuration (Real Backend Mode)**:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_DEMO_MODE=false
VITE_APP_NAME=HR Management System
VITE_APP_VERSION=1.0.0
```

**Alternative Demo Mode** (no backend required):

```bash
# frontend/.env
VITE_DEMO_MODE=true
```

### Frontend Configuration
Frontend configuration is in `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Demo Mode (set to false for real backend)
VITE_DEMO_MODE=false

# Application Info
VITE_APP_NAME=HR Management System
VITE_APP_VERSION=1.0.0
```

## 👥 Demo Users

The system comes with pre-seeded demo users:

| Role     | Email               | Password    |
|----------|---------------------|-------------|
| Admin    | admin@hrms.com      | admin123    |
| HR       | hr@hrms.com         | hr123       |
| Manager  | manager@hrms.com    | manager123  |
| Employee | employee@hrms.com   | employee123 |

## 🛠️ Development Workflow

### Daily Development
1. **Start backend services once:**
   ```bash
   docker compose up -d
   ```

2. **Start frontend with hot reload:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Make changes to frontend code** - Vite will automatically reload

### Backend Development
If you need to modify backend code:

1. **Make changes to Go files in `/backend`**
2. **Rebuild and restart:**
   ```bash
   docker compose up -d --build backend
   ```

### Database Access
**Connect to PostgreSQL:**
```bash
docker exec -it hrms_postgres psql -U hrms_user -d hrms_db
```

**View database logs:**
```bash
docker compose logs -f postgres
```

## 🧪 Testing

### **Frontend Testing**
```bash
cd frontend
npm run lint          # ESLint check
npm run build         # Test production build
```

### API Testing
```bash
# Health check
curl http://localhost:8080/health

# Test login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"admin123"}'
```

## 🚨 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using port 8080
lsof -i :8080

# Or use different ports in docker-compose.yml
ports:
  - "8081:8080"  # Change to 8081
```

**2. Docker Services Won't Start**
```bash
# Clean up and restart
docker compose down
docker system prune -f
docker compose up -d --build
```

**3. Frontend Can't Connect to Backend**
- Verify backend is running: `curl http://localhost:8080/health`
- Check CORS settings in backend
- Verify `VITE_API_BASE_URL` in `frontend/.env`

**4. Database Connection Issues**
```bash
# Check database status
docker compose logs postgres

# Reset database
docker compose down
docker volume rm software-project_postgres_data
docker compose up -d --build
```

### Service Status Commands
```bash
# Check all services
docker compose ps

# View logs
docker compose logs -f

# Restart specific service
docker compose restart backend

# Access backend container
docker exec -it hrms_backend sh
```

## 📊 Available Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users` - List all users (admin only)

### Employees
- `GET /api/v1/employees` - List employees
- `POST /api/v1/employees` - Create employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Departments
- `GET /api/v1/departments` - List departments
- `POST /api/v1/departments` - Create department
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department

## 🔄 Switching Between Demo and Real Backend

### Demo Mode (No Backend Required)
```bash
# In frontend/.env
VITE_DEMO_MODE=true
```

### Real Backend Mode
```bash
# In frontend/.env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## 🚀 Production Deployment

### Technology Stack

**Backend:**
- Go 1.21 with Gin web framework
- GORM for database ORM
- PostgreSQL 16 database
- JWT authentication
- Docker containerization

**Frontend:**
- React 18 with TypeScript
- Vite 6.4.1 build tool
- Tailwind CSS for styling
- Axios for HTTP requests
- React Router for navigation

### Frontend Production Build

```bash
cd frontend
npm run build
# Serve dist/ folder with nginx or similar web server
```

### Backend Production Deployment

```bash
# Update docker-compose.yml for production:
# - Set GIN_MODE=release
# - Use strong JWT_SECRET
# - Configure proper CORS origins
# - Use production database credentials
```

## 📁 Project Structure

```
software-project/
├── .github/               # GitHub workflows & CI/CD
├── backend/               # Go backend application
│   ├── config/            # Configuration management
│   ├── controllers/       # HTTP request handlers
│   ├── database/          # DB connection & migrations
│   ├── models/            # GORM data models
│   ├── routes/            # API route definitions
│   ├── middleware/        # JWT authentication
│   ├── seeds/             # Database seeders
│   ├── utils/             # Helper utilities
│   ├── main.go            # Application entry point
│   ├── go.mod             # Go dependencies
│   ├── Dockerfile         # Backend container
│   └── .env               # Backend environment
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client services
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Frontend utilities
│   ├── .env               # Frontend configuration
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.ts     # Vite build config
│   ├── tailwind.config.js # Tailwind CSS config
│   └── tsconfig.json      # TypeScript config
├── docker-compose.yml     # Services orchestration
├── README.md              # Project overview
├── SETUP_GUIDE.md         # Setup instructions
├── DB.md                  # Database documentation
├── SRS.md                 # Requirements specification
└── PROJECT_REVIEW.md      # Technical review
```

## 💡 Tips

1. **Keep backend services running** in Docker while developing frontend
2. **Use browser dev tools** to inspect API calls and responses
3. **Check Docker logs** if something isn't working: `docker compose logs -f`
4. **Frontend hot reload** works automatically when you save files
5. **Use the health endpoint** to verify backend connectivity

## 🆘 Getting Help

If you encounter issues:

1. **Check service status:** `docker compose ps`
2. **View logs:** `docker compose logs -f backend`
3. **Verify configuration:** Check `.env` files
4. **Test API directly:** Use curl or Postman
5. **Restart services:** `docker compose restart`

---

**Happy coding! 🎉**