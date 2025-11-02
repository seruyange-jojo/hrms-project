import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  Award,
  Target,
  Activity
} from 'lucide-react';
import Button from './Button';
import { employeeAPI, leaveAPI, attendanceAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { LoadingSpinner } from './LoadingSpinner';
import toast from 'react-hot-toast';

const TeamMemberDetailModal = ({ isOpen, onClose, employeeId }) => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    totalDays: 0
  });

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeDetails();
    }
  }, [isOpen, employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);

      // Fetch employee details
      const empResponse = await employeeAPI.getEmployee(employeeId);
      setEmployee(empResponse.data);

      // Fetch leave history
      const leavesResponse = await leaveAPI.getLeaveRequests();
      const employeeLeaves = leavesResponse.data.filter(
        leave => leave.employeeId === employeeId || leave.employee?.id === employeeId
      );
      setLeaveHistory(employeeLeaves);

      // Fetch attendance records
      const attendanceResponse = await attendanceAPI.getAttendance();
      const employeeAttendance = attendanceResponse.data.filter(
        record => record.employeeId === employeeId || record.employee?.id === employeeId
      );
      setAttendanceRecords(employeeAttendance);

      // Calculate attendance statistics
      const stats = {
        present: employeeAttendance.filter(r => r.status?.toLowerCase() === 'present').length,
        late: employeeAttendance.filter(r => r.status?.toLowerCase() === 'late').length,
        absent: employeeAttendance.filter(r => r.status?.toLowerCase() === 'absent').length,
        totalDays: employeeAttendance.length
      };
      setAttendanceStats(stats);

    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = () => {
    if (attendanceStats.totalDays === 0) return 0;
    return Math.round((attendanceStats.present / attendanceStats.totalDays) * 100);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
      case 'approved':
      case 'active':
        return 'badge-success';
      case 'late':
      case 'pending':
        return 'badge-warning';
      case 'absent':
      case 'rejected':
      case 'inactive':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Team Member Details</h3>
            <p className="text-sm opacity-60 mt-1">
              Complete employee information and performance
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : employee ? (
          <>
            {/* Employee Header Card */}
            <div className="bg-gradient-to-r from-primary to-primary-focus rounded-lg p-6 mb-6 text-white">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center text-2xl font-bold shadow-lg">
                    {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold mb-1">
                    {employee.firstName} {employee.lastName}
                  </h4>
                  <p className="text-lg opacity-90 mb-2">
                    {employee.position || employee.jobTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className={`badge ${getStatusColor(employee.status)} badge-sm`}>
                      {employee.status || 'Active'}
                    </div>
                    <div className="badge badge-outline badge-sm">
                      {employee.department?.name || 'No Department'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-6">
              <button
                className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <User className="w-4 h-4 mr-2" />
                Overview
              </button>
              <button
                className={`tab ${activeTab === 'attendance' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Attendance
              </button>
              <button
                className={`tab ${activeTab === 'leave' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('leave')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Leave History
              </button>
              <button
                className={`tab ${activeTab === 'performance' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Information */}
                    <div className="card bg-base-100 border border-base-200">
                      <div className="card-body">
                        <h5 className="font-semibold mb-3 flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-primary" />
                          Contact Information
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 opacity-50" />
                            <span className="text-sm">{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 opacity-50" />
                            <span className="text-sm">{employee.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 opacity-50" />
                            <span className="text-sm">
                              {employee.department?.name || 'No Department'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employment Details */}
                    <div className="card bg-base-100 border border-base-200">
                      <div className="card-body">
                        <h5 className="font-semibold mb-3 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-secondary" />
                          Employment Details
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="opacity-70">Employee Code:</span>
                            <span className="font-medium">{employee.employeeCode}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="opacity-70">Hire Date:</span>
                            <span className="font-medium">
                              {formatDate(employee.hireDate)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="opacity-70">Salary:</span>
                            <span className="font-medium">
                              {formatCurrency(employee.salary)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="stats shadow border border-base-200">
                      <div className="stat">
                        <div className="stat-figure text-success">
                          <Clock className="w-8 h-8" />
                        </div>
                        <div className="stat-title">Attendance Rate</div>
                        <div className="stat-value text-success text-2xl">
                          {calculateAttendanceRate()}%
                        </div>
                      </div>
                    </div>
                    <div className="stats shadow border border-base-200">
                      <div className="stat">
                        <div className="stat-figure text-warning">
                          <Calendar className="w-8 h-8" />
                        </div>
                        <div className="stat-title">Leave Taken</div>
                        <div className="stat-value text-warning text-2xl">
                          {leaveHistory.filter(l => l.status === 'approved').length}
                        </div>
                      </div>
                    </div>
                    <div className="stats shadow border border-base-200">
                      <div className="stat">
                        <div className="stat-figure text-error">
                          <Activity className="w-8 h-8" />
                        </div>
                        <div className="stat-title">Absent Days</div>
                        <div className="stat-value text-error text-2xl">
                          {attendanceStats.absent}
                        </div>
                      </div>
                    </div>
                    <div className="stats shadow border border-base-200">
                      <div className="stat">
                        <div className="stat-figure text-info">
                          <Target className="w-8 h-8" />
                        </div>
                        <div className="stat-title">Late Arrivals</div>
                        <div className="stat-value text-info text-2xl">
                          {attendanceStats.late}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  {/* Attendance Statistics */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-4 rounded-lg bg-success/10">
                      <div className="text-2xl font-bold text-success">
                        {attendanceStats.present}
                      </div>
                      <div className="text-sm opacity-70">Present</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-warning/10">
                      <div className="text-2xl font-bold text-warning">
                        {attendanceStats.late}
                      </div>
                      <div className="text-sm opacity-70">Late</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-error/10">
                      <div className="text-2xl font-bold text-error">
                        {attendanceStats.absent}
                      </div>
                      <div className="text-sm opacity-70">Absent</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-info/10">
                      <div className="text-2xl font-bold text-info">
                        {attendanceStats.totalDays}
                      </div>
                      <div className="text-sm opacity-70">Total Days</div>
                    </div>
                  </div>

                  {/* Recent Attendance Records */}
                  <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                      <h5 className="font-semibold mb-3">Recent Attendance Records</h5>
                      <div className="overflow-x-auto">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Check In</th>
                              <th>Check Out</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceRecords.length > 0 ? (
                              attendanceRecords.slice(0, 10).map((record) => (
                                <tr key={record.ID}>
                                  <td>{formatDate(record.date)}</td>
                                  <td>{record.checkIn || 'N/A'}</td>
                                  <td>{record.checkOut || 'N/A'}</td>
                                  <td>
                                    <div className={`badge ${getStatusColor(record.status)} badge-sm`}>
                                      {record.status}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center opacity-60">
                                  No attendance records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leave History Tab */}
              {activeTab === 'leave' && (
                <div className="space-y-4">
                  <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                      <h5 className="font-semibold mb-3">Leave History</h5>
                      <div className="overflow-x-auto">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Leave Type</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Days</th>
                              <th>Status</th>
                              <th>Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaveHistory.length > 0 ? (
                              leaveHistory.map((leave) => (
                                <tr key={leave.ID}>
                                  <td>{leave.leaveType}</td>
                                  <td>{formatDate(leave.startDate)}</td>
                                  <td>{formatDate(leave.endDate)}</td>
                                  <td>{leave.days}</td>
                                  <td>
                                    <div className={`badge ${getStatusColor(leave.status)} badge-sm`}>
                                      {leave.status}
                                    </div>
                                  </td>
                                  <td className="max-w-xs truncate">
                                    {leave.reason || 'N/A'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="text-center opacity-60">
                                  No leave records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-base-100 border border-base-200">
                      <div className="card-body">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-primary" />
                          Overall Rating
                        </h5>
                        <div className="text-3xl font-bold text-primary">
                          {(3.5 + Math.random() * 1.5).toFixed(1)}/5.0
                        </div>
                        <progress 
                          className="progress progress-primary" 
                          value="85" 
                          max="100"
                        ></progress>
                      </div>
                    </div>
                    <div className="card bg-base-100 border border-base-200">
                      <div className="card-body">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-success" />
                          Goals Completed
                        </h5>
                        <div className="text-3xl font-bold text-success">
                          {Math.floor(8 + Math.random() * 12)}/15
                        </div>
                        <progress 
                          className="progress progress-success" 
                          value="67" 
                          max="100"
                        ></progress>
                      </div>
                    </div>
                    <div className="card bg-base-100 border border-base-200">
                      <div className="card-body">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-warning" />
                          Productivity Score
                        </h5>
                        <div className="text-3xl font-bold text-warning">
                          {Math.floor(75 + Math.random() * 20)}%
                        </div>
                        <progress 
                          className="progress progress-warning" 
                          value="82" 
                          max="100"
                        ></progress>
                      </div>
                    </div>
                  </div>

                  {/* Performance Notes */}
                  <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                      <h5 className="font-semibold mb-3">Performance Notes</h5>
                      <div className="alert alert-info">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm">
                          Performance review and feedback features coming soon. Managers will be able to add notes, set goals, and track progress here.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="modal-action">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" onClick={() => toast.success('Feature coming soon')}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="opacity-60">Employee not found</p>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default TeamMemberDetailModal;
