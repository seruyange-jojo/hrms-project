import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { employeeAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEmployeeData();
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user?.employeeId) {
      setFetching(false);
      return;
    }

    try {
      setFetching(true);
      const response = await employeeAPI.getEmployee(user.employeeId);
      const employee = response.data.employee;
      setEmployeeData(employee);
      
      // Format date for input[type="date"]
      const dob = employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '';
      
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        dateOfBirth: dob
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      if (error.response?.status !== 500) {
        toast.error('Failed to load profile data');
      }
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName || formData.firstName.trim().length === 0) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName || formData.lastName.trim().length === 0) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'Must be at least 18 years old';
      }
      if (age > 100) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      await employeeAPI.updateEmployee(user.employeeId, formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchEmployeeData(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status !== 500) {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (employeeData) {
      const dob = employeeData.dateOfBirth ? employeeData.dateOfBirth.split('T')[0] : '';
      setFormData({
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        address: employeeData.address || '',
        dateOfBirth: dob
      });
    }
    setErrors({});
    setEditing(false);
  };

  if (fetching) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
          My Profile
        </h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
          My Profile
        </h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {!editing ? (
            // View Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm opacity-70 mb-1">First Name</p>
                  <p className="text-lg font-semibold">{employeeData?.firstName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Last Name</p>
                  <p className="text-lg font-semibold">{employeeData?.lastName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Email</p>
                  <p className="text-lg">{employeeData?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Phone</p>
                  <p className="text-lg">{employeeData?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Date of Birth</p>
                  <p className="text-lg">
                    {employeeData?.dateOfBirth 
                      ? new Date(employeeData.dateOfBirth).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Role</p>
                  <p className="text-lg capitalize">{user?.role || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm opacity-70 mb-1">Address</p>
                  <p className="text-lg">{employeeData?.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Position</p>
                  <p className="text-lg">{employeeData?.position || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Department</p>
                  <p className="text-lg">{employeeData?.departmentName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Hire Date</p>
                  <p className="text-lg">
                    {employeeData?.hireDate 
                      ? new Date(employeeData.hireDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Salary</p>
                  <p className="text-lg">${employeeData?.salary?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">First Name *</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.firstName}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Last Name *</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.lastName}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.email}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                    disabled={loading}
                    placeholder="+1234567890"
                  />
                  {errors.phone && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.phone}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${errors.dateOfBirth ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                  {errors.dateOfBirth && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.dateOfBirth}</span>
                    </label>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Address</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="textarea textarea-bordered h-20"
                    disabled={loading}
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
