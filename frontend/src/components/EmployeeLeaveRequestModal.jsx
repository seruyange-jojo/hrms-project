import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';
import { leaveAPI } from '../services/api';
import toast from 'react-hot-toast';

const EmployeeLeaveRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
    days: 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        leaveType: 'Annual Leave',
        startDate: '',
        endDate: '',
        reason: '',
        days: 0
      });
      setErrors({});
    }
  }, [isOpen]);

  // Calculate number of days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end day
      setFormData(prev => ({ ...prev, days: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }

      // Check if start date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for leave is required';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Please provide more details (at least 10 characters)';
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
      const leaveData = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        days: formData.days,
        status: 'pending'
      };

      await leaveAPI.createLeaveRequest(leaveData);
      
      toast.success('Leave request submitted successfully!');
      onClose();
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-primary" />
              Request Leave
            </h3>
            <p className="text-sm opacity-60 mt-1">
              Submit your leave request for manager approval
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Leave Type <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="leaveType"
              className={`select select-bordered w-full ${errors.leaveType ? 'select-error' : ''}`}
              value={formData.leaveType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
            {errors.leaveType && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.leaveType}</span>
              </label>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Start Date <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="startDate"
                className={`input input-bordered w-full ${errors.startDate ? 'input-error' : ''}`}
                value={formData.startDate}
                onChange={handleChange}
                min={getMinDate()}
                disabled={loading}
              />
              {errors.startDate && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.startDate}</span>
                </label>
              )}
            </div>

            {/* End Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  End Date <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="endDate"
                className={`input input-bordered w-full ${errors.endDate ? 'input-error' : ''}`}
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || getMinDate()}
                disabled={loading}
              />
              {errors.endDate && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.endDate}</span>
                </label>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {formData.startDate && formData.endDate && formData.days > 0 && (
            <div className="alert alert-info">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">
                Leave duration: <strong>{formData.days} day{formData.days !== 1 ? 's' : ''}</strong>
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Reason for Leave <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              name="reason"
              className={`textarea textarea-bordered w-full h-32 ${errors.reason ? 'textarea-error' : ''}`}
              placeholder="Please provide detailed reason for your leave request..."
              value={formData.reason}
              onChange={handleChange}
              disabled={loading}
            ></textarea>
            {errors.reason && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.reason}</span>
              </label>
            )}
            <label className="label">
              <span className="label-text-alt opacity-60">
                {formData.reason.length} / 500 characters
              </span>
            </label>
          </div>

          {/* Info Alert */}
          <div className="alert alert-warning">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Please Note:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Leave requests should be submitted at least 3 days in advance</li>
                <li>Your manager will review and approve/reject your request</li>
                <li>You'll receive a notification once your request is processed</li>
              </ul>
            </div>
          </div>

          {/* Request Summary */}
          {formData.leaveType && formData.startDate && formData.endDate && formData.reason && (
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body p-4">
                <h5 className="font-semibold text-sm mb-2">Request Summary</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Leave Type:</span>
                    <span className="font-medium">{formData.leaveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Duration:</span>
                    <span className="font-medium">{formData.days} day{formData.days !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">From:</span>
                    <span className="font-medium">{new Date(formData.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">To:</span>
                    <span className="font-medium">{new Date(formData.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Status:</span>
                    <span className="badge badge-warning badge-sm">Pending Approval</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <FileText className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default EmployeeLeaveRequestModal;
