import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { leaveAPI } from '../services/api';

const LeaveRequestNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' }
  ];

  const validateForm = () => {
    const newErrors = {};

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

    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = 'Please provide a reason (at least 10 characters)';
    }

    if (formData.reason && formData.reason.length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
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
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      await leaveAPI.createLeaveRequest({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });

      toast.success('Leave request submitted successfully!');
      navigate('/employee');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      if (error.response?.status === 500) {
        return; // Don't show toast for 500 errors
      }
      toast.error(error.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee');
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
        Request Leave
      </h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Leave Type</span>
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="select select-bordered w-full"
                disabled={loading}
              >
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Start Date</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.startDate ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors.startDate && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.startDate}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">End Date</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.endDate ? 'input-error' : ''}`}
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
            {formData.startDate && formData.endDate && !errors.startDate && !errors.endDate && (
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Duration: {calculateDays()} day(s)</span>
              </div>
            )}

            {/* Reason */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Reason</span>
                <span className="label-text-alt">{formData.reason.length}/500</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`textarea textarea-bordered h-32 ${errors.reason ? 'textarea-error' : ''}`}
                placeholder="Please provide a detailed reason for your leave request..."
                disabled={loading}
                maxLength={500}
              />
              {errors.reason && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.reason}</span>
                </label>
              )}
            </div>

            {/* Action Buttons */}
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
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestNew;
