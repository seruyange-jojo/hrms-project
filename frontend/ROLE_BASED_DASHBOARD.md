# Role-Based Dashboard System

This document explains the role-based dashboard system implemented in the HRMS application, where each user role (Admin, Manager, Employee) sees only relevant information and has access to appropriate features.

## 🎯 Role Structure

### Admin Dashboard
**Access Level**: Full System Access
**Purpose**: Company-wide oversight and system administration

**Features**:
- **Company Statistics**: Total employees, departments, managers, payroll costs
- **Employee Management**: View all employees, recent hires, employee lifecycle
- **Department Oversight**: All department performance and statistics
- **Leave Management**: All leave requests across the company
- **System Administration**: User management, system settings, company policies
- **Payroll Management**: Company-wide payroll processing and reports
- **Analytics**: Company-wide performance metrics and reports

**Data Scope**: All company data without restrictions

### Manager Dashboard
**Access Level**: Department/Team Scoped Access
**Purpose**: Team management and departmental oversight

**Features**:
- **Team Statistics**: Team size, department performance, team attendance
- **Team Management**: View and manage direct reports
- **Leave Approvals**: Approve/reject leave requests from team members
- **Attendance Tracking**: Monitor team attendance and punctuality
- **Performance Monitoring**: Track team productivity and performance metrics
- **Budget Oversight**: Department budget and resource allocation
- **Team Reports**: Generate reports specific to their department

**Data Scope**: Limited to their department/team members only

### Employee Dashboard
**Access Level**: Personal Data Only
**Purpose**: Self-service and personal information management

**Features**:
- **Personal Statistics**: Individual attendance, leave balance, salary info
- **Attendance Tracking**: Personal attendance history and check-in/out
- **Leave Management**: Request leave, view leave history and balance
- **Profile Management**: Update personal information and preferences
- **Payroll Information**: Personal salary slips and tax information
- **Company Updates**: Company announcements and news
- **Self-Service**: Password changes, notification preferences

**Data Scope**: Only their own personal data and company-wide announcements

## 🏗️ Technical Implementation

### Dashboard Components

#### 1. AdminDashboard.jsx
```javascript
// Key Features:
- Fetches company-wide statistics using employeeAPI.getEmployees()
- Displays all departments using departmentAPI.getDepartments()
- Shows all leave requests using leaveAPI.getLeaveRequests()
- Calculates system-wide metrics and KPIs
- Provides quick actions for system administration
```

#### 2. ManagerDashboard.jsx
```javascript
// Key Features:
- Filters data by manager's department
- Shows only team members and their data
- Displays pending leave requests for their team
- Calculates team-specific performance metrics
- Provides team management tools
```

#### 3. EmployeeDashboard.jsx
```javascript
// Key Features:
- Filters all data to show only employee's personal records
- Displays personal attendance and leave history
- Shows individual salary and payroll information
- Provides self-service capabilities
- Displays company announcements (read-only)
```

### Data Filtering Strategy

#### Role-Based Data Access
The system uses client-side filtering to ensure each role sees only appropriate data:

```javascript
// Admin: No filtering - sees all data
const adminData = allEmployees;

// Manager: Filtered by department
const managerData = allEmployees.filter(emp => 
  emp.departmentId === manager.departmentId
);

// Employee: Filtered to personal data only
const employeeData = allEmployees.filter(emp => 
  emp.id === currentEmployee.id
);
```

#### Security Considerations
While client-side filtering is implemented, the backend should also enforce role-based access control (RBAC) to ensure data security:

```javascript
// Backend should validate user role and return appropriate data
GET /api/v1/employees (Admin: all employees, Manager: team members, Employee: self only)
GET /api/v1/attendance (Admin: all records, Manager: team records, Employee: personal records)
GET /api/v1/leaves (Admin: all requests, Manager: team requests, Employee: personal requests)
```

## 📊 Data Flow

### Authentication & Role Detection
1. User logs in with credentials
2. Backend validates and returns user data with role information
3. Frontend stores user role in authentication context
4. Dashboard router directs to appropriate role-based dashboard

