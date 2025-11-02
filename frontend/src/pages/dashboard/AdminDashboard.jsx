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
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import { LoadingOverlay } from '../../components/LoadingSpinner';
import { StatsCard, CardWithHeader } from '../../components/Card';
import Button from '../../components/Button';
import EmployeeModal from '../../components/EmployeeModal';
import DepartmentModal from '../../components/DepartmentModal';
import ConfirmDialog from '../../components/ConfirmDialog';
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

  // Modal states
  const [employeeModal, setEmployeeModal] = useState({
    isOpen: false,
    mode: 'create',
    employee: null
  });
  const [departmentModal, setDepartmentModal] = useState({
    isOpen: false,
    mode: 'create',
    department: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

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

      const employees = employeesRes?.data || employeesRes || [];
      const departments = departmentsRes?.data || departmentsRes || [];
      const leaves = leavesRes?.data || leavesRes || [];
      const payroll = payrollRes?.data?.data || payrollRes?.data || [];

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

  // Employee CRUD Handlers
  const handleAddEmployee = () => {
    setEmployeeModal({
      isOpen: true,
      mode: 'create',
      employee: null
    });
  };

  const handleEditEmployee = (employee) => {
    setEmployeeModal({
      isOpen: true,
      mode: 'edit',
      employee: employee
    });
  };

  const handleDeleteEmployee = (employee) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await employeeAPI.deleteEmployee(employee.id || employee.ID);
          toast.success('Employee deleted successfully');
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
          fetchAdminData();
        } catch (error) {
          console.error('Error deleting employee:', error);
          toast.error(error.response?.data?.message || 'Failed to delete employee');
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  const handleEmployeeSubmit = async (formData) => {
    try {
      if (employeeModal.mode === 'edit') {
        await employeeAPI.updateEmployee(employeeModal.employee.id || employeeModal.employee.ID, formData);
        toast.success('Employee updated successfully');
      } else {
        await employeeAPI.createEmployee(formData);
        toast.success('Employee added successfully');
      }
      fetchAdminData();
    } catch (error) {
      console.error('Error submitting employee:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save employee');
      throw error;
    }
  };

  // Department CRUD Handlers
  const handleAddDepartment = () => {
    setDepartmentModal({
      isOpen: true,
      mode: 'create',
      department: null
    });
  };

  const handleEditDepartment = (department) => {
    setDepartmentModal({
      isOpen: true,
      mode: 'edit',
      department: department
    });
  };

  const handleDeleteDepartment = (department) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Department',
      message: `Are you sure you want to delete ${department.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await departmentAPI.deleteDepartment(department.id || department.ID);
          toast.success('Department deleted successfully');
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
          fetchAdminData();
        } catch (error) {
          console.error('Error deleting department:', error);
          toast.error(error.response?.data?.message || 'Failed to delete department');
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  const handleDepartmentSubmit = async (formData) => {
    try {
      if (departmentModal.mode === 'edit') {
        await departmentAPI.updateDepartment(departmentModal.department.id || departmentModal.department.ID, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentAPI.createDepartment(formData);
        toast.success('Department added successfully');
      }
      fetchAdminData();
    } catch (error) {
      console.error('Error submitting department:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save department');
      throw error;
    }
  };

  // Leave Request Handlers
  const handleApproveLeave = async (leaveRequest) => {
    try {
      await leaveAPI.approveLeaveRequest(leaveRequest.id || leaveRequest.ID, 'approved', '');
      toast.success('Leave request approved');
      fetchAdminData();
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error(error.response?.data?.message || 'Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveRequest) => {
    try {
      await leaveAPI.rejectLeaveRequest(leaveRequest.id || leaveRequest.ID, 'Leave request rejected by admin');
      toast.success('Leave request rejected');
      fetchAdminData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to reject leave request');
    }
  };

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
            <Button variant="primary" size="small" className="btn-sm" onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
            <Button variant="outline" size="small" className="btn-sm" onClick={handleAddDepartment}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
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
          action={
            <Button variant="ghost" size="small" onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          }
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.employees.length > 0 ? (
              recentData.employees.map((employee) => (
                <div key={employee.ID || employee.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center text-sm font-bold">
                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                      <p className="text-sm opacity-70">{employee.position}</p>
                      <p className="text-xs opacity-50">{employee.department?.name || employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`badge ${getStatusColor(employee.status)} badge-sm`}>
                      {employee.status}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="btn btn-ghost btn-xs"
                        title="Edit Employee"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No recent employees</p>
                <Button variant="primary" size="small" className="mt-4" onClick={handleAddEmployee}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Employee
                </Button>
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
                <div key={leave.ID || leave.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {leave.employeeName || `${leave.employee?.firstName} ${leave.employee?.lastName}`}
                      </p>
                      <p className="text-sm opacity-70">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs opacity-50">{leave.leaveType} • {leave.days} days</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="success" 
                      size="small" 
                      className="btn-xs"
                      onClick={() => handleApproveLeave(leave)}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="error" 
                      size="small" 
                      className="btn-xs"
                      onClick={() => handleRejectLeave(leave)}
                    >
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
          <Button variant="primary" className="h-20 flex-col" onClick={handleAddEmployee}>
            <Users className="w-6 h-6 mb-2" />
            Add Employee
          </Button>
          <Button variant="secondary" className="h-20 flex-col" onClick={handleAddDepartment}>
            <Building2 className="w-6 h-6 mb-2" />
            Add Department
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

      {/* Modals */}
      <EmployeeModal
        isOpen={employeeModal.isOpen}
        onClose={() => setEmployeeModal({ isOpen: false, mode: 'create', employee: null })}
        onSubmit={handleEmployeeSubmit}
        employee={employeeModal.employee}
        mode={employeeModal.mode}
      />

      <DepartmentModal
        isOpen={departmentModal.isOpen}
        onClose={() => setDepartmentModal({ isOpen: false, mode: 'create', department: null })}
        onSubmit={handleDepartmentSubmit}
        department={departmentModal.department}
        mode={departmentModal.mode}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        loading={confirmDialog.loading}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminDashboard;