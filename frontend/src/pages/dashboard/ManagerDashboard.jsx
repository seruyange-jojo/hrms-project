import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { employeeAPI, attendanceAPI, leaveAPI, departmentAPI } from '../../services/api';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  AlertCircle,
  UserCheck,
  FileText,
  Target
} from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { LoadingOverlay } from '../../components/LoadingSpinner';
import { StatsCard, CardWithHeader } from '../../components/Card';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myTeamSize: 0,
    presentToday: 0,
    pendingLeaveRequests: 0,
    departmentMonthlyCost: 0,
    teamPerformanceScore: 0
  });
  const [recentData, setRecentData] = useState({
    teamLeaveRequests: [],
    teamAttendance: [],
    performanceUpdates: [],
    budgetNotifications: []
  });
  const [myDepartment, setMyDepartment] = useState(null);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        setLoading(true);

        // Get all data and filter for manager's department
        const [employeesRes, departmentsRes, attendanceRes, leavesRes] = await Promise.all([
          employeeAPI.getEmployees().catch(() => ({ data: [] })),
          departmentAPI.getDepartments().catch(() => ({ data: [] })),
          attendanceAPI.getAttendance().catch(() => ({ data: [] })),
          leaveAPI.getLeaveRequests().catch(() => ({ data: [] }))
        ]);

        const employees = employeesRes?.data || [];
        const departments = departmentsRes?.data || [];
        const attendance = attendanceRes?.data || [];
        const leaves = leavesRes?.data || [];

        // Find manager's department (assuming manager email/id matches department manager)
        const managerDepartment = departments.find(dept => 
          dept.managerId === user.id || 
          dept.managerEmail === user.email ||
          employees.find(emp => emp.email === user.email)?.departmentId === dept.id
        );
        
        setMyDepartment(managerDepartment);

        // Filter data for manager's department/team
        const departmentId = managerDepartment?.id;
        const teamEmployees = departmentId ? 
          employees.filter(emp => emp.departmentId === departmentId) : 
          employees; // Fallback to all employees if department not found
        
        const teamAttendance = departmentId ? 
          attendance.filter(att => {
            const employee = employees.find(emp => emp.id === att.employeeId);
            return employee && employee.departmentId === departmentId;
          }) : 
          attendance;
          
        const teamLeaves = departmentId ? 
          leaves.filter(leave => {
            const employee = employees.find(emp => emp.id === leave.employeeId);
            return employee && employee.departmentId === departmentId;
          }) : 
          leaves;

        // Calculate manager-specific stats
        const myTeamSize = teamEmployees.length;
        
        // Present today calculation (team members present today)
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = teamAttendance.filter(record => 
          record.date && record.date.startsWith(today) && record.status?.toLowerCase() === 'present'
        );
        const presentToday = todayAttendance.length;

        // Pending leave requests for my team
        const pendingLeaveRequests = teamLeaves.filter(leave => 
          leave.status?.toLowerCase() === 'pending'
        ).length;

        // Mock department monthly cost (can be calculated from payroll if available)
        const departmentMonthlyCost = teamEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

        // Mock team performance score (can be calculated from attendance, productivity metrics)
        const teamPerformanceScore = Math.round((presentToday / myTeamSize) * 100) || 0;

        setStats({
          myTeamSize,
          presentToday,
          pendingLeaveRequests,
          departmentMonthlyCost,
          teamPerformanceScore
        });

        // Set recent data for manager
        setRecentData({
          teamLeaveRequests: teamLeaves.filter(leave => leave.status?.toLowerCase() === 'pending').slice(0, 5),
          teamAttendance: teamAttendance.slice(0, 5),
          performanceUpdates: [], // Can be populated with performance data
          budgetNotifications: [] // Can be populated with budget alerts
        });

      } catch (error) {
        console.error('Error fetching manager dashboard data:', error);
        toast.error('Failed to load manager dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchManagerData();
    }
  }, [user]);

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.approve(leaveId);
      toast.success('Leave request approved');
      // Refresh data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await leaveAPI.reject(leaveId);
      toast.success('Leave request rejected');
      // Refresh data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading manager dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Manager Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-secondary to-secondary-focus bg-clip-text text-transparent">
              Manager Dashboard
            </h1>
            <p className="opacity-70 mt-2 text-sm sm:text-base">
              Welcome back, {user?.firstName}! Manage your team - {myDepartment?.name || 'Department'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button variant="secondary" size="small" className="btn-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Team Reports
            </Button>
            <Button variant="outline" size="small" className="btn-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Manager Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="My Team Size"
          value={stats.myTeamSize}
          icon={Users}
          color="secondary"
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          color="success"
        />
        <StatsCard
          title="Pending Leaves"
          value={stats.pendingLeaveRequests}
          icon={Calendar}
          color="warning"
        />
        <StatsCard
          title="Team Performance"
          value={`${stats.teamPerformanceScore}%`}
          icon={Target}
          color="info"
        />
        <StatsCard
          title="Department Budget"
          value={`$${(stats.departmentMonthlyCost / 1000).toFixed(1)}K`}
          icon={TrendingUp}
          color="accent"
        />
      </div>

      {/* Manager Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leave Requests */}
        <CardWithHeader
          title="Team Leave Requests"
          action={<Button variant="ghost" size="small">View All</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.teamLeaveRequests.length > 0 ? (
              recentData.teamLeaveRequests.map((leave) => (
                <div key={leave.ID} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </p>
                      <p className="text-sm opacity-70">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs opacity-50">{leave.leaveType} • {leave.days} days</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="success" 
                      size="small" 
                      className="btn-xs"
                      onClick={() => handleApproveLeave(leave.ID)}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="error" 
                      size="small" 
                      className="btn-xs"
                      onClick={() => handleRejectLeave(leave.ID)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No pending leave requests</p>
              </div>
            )}
          </div>
        </CardWithHeader>

        {/* Team Attendance Summary */}
        <CardWithHeader
          title="Team Attendance Summary"
          action={<Button variant="ghost" size="small">View Details</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-3">
            {recentData.teamAttendance.length > 0 ? (
              recentData.teamAttendance.map((record) => (
                <div key={record.ID} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {record.employee?.firstName} {record.employee?.lastName}
                      </p>
                      <p className="text-sm opacity-70">
                        {formatDate(record.date)}
                      </p>
                      <p className="text-xs opacity-50">
                        {record.checkIn ? `In: ${record.checkIn}` : 'Not checked in'}
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
                <p className="opacity-60">No recent attendance records</p>
              </div>
            )}
          </div>
        </CardWithHeader>
      </div>

      {/* Manager Quick Actions */}
      <CardWithHeader
        title="Quick Actions"
        className="hover:shadow-lg transition-shadow duration-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="secondary" className="h-20 flex-col">
            <Calendar className="w-6 h-6 mb-2" />
            Approve Leaves
          </Button>
          <Button variant="success" className="h-20 flex-col">
            <Clock className="w-6 h-6 mb-2" />
            Team Attendance
          </Button>
          <Button variant="info" className="h-20 flex-col">
            <FileText className="w-6 h-6 mb-2" />
            Team Reports
          </Button>
          <Button variant="accent" className="h-20 flex-col">
            <Target className="w-6 h-6 mb-2" />
            Performance Review
          </Button>
        </div>
      </CardWithHeader>
    </div>
  );
};

export default ManagerDashboard;