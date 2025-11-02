import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { employeeAPI } from '../services/api';
import toast from 'react-hot-toast';

const DepartmentModal = ({ isOpen, onClose, onSubmit, department = null, mode = 'create' }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      if (department && mode === 'edit') {
        setFormData({
          name: department.name || '',
          description: department.description || '',
          managerId: department.managerId || ''
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, department, mode]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getEmployees();
      const employeeData = response.data || response || [];
      // Filter for potential managers (e.g., those with manager/lead positions)
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
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
    if (!formData.name) {
      toast.error('Please enter a department name');
      return false;
    }

    if (formData.name.length < 2) {
      toast.error('Department name must be at least 2 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert managerId to number if provided
      const submitData = {
        ...formData,
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
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold">
            {mode === 'edit' ? 'Edit Department' : 'Add New Department'}
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
          <div className="space-y-4">
            {/* Department Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Department Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="e.g., Engineering, Human Resources"
                required
              />
            </div>

            {/* Manager */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Department Head/Manager</span>
              </label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Select Manager (Optional)</option>
                {employees.map((emp) => (
                  <option key={emp.id || emp.ID} value={emp.id || emp.ID}>
                    {emp.firstName} {emp.lastName} - {emp.position}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt opacity-70">
                  Select an employee to manage this department
                </span>
              </label>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                placeholder="Brief description of the department's responsibilities..."
                rows="4"
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
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Department' : 'Add Department'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;
