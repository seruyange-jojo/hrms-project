import React, { useState, useEffect } from 'react';
import { departmentAPI, employeeAPI } from '../services/api';
import { Building2, Search, Plus, Edit, Trash2, Users } from 'lucide-react';
import Button from '../components/Button';
import { LoadingOverlay } from '../components/LoadingSpinner';
import DepartmentModal from '../components/DepartmentModal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
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
    fetchData();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [searchTerm, departments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsRes, employeesRes] = await Promise.all([
        departmentAPI.getDepartments(),
        employeeAPI.getEmployees()
      ]);

      const departmentData = departmentsRes?.data || departmentsRes || [];
      const employeeData = employeesRes?.data || employeesRes || [];

      setDepartments(departmentData);
      setEmployees(employeeData);
      setFilteredDepartments(departmentData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = [...departments];

    if (searchTerm) {
      filtered = filtered.filter(dept =>
        dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.headOfDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
  };

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
          fetchData();
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
      fetchData();
    } catch (error) {
      console.error('Error submitting department:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to save department');
      throw error;
    }
  };

  const getEmployeeCount = (department) => {
    const deptId = department.id || department.ID;
    return employees.filter(emp => 
      (emp.departmentId || emp.department?.id || emp.department?.ID) == deptId
    ).length;
  };

  const getManagerName = (department) => {
    if (department.headOfDepartment) return department.headOfDepartment;
    if (department.manager) {
      return `${department.manager.firstName} ${department.manager.lastName}`;
    }
    
    const manager = employees.find(emp => 
      (emp.id || emp.ID) == (department.managerId || department.manager?.id || department.manager?.ID)
    );
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Not assigned';
  };

  if (loading) {
    return <LoadingOverlay message="Loading departments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Department Management
          </h1>
          <p className="opacity-70 mt-1">
            Manage and view all departments ({filteredDepartments.length} of {departments.length})
          </p>
        </div>
        <Button variant="primary" onClick={handleAddDepartment}>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Search Departments</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="text"
                placeholder="Search by name, description, or manager..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {searchTerm && (
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="small"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Departments Grid */}
      {filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <div
              key={department.id || department.ID}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200 border border-base-300"
            >
              <div className="card-body">
                {/* Department Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-secondary-focus flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{department.name}</h3>
                      <p className="text-sm opacity-60">
                        {department.employeeCount || getEmployeeCount(department)} employees
                      </p>
                    </div>
                  </div>
                </div>

                {/* Department Info */}
                <div className="space-y-3">
                  {/* Description */}
                  <div>
                    <p className="text-sm opacity-70 line-clamp-2">
                      {department.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Manager */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-base-200">
                    <Users className="w-4 h-4 opacity-60" />
                    <div>
                      <p className="text-xs opacity-60">Department Head</p>
                      <p className="font-medium text-sm">{getManagerName(department)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions justify-end mt-4 pt-4 border-t border-base-300">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleEditDepartment(department)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleDeleteDepartment(department)}
                    className="text-error hover:bg-error/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-16">
            <Building2 className="w-16 h-16 mx-auto opacity-30 mb-4" />
            <p className="text-lg opacity-60 mb-4">
              {searchTerm
                ? 'No departments found matching your search'
                : 'No departments yet'}
            </p>
            {departments.length === 0 && (
              <Button variant="primary" onClick={handleAddDepartment}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Department
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
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

export default DepartmentsPage;
