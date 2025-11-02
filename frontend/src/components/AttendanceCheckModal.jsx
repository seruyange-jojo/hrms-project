import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, CheckCircle, AlertCircle, LogIn, LogOut, Calendar } from 'lucide-react';
import Button from './Button';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const AttendanceCheckModal = ({ isOpen, onClose, onSuccess, type, todayAttendance }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Office');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Update current time every second
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocation('Office');
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const attendanceData = {
        checkInTime: type === 'in' ? new Date().toISOString() : undefined,
        checkOutTime: type === 'out' ? new Date().toISOString() : undefined,
        location,
        notes: notes.trim() || undefined,
        date: new Date().toISOString().split('T')[0]
      };

      if (type === 'in') {
        await attendanceAPI.checkIn(attendanceData);
        toast.success('Checked in successfully!');
      } else {
        await attendanceAPI.checkOut(attendanceData);
        toast.success('Checked out successfully!');
      }

      onClose();
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error(`Error during check ${type}:`, error);
      toast.error(error.response?.data?.message || `Failed to check ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWorkingHours = () => {
    if (type === 'out' && todayAttendance?.checkInTime) {
      const checkIn = new Date(todayAttendance.checkInTime);
      const now = new Date();
      const diffMs = now - checkIn;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHrs}h ${diffMins}m`;
    }
    return null;
  };

  if (!isOpen) return null;

  const isCheckIn = type === 'in';
  const title = isCheckIn ? 'Check In' : 'Check Out';
  const icon = isCheckIn ? LogIn : LogOut;
  const Icon = icon;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center">
              <Icon className={`w-6 h-6 mr-2 ${isCheckIn ? 'text-success' : 'text-warning'}`} />
              {title}
            </h3>
            <p className="text-sm opacity-60 mt-1">
              {isCheckIn ? 'Start your work day' : 'End your work day'}
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

        {/* Current Time Display */}
        <div className={`card ${isCheckIn ? 'bg-success' : 'bg-warning'} text-white mb-6`}>
          <div className="card-body p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <p className="text-5xl font-bold mb-2">{formatTime(currentTime)}</p>
            <p className="text-sm opacity-90">{formatFullDate(currentTime)}</p>
          </div>
        </div>

        {/* Check In Info */}
        {!isCheckIn && todayAttendance?.checkInTime && (
          <div className="alert alert-info mb-4">
            <CheckCircle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Today's Check In</p>
              <p>Time: {new Date(todayAttendance.checkInTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</p>
              {getWorkingHours() && (
                <p>Working Hours: <strong>{getWorkingHours()}</strong></p>
              )}
            </div>
          </div>
        )}

        {/* Already Checked In Warning */}
        {isCheckIn && todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && (
          <div className="alert alert-warning mb-4">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Already Checked In</p>
              <p>You checked in today at {new Date(todayAttendance.checkInTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</p>
            </div>
          </div>
        )}

        {/* Already Checked Out Warning */}
        {!isCheckIn && todayAttendance?.checkOutTime && (
          <div className="alert alert-warning mb-4">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Already Checked Out</p>
              <p>You checked out today at {new Date(todayAttendance.checkOutTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</p>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </span>
          </label>
          <select
            className="select select-bordered w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
          >
            <option value="Office">Office</option>
            <option value="Remote">Remote / Work from Home</option>
            <option value="Client Site">Client Site</option>
            <option value="Field Work">Field Work</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold">
              Notes (Optional)
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder={isCheckIn ? "Add any notes about your work plan for today..." : "Add any notes about your work completed today..."}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            maxLength={500}
          ></textarea>
          <label className="label">
            <span className="label-text-alt opacity-60">
              {notes.length} / 500 characters
            </span>
          </label>
        </div>

        {/* Summary Card */}
        <div className="card bg-base-200 border border-base-300 mb-6">
          <div className="card-body p-4">
            <h5 className="font-semibold text-sm mb-3">Summary</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Action:</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Time:</span>
                <span className="font-medium">{formatTime(currentTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Date:</span>
                <span className="font-medium">{formatDate(currentTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Location:</span>
                <span className="font-medium">{location}</span>
              </div>
              {getWorkingHours() && (
                <div className="flex justify-between">
                  <span className="opacity-70">Working Hours:</span>
                  <span className="font-medium text-success">{getWorkingHours()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="alert mb-6">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">
            {isCheckIn 
              ? "Your attendance will be recorded at the current time. Make sure to check out when you leave."
              : "Your working hours will be calculated from your check-in time. This action cannot be undone."}
          </p>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant={isCheckIn ? "success" : "warning"}
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || (isCheckIn && todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) || (!isCheckIn && todayAttendance?.checkOutTime)}
          >
            <Icon className="w-4 h-4 mr-2" />
            Confirm {title}
          </Button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default AttendanceCheckModal;
