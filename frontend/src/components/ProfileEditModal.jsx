import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, Building, Calendar, Save, AlertCircle } from 'lucide-react';
import Button from './Button';
import { employeeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const ProfileEditModal = ({ isOpen, onClose, onSuccess, employeeData }) => {
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employeeData) {
      // Initialize form with current employee data
      setFormData({
        phone: employeeData.phone || '',
        address: employeeData.address || '',
        emergencyContactName: employeeData.emergencyContactName || '',
        emergencyContactPhone: employeeData.emergencyContactPhone || '',
        emergencyContactRelation: employeeData.emergencyContactRelation || ''
      });
      setErrors({});
    }
  }, [isOpen, employeeData]);

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    if (formData.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      } else if (formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      }
    }

    // Emergency contact phone validation
    if (formData.emergencyContactPhone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = 'Invalid phone number format';
      } else if (formData.emergencyContactPhone.replace(/\D/g, '').length < 10) {
        newErrors.emergencyContactPhone = 'Phone number must be at least 10 digits';
      }
    }

    // If emergency contact name is provided, phone and relation are required
    if (formData.emergencyContactName && !formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }
    if (formData.emergencyContactName && !formData.emergencyContactRelation) {
      newErrors.emergencyContactRelation = 'Emergency contact relation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        phone: formData.phone,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation
      };

      await employeeAPI.updateEmployee(employeeData.id || employeeData.ID, updateData);
      
      toast.success('Profile updated successfully!');
      onClose();
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen || !employeeData) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center">
              <User className="w-6 h-6 mr-2 text-primary" />
              Edit Profile
            </h3>
            <p className="text-sm opacity-60 mt-1">
              Update your contact information and emergency details
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Information Card */}
        <div className="card bg-base-200 border border-base-300 mb-6">
          <div className="card-body p-4">
            <h5 className="font-semibold text-sm mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Employment Information (Read-Only)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start">
                <User className="w-4 h-4 mr-2 opacity-60 mt-0.5" />
                <div>
                  <p className="opacity-60 text-xs">Full Name</p>
                  <p className="font-medium">{employeeData.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-4 h-4 mr-2 opacity-60 mt-0.5" />
                <div>
                  <p className="opacity-60 text-xs">Email</p>
                  <p className="font-medium">{employeeData.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Building className="w-4 h-4 mr-2 opacity-60 mt-0.5" />
                <div>
                  <p className="opacity-60 text-xs">Department</p>
                  <p className="font-medium">{employeeData.departmentName || employeeData.department || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Briefcase className="w-4 h-4 mr-2 opacity-60 mt-0.5" />
                <div>
                  <p className="opacity-60 text-xs">Position</p>
                  <p className="font-medium">{employeeData.position || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-4 h-4 mr-2 opacity-60 mt-0.5" />
                <div>
                  <p className="opacity-60 text-xs">Hire Date</p>
                  <p className="font-medium">{employeeData.hireDate ? formatDate(employeeData.hireDate) : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <User className="w-4 h-4 mr-2 opacity-60 mt-0.5" />
                <div>
                  <p className="opacity-60 text-xs">Employee ID</p>
                  <p className="font-medium">{employeeData.employeeId || employeeData.id || employeeData.ID || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information Section */}
          <div>
            <h5 className="font-semibold mb-3 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Contact Information
            </h5>
            <div className="space-y-4">
              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                  placeholder="e.g., +1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.phone && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.phone}</span>
                  </label>
                )}
              </div>

              {/* Address */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <textarea
                  name="address"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Enter your full address..."
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div>
            <h5 className="font-semibold mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-warning" />
              Emergency Contact
            </h5>
            <div className="space-y-4">
              {/* Emergency Contact Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Contact Name</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="input input-bordered w-full"
                  placeholder="e.g., John Doe"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Emergency Contact Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Contact Phone</span>
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className={`input input-bordered w-full ${errors.emergencyContactPhone ? 'input-error' : ''}`}
                  placeholder="e.g., +1 (555) 987-6543"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.emergencyContactPhone && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.emergencyContactPhone}</span>
                  </label>
                )}
              </div>

              {/* Emergency Contact Relation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Relationship</span>
                </label>
                <select
                  name="emergencyContactRelation"
                  className={`select select-bordered w-full ${errors.emergencyContactRelation ? 'select-error' : ''}`}
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
                {errors.emergencyContactRelation && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.emergencyContactRelation}</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="alert alert-info">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">
              <p>For changes to your name, email, or department, please contact HR.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default ProfileEditModal;
