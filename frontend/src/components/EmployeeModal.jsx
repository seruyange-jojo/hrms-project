import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { departmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const EmployeeModal = ({ isOpen, onClose, onSubmit, employee = null, mode = 'create' }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    hireDate: '',
    salary: '',
    position: '',
    status: 'active',
    departmentId: '',
    managerId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      if (employee && mode === 'edit') {
        setFormData({
          employeeCode: employee.employeeCode || '',
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          email: employee.email || '',
          phone: employee.phone || '',
          address: employee.address || '',
          dateOfBirth: employee.dateOfBirth || '',
          hireDate: employee.hireDate || employee.joinDate || '',
          salary: employee.salary || '',
          position: employee.position || '',
          status: employee.status || 'active',
          departmentId: employee.departmentId || '',
          managerId: employee.managerId || ''
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, employee, mode]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data || response || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      hireDate: new Date().toISOString().split('T')[0],
      salary: '',
      position: '',
      status: 'active',
      departmentId: '',
      managerId: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.employeeCode || !formData.firstName || !formData.lastName || 
        !formData.email || !formData.position || !formData.departmentId || 
        !formData.salary || !formData.hireDate) {
      toast.error('Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Salary validation
    if (parseFloat(formData.salary) <= 0) {
      toast.error('Salary must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert string IDs to numbers for backend
      const submitData = {
        ...formData,
        departmentId: parseInt(formData.departmentId),
        salary: parseFloat(formData.salary),
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      };

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold">
            {mode === 'edit' ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Code */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Employee Code *</span>
              </label>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="EMP001"
                required
                disabled={mode === 'edit'}
              />
            </div>

            {/* Status */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Status *</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            {/* First Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">First Name *</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="John"
                required
              />
            </div>

            {/* Last Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Last Name *</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Doe"
                required
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="john.doe@company.com"
                required
              />
            </div>

            {/* Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Phone</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="+1234567890"
              />
            </div>

            {/* Position */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Position *</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Software Engineer"
                required
              />
            </div>

            {/* Department */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Department *</span>
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept.ID} value={dept.id || dept.ID}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Salary *</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="50000"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Hire Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Hire Date *</span>
              </label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Date of Birth</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            {/* Address - Full Width */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Address</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                placeholder="123 Main St, City, Country"
                rows="2"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-300">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
