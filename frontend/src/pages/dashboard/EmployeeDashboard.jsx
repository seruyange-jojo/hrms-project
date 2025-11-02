import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { employeeAPI, attendanceAPI, leaveAPI, payrollAPI } from '../../services/api';
import { 
  Clock, 
  Calendar, 
  DollarSign,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Settings,
  Plus
} from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import { LoadingOverlay } from '../../components/LoadingSpinner';
import { StatsCard, CardWithHeader } from '../../components/Card';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendanceThisMonth: 0,
    leaveBalance: {
      annual: 0,
      sick: 0
    },
    pendingLeaveRequests: 0,
    currentMonthSalary: 0,
    workingHoursThisWeek: 0,
    attendanceStreak: 0,
    nextPayday: null
  });
  const [recentData, setRecentData] = useState({
    myAttendance: [],
    myLeaveRequests: [],
    myPayrollRecords: [],
    companyAnnouncements: []
  });
  const [myProfile, setMyProfile] = useState(null);

  // Set page title for clarity
  useEffect(() => {
    document.title = 'Employee Dashboard - HRMS';
  }, []);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);

        // Get all data and filter for current employee
        const [employeesRes, attendanceRes, leavesRes, payrollRes] = await Promise.all([
          employeeAPI.getEmployees().catch(() => ({ data: [] })),
          attendanceAPI.getAttendance().catch(() => ({ data: [] })),
          leaveAPI.getLeaveRequests().catch(() => ({ data: [] })),
          payrollAPI.getPayrollRecords().catch(() => ({ data: [] }))
        ]);

        const employees = employeesRes?.data || [];
        const attendance = attendanceRes?.data || [];
        const leaves = leavesRes?.data || [];
        const payrollRecords = payrollRes?.data || [];

        // Find current employee's profile
        const employeeProfile = employees.find(emp => 
          emp.email === user.email || emp.userId === user.id
        );
        
        if (!employeeProfile) {
          console.error('Employee profile not found for user:', user.email);
          toast.error('Employee profile not found. Please contact admin to create your employee record.');
          // Set empty profile to prevent crashes
          setMyProfile({ 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email,
            id: user.id 
          });
          setLoading(false);
          return;
        }

        setMyProfile(employeeProfile);

        // Filter data for current employee ONLY - strict filtering
        const employeeId = employeeProfile.id || employeeProfile.ID;
        const employeeEmail = employeeProfile.email;
        
        const myAttendance = attendance.filter(att => {
          return att.employeeId === employeeId || 
                 att.employeeId === String(employeeId) ||
                 att.employee?.email === employeeEmail;
        });
        
        const myLeaves = leaves.filter(leave => {
          return leave.employeeId === employeeId || 
                 leave.employeeId === String(employeeId) ||
                 leave.employee?.email === employeeEmail;
        });
        
        const myPayroll = payrollRecords.filter(payroll => {
          return payroll.employeeId === employeeId || 
                 payroll.employeeId === String(employeeId) ||
                 payroll.employee?.email === employeeEmail;
        });

        // Log filtering results for debugging
        console.log(`Employee ${employeeProfile.firstName} ${employeeProfile.lastName} (ID: ${employeeId})`);
        console.log(`Filtered data: ${myAttendance.length} attendance, ${myLeaves.length} leaves, ${myPayroll.length} payroll records`);

        // Calculate employee-specific stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Attendance this month
        const thisMonthAttendance = myAttendance.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() === currentMonth && 
                 recordDate.getFullYear() === currentYear &&
                 record.status?.toLowerCase() === 'present';
        });
        const attendanceThisMonth = thisMonthAttendance.length;

        // Leave balance calculation (mock - should come from backend)
        const usedAnnualLeave = myLeaves.filter(leave => 
          leave.leaveType?.toLowerCase().includes('annual') && 
          leave.status?.toLowerCase() === 'approved'
        ).reduce((sum, leave) => sum + (leave.days || 0), 0);
        
        const usedSickLeave = myLeaves.filter(leave => 
          leave.leaveType?.toLowerCase().includes('sick') && 
          leave.status?.toLowerCase() === 'approved'
        ).reduce((sum, leave) => sum + (leave.days || 0), 0);

        // Assuming standard leave entitlement (should come from backend)
        const annualLeaveEntitlement = 25;
        const sickLeaveEntitlement = 10;

        const leaveBalance = {
          annual: Math.max(0, annualLeaveEntitlement - usedAnnualLeave),
          sick: Math.max(0, sickLeaveEntitlement - usedSickLeave)
        };

        // Pending leave requests
        const pendingLeaveRequests = myLeaves.filter(leave => 
          leave.status?.toLowerCase() === 'pending'
        ).length;

        // Current month salary
        const currentMonthPayroll = myPayroll.find(record => {
          const payDate = new Date(record.payPeriodStart);
          return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
        });
        const currentMonthSalary = currentMonthPayroll?.netPay || employeeProfile.salary || 0;

        // Working hours this week
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const thisWeekAttendance = myAttendance.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= startOfWeek;
        });
        const workingHoursThisWeek = thisWeekAttendance.reduce((sum, record) => 
          sum + (record.workingHours || 0), 0
        );

        // Attendance streak (consecutive present days up to today)
        const byDateDesc = [...myAttendance].sort((a, b) => new Date(b.date) - new Date(a.date));
        const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        let streak = 0;
        let cursor = new Date();
        // Count from today backwards
        for (const rec of byDateDesc) {
          const rd = new Date(rec.date);
          if (isSameDay(rd, cursor)) {
            if ((rec.status || '').toLowerCase() === 'present') {
              streak += 1;
              // move cursor one day back
              cursor = new Date(cursor);
              cursor.setDate(cursor.getDate() - 1);
            } else {
              break;
            }
          } else if (rd < cursor) {
            // If there's a gap day without present record, stop
            break;
          }
        }

        // Next payday (assume end of current month if not provided by payroll data)
        const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
        const nextPayday = endOfCurrentMonth;

        setStats({
          attendanceThisMonth,
          leaveBalance,
          pendingLeaveRequests,
          currentMonthSalary,
          workingHoursThisWeek,
          attendanceStreak: streak,
          nextPayday
        });

        // Set recent data for employee
        setRecentData({
          myAttendance: myAttendance.slice(0, 5),
          myLeaveRequests: myLeaves.slice(0, 5),
          myPayrollRecords: myPayroll.slice(0, 3),
          companyAnnouncements: [] // Can be populated with company announcements
        });

      } catch (error) {
        console.error('Error fetching employee dashboard data:', error);
        toast.error('Failed to load employee dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchEmployeeData();
    }
  }, [user]);

  // Derived UI state - MUST be before any conditional returns (Rules of Hooks)
  const today = useMemo(() => new Date(), []);
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const todayAttendance = useMemo(() => {
    return recentData.myAttendance.find(a => isSameDay(new Date(a.date), today));
  }, [recentData.myAttendance, today]);
  const isCheckedIn = Boolean(todayAttendance?.checkIn && !todayAttendance?.checkOut);
  const weeklyHoursTarget = 40;
  const weeklyHoursPct = Math.min(100, Math.round((stats.workingHoursThisWeek / weeklyHoursTarget) * 100));
  const annualUsed = 25 - stats.leaveBalance.annual;
  const sickUsed = 10 - stats.leaveBalance.sick;
  const annualPct = Math.min(100, Math.round((annualUsed / 25) * 100));
  const sickPct = Math.min(100, Math.round((sickUsed / 10) * 100));

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully');
      // Refresh data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully');
      // Refresh data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to check out');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
            <p className="opacity-70 mt-2 text-sm sm:text-base">
              Welcome back, {user?.firstName}!{myProfile?.position ? ` ${myProfile.position}` : ''}{myProfile?.department?.name ? ` - ${myProfile.department.name}` : ''}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button variant="success" size="small" className="btn-sm" onClick={handleCheckIn} disabled={isCheckedIn}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {isCheckedIn ? 'Already Checked In' : 'Check In'}
            </Button>
            <Button variant="error" size="small" className="btn-sm" onClick={handleCheckOut} disabled={!isCheckedIn}>
              <AlertCircle className="w-4 h-4 mr-2" />
              {isCheckedIn ? 'Check Out' : 'Check Out (Not Checked In)'}
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Attendance This Month"
          value={stats.attendanceThisMonth}
          icon={CheckCircle}
          color="success"
        />
        <StatsCard
          title="Annual Leave Balance"
          value={`${stats.leaveBalance.annual} days`}
          icon={Calendar}
          color="info"
        />
        <StatsCard
          title="Sick Leave Balance"
          value={`${stats.leaveBalance.sick} days`}
          icon={Calendar}
          color="warning"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingLeaveRequests}
          icon={AlertCircle}
          color="error"
        />
        <StatsCard
          title="This Month Salary"
          value={formatCurrency(stats.currentMonthSalary)}
          icon={DollarSign}
          color="primary"
        />
        <StatsCard
          title="Next Payday"
          value={stats.nextPayday ? formatDate(stats.nextPayday) : '—'}
          icon={DollarSign}
          color="secondary"
        />
      </div>

      {/* Employee Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Attendance */}
        <CardWithHeader
          title="My Recent Attendance"
          action={<Button variant="ghost" size="small" onClick={() => navigate('/attendance')}>View All</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.myAttendance.length > 0 ? (
              recentData.myAttendance.map((record) => (
                <div key={record.ID} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{formatDate(record.date)}</p>
                      <p className="text-sm opacity-70">
                        {record.checkIn ? `In: ${record.checkIn}` : 'Not checked in'}
                      </p>
                      <p className="text-xs opacity-50">
                        {record.workingHours ? `${record.workingHours}h worked` : 'Hours not recorded'}
                      </p>
                    </div>
                  </div>
                  <div className={`badge ${getStatusColor(record.status)} badge-sm`}>
                    {record.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No attendance records</p>
              </div>
            )}
          </div>
        </CardWithHeader>

        {/* My Leave Requests */}
        <CardWithHeader
          title="My Leave Requests"
          action={<Button variant="ghost" size="small" onClick={() => navigate('/leaves/new')}>Request Leave</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.myLeaveRequests.length > 0 ? (
              recentData.myLeaveRequests.map((leave) => (
                <div key={leave.ID} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="font-medium">{leave.leaveType}</p>
                      <p className="text-sm opacity-70">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs opacity-50">{leave.days} days</p>
                    </div>
                  </div>
                  <div className={`badge ${getStatusColor(leave.status)} badge-sm`}>
                    {leave.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No leave requests</p>
              </div>
            )}
          </div>
        </CardWithHeader>
      </div>

      {/* Employee Finances & Time Off */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Payslips */}
        <CardWithHeader
          title="My Payslips"
          action={<Button variant="ghost" size="small" onClick={() => navigate('/payroll')}>View All</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.myPayrollRecords.length > 0 ? (
              recentData.myPayrollRecords.map((record, idx) => (
                <div key={record.ID || idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div>
                    <p className="font-medium">{formatDate(record.payPeriodStart)} - {formatDate(record.payPeriodEnd || record.payDate || record.payPeriodStart)}</p>
                    <p className="text-xs opacity-60">Net Pay</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(record.netPay || 0)}</span>
                    <Button variant="outline" size="small">View</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No payslips available</p>
              </div>
            )}
          </div>
        </CardWithHeader>

        {/* Leave Balance & Accrual */}
        <CardWithHeader
          title="Leave Balance & Accrual"
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm opacity-70">Annual Leave Used</span>
                <span className="text-sm font-medium">{annualUsed} / 25 days</span>
              </div>
              <progress className="progress progress-primary w-full" value={annualPct} max="100"></progress>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm opacity-70">Sick Leave Used</span>
                <span className="text-sm font-medium">{sickUsed} / 10 days</span>
              </div>
              <progress className="progress progress-warning w-full" value={sickPct} max="100"></progress>
            </div>
            <div className="text-xs opacity-60">
              Next accrual on the 1st of next month. Balances are indicative; refer to HR for official records.
            </div>
          </div>
        </CardWithHeader>
      </div>

      {/* Attendance Summary & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <CardWithHeader
          title="Attendance Summary"
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm opacity-70">This Week Hours</span>
              <span className="text-sm font-medium">{stats.workingHoursThisWeek} / {weeklyHoursTarget}h</span>
            </div>
            <progress className="progress progress-success w-full" value={weeklyHoursPct} max="100"></progress>
            <div className="flex items-center justify-between text-sm opacity-70">
              <span>Present Streak</span>
              <span className="font-medium">{stats.attendanceStreak} day{stats.attendanceStreak === 1 ? '' : 's'}</span>
            </div>
          </div>
        </CardWithHeader>

        {/* Announcements */}
        <CardWithHeader
          title="Announcements"
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.companyAnnouncements.length > 0 ? (
              recentData.companyAnnouncements.map((note, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-base-200">
                  <p className="font-medium">{note.title || 'Announcement'}</p>
                  <p className="text-sm opacity-70">{note.message || note.text}</p>
                  {note.date && <p className="text-xs opacity-50 mt-1">{formatDate(note.date)}</p>}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No announcements</p>
              </div>
            )}
          </div>
        </CardWithHeader>
      </div>

      {/* Employee Quick Actions */}
      <CardWithHeader
        title="Quick Actions"
        className="hover:shadow-lg transition-shadow duration-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="success" className="h-20 flex-col" onClick={handleCheckIn} disabled={isCheckedIn}>
            <CheckCircle className="w-6 h-6 mb-2" />
            {isCheckedIn ? 'Already Checked In' : 'Mark Attendance'}
          </Button>
          <Button variant="info" className="h-20 flex-col" onClick={() => navigate('/leaves/new')}>
            <Calendar className="w-6 h-6 mb-2" />
            Request Leave
          </Button>
          <Button variant="primary" className="h-20 flex-col" onClick={() => navigate('/my-payroll')}>
            <DollarSign className="w-6 h-6 mb-2" />
            View Pay Stub
          </Button>
          <Button variant="accent" className="h-20 flex-col" onClick={() => navigate('/profile')}>
            <User className="w-6 h-6 mb-2" />
            Update Profile
          </Button>
        </div>
      </CardWithHeader>

      {/* Personal Summary */}
      {myProfile && (
        <CardWithHeader
          title="My Profile Summary"
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {myProfile.firstName?.charAt(0)}{myProfile.lastName?.charAt(0)}
              </div>
              <h3 className="font-semibold">{myProfile.firstName} {myProfile.lastName}</h3>
              <p className="text-sm opacity-70">{myProfile.position}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Department</h4>
              <p className="text-sm opacity-70">{myProfile.department?.name}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Employee Code</h4>
              <p className="text-sm opacity-70">{myProfile.employeeCode}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Hire Date</h4>
              <p className="text-sm opacity-70">{formatDate(myProfile.hireDate)}</p>
            </div>
          </div>
        </CardWithHeader>
      )}
    </div>
  );
};

export default EmployeeDashboard;