import React, { useState, useEffect } from 'react';
import { employeeAPI, departmentAPI } from '../services/api';
import { Users, Search, Filter, Plus, Edit, Trash2, Eye, Download } from 'lucide-react';
import Button from '../components/Button';
import { LoadingOverlay } from '../components/LoadingSpinner';
import EmployeeModal from '../components/EmployeeModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, formatCurrency, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal states
  const [employeeModal, setEmployeeModal] = useState({
    isOpen: false,
    mode: 'create',
    employee: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, statusFilter, departmentFilter, employees]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, departmentsRes] = await Promise.all([
        employeeAPI.getEmployees(),
        departmentAPI.getDepartments()
      ]);

      const employeeData = employeesRes?.data || employeesRes || [];
      const departmentData = departmentsRes?.data || departmentsRes || [];

      setEmployees(employeeData);
      setDepartments(departmentData);
      setFilteredEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => 
        (emp.departmentId || emp.department?.id || emp.department?.ID) === departmentFilter
      );
    }

    setFilteredEmployees(filtered);
  };

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
          fetchData();
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
      fetchData();
    } catch (error) {
      console.error('Error submitting employee:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save employee');
      throw error;
    }
  };

  const getDepartmentName = (employee) => {
    if (employee.department?.name) return employee.department.name;
    if (employee.department && typeof employee.department === 'string') return employee.department;
    
    const dept = departments.find(d => 
      (d.id || d.ID) === (employee.departmentId || employee.department?.id || employee.department?.ID)
    );
    return dept?.name || 'N/A';
  };

  if (loading) {
    return <LoadingOverlay message="Loading employees..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Employee Management
          </h1>
          <p className="opacity-70 mt-1">
            Manage and view all employees ({filteredEmployees.length} of {employees.length})
          </p>
        </div>
        <Button variant="primary" onClick={handleAddEmployee}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Search</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="text"
                  placeholder="Search by name, email, position, or code..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Department</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept.ID} value={dept.id || dept.ID}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card bg-base-100 shadow-lg overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Code</th>
              <th>Position</th>
              <th>Department</th>
              <th>Contact</th>
              <th>Salary</th>
              <th>Hire Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id || employee.ID}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center text-sm font-bold">
                          {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm opacity-70">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{employee.employeeCode}</span>
                  </td>
                  <td>{employee.position}</td>
                  <td>{getDepartmentName(employee)}</td>
                  <td>
                    <div className="text-sm">
                      {employee.phone || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold">{formatCurrency(employee.salary)}</span>
                  </td>
                  <td>
                    <span className="text-sm">{formatDate(employee.hireDate || employee.joinDate)}</span>
                  </td>
                  <td>
                    <div className={`badge ${getStatusColor(employee.status)} badge-sm`}>
                      {employee.status}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="btn btn-ghost btn-xs"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="btn btn-ghost btn-xs text-error"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto opacity-30 mb-4" />
                  <p className="text-lg opacity-60 mb-4">
                    {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                      ? 'No employees found matching your filters'
                      : 'No employees yet'}
                  </p>
                  {employees.length === 0 && (
                    <Button variant="primary" onClick={handleAddEmployee}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Employee
                    </Button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <EmployeeModal
        isOpen={employeeModal.isOpen}
        onClose={() => setEmployeeModal({ isOpen: false, mode: 'create', employee: null })}
        onSubmit={handleEmployeeSubmit}
        employee={employeeModal.employee}
        mode={employeeModal.mode}
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

export default EmployeesPage;
