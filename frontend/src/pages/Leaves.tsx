import { useEffect, useState } from 'react';
import { leaveAPI, employeesAPI } from '../services/api';
import type { LeaveRequest, Employee } from '../types';
import toast from 'react-hot-toast';

const Leaves = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'vacation' as LeaveRequest['leaveType'],
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const data = await leaveAPI.getAll();
      if (statusFilter === 'all') {
        setLeaves(data);
      } else {
        const filtered = data.filter((leave: LeaveRequest) => leave.status === statusFilter);
        setLeaves(filtered);
      }
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await employeesAPI.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
      const requestData = {
        ...formData,
        employeeName: selectedEmployee?.name || 'Unknown',
      };
      await leaveAPI.create(requestData);
      toast.success('Leave request submitted successfully');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleStatusUpdate = async (id: string, status: LeaveRequest['status'], comments?: string) => {
    try {
      await leaveAPI.updateStatus(id, status, comments);
      toast.success(`Leave request ${status}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      leaveType: 'vacation',
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            + Request Leave
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {leaves.length > 0 ? (
            leaves.map((leave) => (
              <li key={leave.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{leave.employeeName}</div>
                        <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          leave.leaveType === 'sick'
                            ? 'bg-red-100 text-red-800'
                            : leave.leaveType === 'vacation'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {leave.leaveType}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {leave.startDate} to {leave.endDate}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">{leave.reason}</div>
                      {leave.approverComments && (
                        <div className="mt-1 text-sm text-gray-500 italic">
                          Comments: {leave.approverComments}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        leave.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : leave.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                      {leave.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(leave.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 text-center text-gray-500">No leave requests found</li>
          )}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Request Leave
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee</label>
                      <select
                        required
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                      <select
                        required
                        value={formData.leaveType}
                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="vacation">Vacation</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason</label>
                      <textarea
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;



