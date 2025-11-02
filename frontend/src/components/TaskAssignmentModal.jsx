import React, { useState, useEffect } from 'react';
import { X, UserPlus, Calendar, AlertCircle, Target, Clock } from 'lucide-react';
import Button from './Button';
import { employeeAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskAssignmentModal = ({ isOpen, onClose, teamMembers = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    category: 'general'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        category: 'general'
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign this task to a team member';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
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
      // In a real app, this would POST to an API endpoint
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Task assigned successfully!');
      onClose();
      
      // You can add a callback here to refresh the task list
      // onTaskCreated(formData);
      
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
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
              <UserPlus className="w-6 h-6 mr-2 text-primary" />
              Assign New Task
            </h3>
            <p className="text-sm opacity-60 mt-1">
              Create and assign a task to your team member
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
          {/* Task Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Task Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="title"
              className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g., Complete Q4 Performance Review"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.title && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.title}</span>
              </label>
            )}
          </div>

          {/* Task Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Description <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              name="description"
              className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
              placeholder="Provide detailed task description..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            ></textarea>
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.description}</span>
              </label>
            )}
          </div>

          {/* Assign To & Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assign To */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Assign To <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="assignedTo"
                className={`select select-bordered w-full ${errors.assignedTo ? 'select-error' : ''}`}
                value={formData.assignedTo}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select team member</option>
                {teamMembers.map((member) => (
                  <option key={member.id || member.ID} value={member.id || member.ID}>
                    {member.firstName} {member.lastName} - {member.position || member.jobTitle}
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.assignedTo}</span>
                </label>
              )}
            </div>

            {/* Due Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Due Date <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="dueDate"
                className={`input input-bordered w-full ${errors.dueDate ? 'input-error' : ''}`}
                value={formData.dueDate}
                onChange={handleChange}
                min={getMinDate()}
                disabled={loading}
              />
              {errors.dueDate && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.dueDate}</span>
                </label>
              )}
            </div>
          </div>

          {/* Priority & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Priority</span>
              </label>
              <select
                name="priority"
                className="select select-bordered w-full"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category</span>
              </label>
              <select
                name="category"
                className="select select-bordered w-full"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="general">General Task</option>
                <option value="development">Development</option>
                <option value="review">Performance Review</option>
                <option value="training">Training</option>
                <option value="documentation">Documentation</option>
                <option value="meeting">Meeting/Planning</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Info Alert */}
          <div className="alert alert-info">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Task Assignment</p>
              <p>
                The assigned team member will be notified about this task. They can view and update the task status from their dashboard.
              </p>
            </div>
          </div>

          {/* Form Summary Preview */}
          {formData.title && formData.assignedTo && (
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body p-4">
                <h5 className="font-semibold text-sm mb-2">Task Preview</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-secondary" />
                    <span>
                      {teamMembers.find(m => (m.id || m.ID) === parseInt(formData.assignedTo))?.firstName}{' '}
                      {teamMembers.find(m => (m.id || m.ID) === parseInt(formData.assignedTo))?.lastName}
                    </span>
                  </div>
                  {formData.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span>Due: {new Date(formData.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <div className={`badge ${
                      formData.priority === 'urgent' ? 'badge-error' :
                      formData.priority === 'high' ? 'badge-warning' :
                      formData.priority === 'medium' ? 'badge-info' : 'badge-ghost'
                    } badge-sm`}>
                      {formData.priority}
                    </div>
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
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Task
            </Button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default TaskAssignmentModal;
