import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { employeeAPI, attendanceAPI, leaveAPI, departmentAPI, payrollAPI } from '../../services/api';
import { 
  Users, 
  Building2, 
  Clock, 
  Calendar, 
  DollarSign,
  UserCheck,
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Settings,
  Plus,
  FileText
} from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import { LoadingOverlay } from '../../components/LoadingSpinner';
import { StatsCard, CardWithHeader } from '../../components/Card';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalManagers: 0,
    pendingLeaveRequests: 0,
    monthlyPayrollCost: 0,
    systemActiveUsers: 0
  });
  const [recentData, setRecentData] = useState({
    employees: [],
    leaveRequests: [],
    payrollRecords: [],
    systemAlerts: []
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch all admin-level data
        const [employeesRes, departmentsRes, attendanceRes, leavesRes, payrollRes] = await Promise.all([
          employeeAPI.getEmployees().catch(() => ({ data: [] })),
          departmentAPI.getDepartments().catch(() => ({ data: [] })),
          attendanceAPI.getAttendance().catch(() => ({ data: [] })),
          leaveAPI.getLeaveRequests().catch(() => ({ data: [] })),
          payrollAPI.getPayrollRecords().catch(() => ({ data: [] }))
        ]);

        const employees = employeesRes?.data || [];
        const departments = departmentsRes?.data || [];
        const leaves = leavesRes?.data || [];
        const payroll = payrollRes?.data || [];

        // Calculate admin-specific stats
        const totalEmployees = employees.length;
        const totalDepartments = departments.length;
        const totalManagers = employees.filter(emp => emp.position?.toLowerCase().includes('manager')).length;
        const pendingLeaveRequests = leaves.filter(leave => leave.status?.toLowerCase() === 'pending').length;
        
        // Calculate monthly payroll cost (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthPayroll = payroll.filter(record => {
          const payDate = new Date(record.payPeriodStart);
          return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
        });
        const monthlyPayrollCost = currentMonthPayroll.reduce((sum, record) => sum + (record.grossPay || 0), 0);
        
        // Active users (employees with active status)
        const systemActiveUsers = employees.filter(emp => emp.status?.toLowerCase() === 'active').length;

        setStats({
          totalEmployees,
          totalDepartments,
          totalManagers,
          pendingLeaveRequests,
          monthlyPayrollCost,
          systemActiveUsers
        });

        // Set recent data for admin
        setRecentData({
          employees: employees.slice(0, 5),
          leaveRequests: leaves.filter(leave => leave.status?.toLowerCase() === 'pending').slice(0, 5),
          payrollRecords: payroll.slice(0, 5),
          systemAlerts: [] // Can be populated with system alerts
        });

      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        toast.error('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingOverlay message="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="opacity-70 mt-2 text-sm sm:text-base">
              Welcome back, {user?.firstName}! Manage your organization from here.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button variant="primary" size="small" className="btn-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
            <Button variant="outline" size="small" className="btn-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Departments"
          value={stats.totalDepartments}
          icon={Building2}
          color="secondary"
        />
        <StatsCard
          title="Managers"
          value={stats.totalManagers}
          icon={UserCheck}
          color="accent"
        />
        <StatsCard
          title="Pending Leaves"
          value={stats.pendingLeaveRequests}
          icon={Calendar}
          color="warning"
        />
        <StatsCard
          title="Monthly Payroll"
          value={formatCurrency(stats.monthlyPayrollCost)}
          icon={DollarSign}
          color="success"
        />
        <StatsCard
          title="Active Users"
          value={stats.systemActiveUsers}
          icon={UserCheck}
          color="info"
        />
      </div>

      {/* Admin Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <CardWithHeader
          title="Recent Employees"
          action={<Button variant="ghost" size="small">View All</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.employees.length > 0 ? (
              recentData.employees.map((employee) => (
                <div key={employee.ID} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center text-sm font-bold">
                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                      <p className="text-sm opacity-70">{employee.position}</p>
                      <p className="text-xs opacity-50">{employee.department?.name}</p>
                    </div>
                  </div>
                  <div className={`badge ${getStatusColor(employee.status)} badge-sm`}>
                    {employee.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No recent employees</p>
              </div>
            )}
          </div>
        </CardWithHeader>

        {/* Pending Leave Requests */}
        <CardWithHeader
          title="Pending Leave Requests"
          action={<Button variant="ghost" size="small">Manage All</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.leaveRequests.length > 0 ? (
              recentData.leaveRequests.map((leave) => (
                <div key={leave.ID} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </p>
                      <p className="text-sm opacity-70">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs opacity-50">{leave.leaveType} • {leave.days} days</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="success" size="small" className="btn-xs">
                      Approve
                    </Button>
                    <Button variant="error" size="small" className="btn-xs">
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No pending leave requests</p>
              </div>
            )}
          </div>
        </CardWithHeader>
      </div>

      {/* Admin Quick Actions */}
      <CardWithHeader
        title="Quick Actions"
        className="hover:shadow-lg transition-shadow duration-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="primary" className="h-20 flex-col">
            <Users className="w-6 h-6 mb-2" />
            Employee Management
          </Button>
          <Button variant="secondary" className="h-20 flex-col">
            <Building2 className="w-6 h-6 mb-2" />
            Department Setup
          </Button>
          <Button variant="accent" className="h-20 flex-col">
            <DollarSign className="w-6 h-6 mb-2" />
            Process Payroll
          </Button>
          <Button variant="info" className="h-20 flex-col">
            <FileText className="w-6 h-6 mb-2" />
            Generate Reports
          </Button>
        </div>
      </CardWithHeader>
    </div>
  );
};

export default AdminDashboard;