# HR Management System - Frontend

A modern, responsive HR Management System built with React, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard** - Overview with statistics and analytics
- 👥 **Employee Management** - Add, edit, delete, and manage employee records
- 🏢 **Department Management** - Organize employees into departments
- ⏰ **Attendance Tracking** - Check-in/check-out system with attendance records
- 🏖️ **Leave Management** - Request and manage leave applications
- 🔐 **Authentication** - Secure login system with protected routes

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

## Prerequisites

- Node.js 16+ and npm/yarn installed
- Backend API running (see backend setup instructions)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Replace `http://localhost:3000/api` with your backend API URL if different.

### 3. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
hr-system-frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout.tsx      # Main layout with navigation
│   │   └── ProtectedRoute.tsx
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/              # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Employees.tsx
│   │   ├── Departments.tsx
│   │   ├── Attendance.tsx
│   │   └── Leaves.tsx
│   ├── services/           # API services
│   │   └── api.ts          # API configuration and methods
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Shared type definitions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── tailwind.config.js      # Tailwind config
```

## API Integration

The frontend expects a backend API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/employee/:employeeId` - Get by employee
- `POST /api/attendance/checkin` - Mark check-in
- `POST /api/attendance/checkout` - Mark check-out
- `POST /api/attendance` - Create attendance record

### Leave Requests
- `GET /api/leave-requests` - Get all leave requests
- `GET /api/leave-requests/employee/:employeeId` - Get by employee
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update leave request
- `DELETE /api/leave-requests/:id` - Delete leave request

### Expected Response Format

All API responses should follow this format:

```json
{
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

### Authentication

The frontend uses JWT tokens stored in localStorage. Include the token in requests:

```
Authorization: Bearer <token>
```

## Usage Guide

### Login
1. Navigate to the login page
2. Enter credentials (provided by backend)
3. Upon successful login, you'll be redirected to the dashboard

### Dashboard
- View overview statistics
- See employees by department
- Check recent attendance activity

### Manage Employees
- Click "Add Employee" to create new employees
- Edit or delete existing employees
- View employee details and status

### Manage Departments
- Create and edit departments
- Assign employees to departments
- View department statistics

### Track Attendance
- Select a date to view attendance
- Use quick actions to mark check-in/check-out
- View attendance history

### Manage Leave Requests
- Submit new leave requests
- Filter by status (All, Pending, Approved, Rejected)
- Approve or reject pending requests
- Add comments when approving/rejecting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add proper error handling

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend has CORS enabled for the frontend origin.

### API Connection
Verify that:
- Backend server is running
- `VITE_API_URL` in `.env` is correct
- Backend endpoints match expected format

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 16+)

## Support

For issues or questions, contact the development team.