### Dashboard Rendering
1. Dashboard component checks user role via `useAuth()` hook
2. Appropriate role-specific dashboard component is rendered
3. Component fetches data using API services
4. Data is filtered based on role and user context
5. UI displays role-appropriate information and actions

### API Integration
```javascript
// API Services Structure
dashboardAPI: {
  getAdminStats(),     // Company-wide statistics
  getManagerStats(),   // Department-specific statistics  
  getEmployeeStats()   // Personal statistics
}

// Usage in components
const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    // Fetch and calculate admin-specific data
    const fetchData = async () => {
      const employees = await employeeAPI.getEmployees();
      const departments = await departmentAPI.getDepartments();
      // Calculate company-wide statistics
    };
  }, []);
};
```

## 🔐 Security & Privacy

### Data Privacy
- **Principle of Least Privilege**: Each role has access only to necessary data
- **Data Isolation**: Personal data is restricted to the individual and authorized managers
- **Audit Trail**: All data access should be logged for security monitoring

### Role Validation
- Frontend validates user role before rendering components
- Backend enforces role-based access control on API endpoints
- Session management ensures role persistence and security

### Error Handling
- Graceful degradation when data is unavailable
- Appropriate error messages for unauthorized access
- Fallback to safe defaults when role detection fails

## 🚀 Usage Examples

### Testing Different Roles
```javascript
// Login with different users to test role-based access:

// Admin User
Email: admin@hrms.com
Expected: Full company dashboard with all statistics

// Manager User  
Email: manager@hrms.com
Expected: Team-focused dashboard with department data

// Employee User
Email: employee@hrms.com
Expected: Personal dashboard with individual data only
```

### Extending Role Functionality
To add new features to a specific role:

1. **Add to appropriate dashboard component**:
```javascript
// For admin-only feature
const AdminDashboard = () => {
  // Add new admin functionality here
};
```

2. **Update API services if needed**:
```javascript
// Add new endpoint
export const dashboardAPI = {
  getNewAdminFeature: async () => {
    const response = await apiClient.get('/dashboard/admin/new-feature');
    return response.data;
  }
};
```

3. **Update navigation if required**:
```javascript
// Add role-based menu items
const navigationItems = [
  {
    to: '/new-feature',
    roles: ['admin'], // Restrict to admin only
    icon: NewFeatureIcon,
    label: 'New Feature'
  }
];
```

## 📈 Performance Considerations

### Data Loading
- Parallel API calls using `Promise.all()` for faster loading
- Loading states to improve user experience
- Error boundaries to handle API failures gracefully

### Caching Strategy
- Consider implementing data caching for frequently accessed information
- Cache invalidation when data is updated
- Optimistic updates for better user experience

### Scalability
- Pagination for large datasets
- Virtual scrolling for long lists
- Debounced search and filtering

## 🔧 Maintenance

### Adding New Roles
1. Define role permissions and data access patterns
2. Create new dashboard component
3. Update authentication system to recognize new role
4. Add role-based routing in main Dashboard component
5. Update navigation and security policies

### Updating Role Permissions
1. Modify data filtering logic in dashboard components
2. Update API endpoints to enforce new permissions
3. Test thoroughly to ensure data isolation
4. Update documentation and user guides

## 📝 Best Practices

1. **Always validate user role** before displaying sensitive information
2. **Use consistent error handling** across all dashboard components
3. **Implement proper loading states** for better user experience
4. **Follow the principle of least privilege** for data access
5. **Test with different user roles** to ensure proper functionality
6. **Keep dashboard utilities modular** and reusable
7. **Document any role-specific business logic** clearly

## 🧪 Testing

### Role-Based Testing
- Test each dashboard with appropriate user roles
- Verify data filtering works correctly
- Ensure unauthorized access is prevented
- Test error scenarios and edge cases

### Integration Testing
- Test complete authentication flow
- Verify API integration with role-based filtering
- Test navigation and routing for all roles
- Validate data consistency across different views

This role-based system ensures that each user has a personalized, secure, and relevant experience within the HRMS application while maintaining proper data privacy and access control.