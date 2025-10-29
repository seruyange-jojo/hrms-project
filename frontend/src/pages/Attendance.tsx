import { useEffect, useState } from 'react';
import { attendanceAPI, employeesAPI } from '../services/api';
import type { Attendance, Employee } from '../types';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const data = await attendanceAPI.getAll();
      const filtered = data.filter((record: Attendance) => record.date === selectedDate);
      setAttendance(filtered);
    } catch (error) {
      toast.error('Failed to fetch attendance');
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

  const handleCheckIn = async (employeeId: string) => {
    try {
      await attendanceAPI.markCheckIn(employeeId);
      toast.success('Check-in recorded');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record check-in');
    }
  };

  const handleCheckOut = async (employeeId: string) => {
    try {
      await attendanceAPI.markCheckOut(employeeId);
      toast.success('Check-out recorded');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record check-out');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {attendance.length > 0 ? (
            attendance.map((record) => (
              <li key={record.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {record.employeeName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                        <div className="text-sm text-gray-500">
                          Check-in: {record.checkIn} {record.checkOut && `| Check-out: ${record.checkOut}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {record.hours && (
                        <div className="text-sm text-gray-500">{record.hours} hours</div>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present' || record.status === 'late'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 text-center text-gray-500">No attendance records for this date</li>
          )}
        </ul>
      </div>

      {/* Manual Check-in/Check-out */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees
            .filter((emp) => emp.status === 'active')
            .map((employee) => {
              const todayRecord = attendance.find(
                (a) => a.employeeId === employee.id && a.date === selectedDate
              );
              return (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-xs text-gray-500">{employee.position}</div>
                  </div>
                  <div>
                    {!todayRecord ? (
                      <button
                        onClick={() => handleCheckIn(employee.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Check In
                      </button>
                    ) : !todayRecord.checkOut ? (
                      <button
                        onClick={() => handleCheckOut(employee.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        Check Out
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Attendance;



