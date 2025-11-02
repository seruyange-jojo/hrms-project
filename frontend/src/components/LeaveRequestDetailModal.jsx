import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import Button from './Button';
import { formatDate } from '../utils/helpers';

const LeaveRequestDetailModal = ({ isOpen, onClose, leave, onApprove, onReject }) => {
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !leave) return null;

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove(leave.ID || leave.id, comment || 'Approved by manager');
    setProcessing(false);
    setComment('');
    onClose();
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    await onReject(leave.ID || leave.id, comment);
    setProcessing(false);
    setComment('');
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const calculateDuration = () => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Leave Request Details</h3>
            <p className="text-sm opacity-60 mt-1">
              Review and manage leave request
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={processing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leave Request Card */}
        <div className="bg-gradient-to-r from-primary to-primary-focus rounded-lg p-6 mb-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold mb-2">
                {leave.employee?.firstName} {leave.employee?.lastName}
              </h4>
              <p className="text-lg opacity-90">
                {leave.leaveType || 'Leave Request'}
              </p>
            </div>
            <div className={`badge ${getStatusColor(leave.status)} badge-lg`}>
              {leave.status}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Start Date</p>
              <p className="font-semibold">{formatDate(leave.startDate)}</p>
            </div>
            <div>
              <p className="text-sm opacity-70 mb-1">End Date</p>
              <p className="font-semibold">{formatDate(leave.endDate)}</p>
            </div>
            <div>
              <p className="text-sm opacity-70 mb-1">Duration</p>
              <p className="font-semibold">{leave.days || calculateDuration()} days</p>
            </div>
            <div>
              <p className="text-sm opacity-70 mb-1">Submitted</p>
              <p className="font-semibold">
                {leave.createdAt ? formatDate(leave.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Information */}
        <div className="card bg-base-100 border border-base-200 mb-4">
          <div className="card-body">
            <h5 className="font-semibold mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Employee Information
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-70">Email</p>
                <p className="font-medium">{leave.employee?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Department</p>
                <p className="font-medium">
                  {leave.employee?.department?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70">Position</p>
                <p className="font-medium">
                  {leave.employee?.position || leave.employee?.jobTitle || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70">Employee Code</p>
                <p className="font-medium">{leave.employee?.employeeCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Reason */}
        <div className="card bg-base-100 border border-base-200 mb-4">
          <div className="card-body">
            <h5 className="font-semibold mb-3 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-secondary" />
              Leave Reason
            </h5>
            <p className="text-sm">
              {leave.reason || 'No reason provided'}
            </p>
          </div>
        </div>

        {/* Manager Comment/Response */}
        {leave.status?.toLowerCase() === 'pending' && (
          <div className="card bg-base-100 border border-base-200 mb-4">
            <div className="card-body">
              <h5 className="font-semibold mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-accent" />
                Manager Comment
              </h5>
              <textarea
                className="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Add a comment (optional for approval, required for rejection)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={processing}
              ></textarea>
              <p className="text-xs opacity-60 mt-1">
                This comment will be visible to the employee
              </p>
            </div>
          </div>
        )}

        {/* Previous Manager Response (if any) */}
        {leave.managerComment && (
          <div className="card bg-base-100 border border-base-200 mb-4">
            <div className="card-body">
              <h5 className="font-semibold mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-info" />
                Manager Response
              </h5>
              <p className="text-sm">{leave.managerComment}</p>
              {leave.reviewedAt && (
                <p className="text-xs opacity-60 mt-2">
                  Reviewed on {formatDate(leave.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Leave Balance Info (Mock Data) */}
        <div className="alert alert-info mb-4">
          <AlertCircle className="w-5 h-5" />
          <div className="text-sm">
            <p className="font-semibold">Leave Balance Information</p>
            <p>
              Employee has <span className="font-bold">10 days</span> of annual leave remaining.
              This request is for <span className="font-bold">{leave.days || calculateDuration()} days</span>.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={processing}
          >
            Close
          </Button>
          
          {leave.status?.toLowerCase() === 'pending' && (
            <>
              <Button 
                variant="error" 
                onClick={handleReject}
                disabled={processing}
                loading={processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                variant="success" 
                onClick={handleApprove}
                disabled={processing}
                loading={processing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default LeaveRequestDetailModal;
