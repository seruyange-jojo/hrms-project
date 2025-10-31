import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { employeeAPI, attendanceAPI, leaveAPI, departmentAPI } from '../../services/api';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  AlertTriangle,
  Award,
  Target,
  CheckCircle,
  Activity,
  AlertCircle
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

        // Find manager's employee profile first
        const managerProfile = employees.find(emp => 
          emp.email === user.email || emp.userId === user.id
        );

        // Find manager's department using multiple strategies
        let managerDepartment = null;
        
        if (managerProfile?.departmentId) {
          // Strategy 1: Use manager's employee record department
          managerDepartment = departments.find(dept => dept.id === managerProfile.departmentId);
        }
        
        if (!managerDepartment) {
          // Strategy 2: Check if manager is assigned as department manager
          managerDepartment = departments.find(dept => 
            dept.managerId === user.id || 
            dept.managerEmail === user.email
          );
        }

        console.log(`Manager ${user.firstName} ${user.lastName} assigned to department:`, managerDepartment?.name || 'None');
        
        setMyDepartment(managerDepartment);

        // Filter data for manager's department/team ONLY
        const departmentId = managerDepartment?.id;
        
        if (!departmentId) {
          console.warn('Manager department not found. Manager may not be properly assigned to a department.');
          toast.warning('Department information not found. Please contact admin to assign you to a department.');
        }
        
        // Strict filtering - only show team data, never fallback to all data
        const teamEmployees = departmentId ? 
          employees.filter(emp => {
            return emp.departmentId === departmentId || 
                   emp.departmentId === String(departmentId);
          }) : 
          []; // Empty array if no department
        
        const teamAttendance = departmentId ? 
          attendance.filter(att => {
            const employee = employees.find(emp => 
              (emp.id === att.employeeId || emp.ID === att.employeeId) &&
              (emp.departmentId === departmentId || emp.departmentId === String(departmentId))
            );
            return !!employee;
          }) : 
          [];
          
        const teamLeaves = departmentId ? 
          leaves.filter(leave => {
            const employee = employees.find(emp => 
              (emp.id === leave.employeeId || emp.ID === leave.employeeId) &&
              (emp.departmentId === departmentId || emp.departmentId === String(departmentId))
            );
            return !!employee;
          }) : 
          [];

        // Log filtering results
        console.log(`Manager team filtering: ${teamEmployees.length} employees, ${teamAttendance.length} attendance records, ${teamLeaves.length} leave requests`);

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

        setStats({
          myTeamSize,
          presentToday,
          pendingLeaveRequests
        });

        // Filter for today's attendance only for the status view (reuse the today variable)
        const todaysTeamAttendance = teamAttendance.filter(record => 
          record.date && record.date.startsWith(today)
        );

        // Calculate team attendance statistics for today
        const teamAttendanceStats = {
          presentToday: todaysTeamAttendance.filter(record => record.status?.toLowerCase() === 'present').length,
          lateToday: todaysTeamAttendance.filter(record => record.status?.toLowerCase() === 'late').length,
          absentToday: todaysTeamAttendance.filter(record => record.status?.toLowerCase() === 'absent').length
        };

        // Identify attendance issues (late or absent team members)
        const attendanceIssues = todaysTeamAttendance.filter(record => 
          record.status?.toLowerCase() === 'late' || record.status?.toLowerCase() === 'absent'
        );

        // Calculate performance metrics for the team
        const performanceMetrics = {
          teamProductivity: Math.round(70 + Math.random() * 25), // Mock productivity percentage
          averageRating: (3.5 + Math.random() * 1.5).toFixed(1) // Mock average rating
        };

        // Generate performance trends data
        const performanceTrends = [
          {
            metric: 'Task Completion Rate',
            description: 'Weekly completion rate',
            trend: 'up',
            change: '+5.2%'
          },
          {
            metric: 'Team Collaboration',
            description: 'Cross-team projects',
            trend: 'stable',
            change: '0%'
          },
          {
            metric: 'Quality Score',
            description: 'Code review ratings',
            trend: 'up',
            change: '+8.1%'
          }
        ];

        // Generate individual performance data based on team members
        const individualPerformance = teamEmployees.slice(0, 5).map(member => ({
          id: member.id || member.ID,
          name: `${member.firstName} ${member.lastName}`,
          position: member.position || member.jobTitle || 'Team Member',
          score: (3.0 + Math.random() * 2).toFixed(1),
          tasksCompleted: Math.floor(15 + Math.random() * 20)
        }));

        // Generate budget oversight data
        const budgetData = {
          allocated: '50,000',
          spent: '32,450',
          remaining: '17,550',
          utilizationPercent: 65
        };

        const budgetAlerts = [
          {
            type: 'warning',
            message: 'Training budget 80% utilized this quarter'
          }
        ];

        const resourceAllocation = [
          {
            category: 'Personnel',
            description: 'Salaries and benefits',
            amount: '28,500',
            status: 'on-track',
            color: 'bg-primary'
          },
          {
            category: 'Training',
            description: 'Professional development',
            amount: '2,800',
            status: 'at-risk',
            color: 'bg-warning'
          },
          {
            category: 'Equipment',
            description: 'Hardware and software',
            amount: '1,150',
            status: 'on-track',
            color: 'bg-info'
          }
        ];

        // Generate team reports data
        const availableReports = [
          {
            title: 'Monthly Team Performance',
            description: 'Comprehensive performance metrics and insights',
            lastGenerated: 'Oct 15, 2025',
            iconColor: 'bg-primary'
          },
          {
            title: 'Attendance Analysis',
            description: 'Detailed attendance patterns and trends',
            lastGenerated: 'Oct 20, 2025',
            iconColor: 'bg-secondary'
          },
          {
            title: 'Leave Management Report',
            description: 'Leave balances and usage statistics',
            lastGenerated: 'Oct 25, 2025',
            iconColor: 'bg-accent'
          },
          {
            title: 'Budget Utilization',
            description: 'Department budget spending analysis',
            lastGenerated: 'Oct 28, 2025',
            iconColor: 'bg-info'
          }
        ];

        const recentReports = [
          {
            title: 'Q3 Team Summary',
            generatedDate: 'Oct 28, 2025'
          },
          {
            title: 'September Attendance',
            generatedDate: 'Oct 25, 2025'
          },
          {
            title: 'Performance Review',
            generatedDate: 'Oct 20, 2025'
          }
        ];

        // Set recent data for manager - focused on actionable items
        setRecentData({
          teamMembers: teamEmployees, // All team members for management
          teamLeaveRequests: teamLeaves.filter(leave => leave.status?.toLowerCase() === 'pending').slice(0, 5),
          teamAttendance: todaysTeamAttendance.length > 0 ? todaysTeamAttendance : teamAttendance.slice(0, 5),
          teamAttendanceStats, // Today's attendance summary
          attendanceIssues, // Team members with attendance issues
          performanceMetrics, // Team performance overview
          performanceTrends, // Performance trend analysis
          individualPerformance, // Individual team member performance
          budgetData, // Department budget information
          budgetAlerts, // Budget warnings and notifications
          resourceAllocation, // Resource allocation breakdown
          availableReports, // Available report templates
          recentReports, // Recently generated reports
          performanceUpdates: [], // Reserved for future performance data
          budgetNotifications: [] // Reserved for future budget alerts
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
      const response = await axios.patch(`/api/leave-requests/${leaveId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update local state to remove the approved request
        setRecentData(prev => ({
          ...prev,
          teamLeaveRequests: prev.teamLeaveRequests.filter(leave => leave.ID !== leaveId)
        }));

        // Show success message
        console.log('Leave request approved successfully');
        
        // Optional: Refresh data to get updated counts
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      const response = await axios.patch(`/api/leave-requests/${leaveId}/reject`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update local state to remove the rejected request
        setRecentData(prev => ({
          ...prev,
          teamLeaveRequests: prev.teamLeaveRequests.filter(leave => leave.ID !== leaveId)
        }));

        // Show success message
        console.log('Leave request rejected successfully');
        
        // Optional: Refresh data to get updated counts
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };  if (loading) {
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
              Team Manager - {myDepartment?.name || 'Department'} • {stats.myTeamSize || 0} team members
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button variant="secondary" size="small" className="btn-sm">
              <Users className="w-4 h-4 mr-2" />
              View Team
            </Button>
            <Button variant="outline" size="small" className="btn-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Leave Requests
            </Button>
          </div>
        </div>
      </div>

      {/* Team Statistics - Department Performance Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
          Team Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Team Size"
            value={stats.myTeamSize}
            icon={Users}
            color="secondary"
            subtitle="Direct reports"
          />
          <StatsCard
            title="Department Performance"
            value={stats.myTeamSize > 0 ? `${Math.round((stats.presentToday / stats.myTeamSize) * 100)}%` : '0%'}
            icon={Target}
            color="info"
            subtitle="Overall attendance rate"
          />
          <StatsCard
            title="Team Attendance Today"
            value={`${stats.presentToday}/${stats.myTeamSize}`}
            icon={UserCheck}
            color="success"
            subtitle="Present/Total"
          />
          <StatsCard
            title="Pending Actions"
            value={stats.pendingLeaveRequests}
            icon={AlertCircle}
            color="warning"
            subtitle="Requires approval"
          />
        </div>
      </div>

      {/* Team Management - View and Manage Direct Reports */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-secondary" />
          Team Management
        </h2>
        <CardWithHeader
          title="Direct Reports"
          action={<Button variant="secondary" size="small">Manage Team</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-4">
            {recentData.teamMembers?.length > 0 ? (
              recentData.teamMembers.map((member) => (
                <div key={member.id || member.ID} className="flex items-center justify-between p-4 rounded-lg border border-base-200 hover:bg-base-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary-focus text-white flex items-center justify-center text-sm font-bold shadow-md">
                        {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-base">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-base-content opacity-70">{member.position || member.jobTitle}</p>
                      <p className="text-xs text-base-content opacity-50">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-error'} badge-sm`}>
                      {member.status || 'active'}
                    </div>
                    <Button variant="ghost" size="small" className="btn-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No team members found</p>
                <p className="text-xs opacity-40 mt-1">Contact admin to assign team members</p>
              </div>
            )}
          </div>
        </CardWithHeader>
      </div>

      {/* Leave Approvals and Attendance Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Leave Approvals - Approve/Reject Team Member Requests */}
        <CardWithHeader
          title="Leave Approvals"
          action={<Button variant="ghost" size="small">View All Requests</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-4">
            {recentData.teamLeaveRequests.length > 0 ? (
              recentData.teamLeaveRequests.map((leave) => (
                <div key={leave.ID} className="border border-base-200 rounded-lg p-4 hover:bg-base-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </p>
                        <p className="text-sm text-base-content opacity-70">
                          {leave.leaveType} • {leave.days} days
                        </p>
                        <p className="text-sm text-base-content opacity-60">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        {leave.reason && (
                          <p className="text-xs text-base-content opacity-50 mt-1 max-w-md">
                            Reason: {leave.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="success" 
                        size="small" 
                        className="btn-sm"
                        onClick={() => handleApproveLeave(leave.ID)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="error" 
                        size="small" 
                        className="btn-sm"
                        onClick={() => handleRejectLeave(leave.ID)}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="opacity-60">No pending leave requests</p>
                <p className="text-xs opacity-40 mt-1">All team leave requests are up to date</p>
              </div>
            )}
          </div>
        </CardWithHeader>

        {/* Attendance Tracking - Monitor Team Punctuality and Patterns */}
        <CardWithHeader
          title="Attendance Tracking"
          action={<Button variant="ghost" size="small">View Report</Button>}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <div className="space-y-4">
            {/* Attendance Summary */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-base-100 rounded-lg border border-base-200">
              <div className="text-center">
                <div className="text-lg font-bold text-success">
                  {recentData.teamAttendanceStats?.presentToday || 0}
                </div>
                <div className="text-xs text-base-content opacity-60">Present</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-warning">
                  {recentData.teamAttendanceStats?.lateToday || 0}
                </div>
                <div className="text-xs text-base-content opacity-60">Late</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-error">
                  {recentData.teamAttendanceStats?.absentToday || 0}
                </div>
                <div className="text-xs text-base-content opacity-60">Absent</div>
              </div>
            </div>

            {/* Recent Attendance Records */}
            <div className="space-y-2">
              {recentData.teamAttendance && recentData.teamAttendance.length > 0 ? (
                recentData.teamAttendance.slice(0, 4).map((record) => (
                  <div key={record.ID} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        record.status?.toLowerCase() === 'present' ? 'bg-success/20' :
                        record.status?.toLowerCase() === 'absent' ? 'bg-error/20' :
                        'bg-warning/20'
                      }`}>
                        <Clock className={`w-4 h-4 ${
                          record.status?.toLowerCase() === 'present' ? 'text-success' :
                          record.status?.toLowerCase() === 'absent' ? 'text-error' :
                          'text-warning'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {record.employee?.firstName} {record.employee?.lastName}
                        </p>
                        <p className="text-xs opacity-60">
                          {record.checkIn ? `In: ${record.checkIn}` : 'Not checked in'}
                          {record.checkOut ? ` | Out: ${record.checkOut}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`badge ${getStatusColor(record.status)} badge-xs`}>
                      {record.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 mx-auto opacity-30 mb-1" />
                  <p className="text-sm opacity-60">No attendance data</p>
                </div>
              )}
            </div>

            {/* Attendance Issues Alert */}
            {recentData.attendanceIssues && recentData.attendanceIssues.length > 0 && (
              <div className="alert alert-warning py-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  {recentData.attendanceIssues.length} team members need attention
                </span>
              </div>
            )}
          </div>
        </CardWithHeader>
      </div>

      {/* Performance Monitoring - Track Team Productivity and Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-accent" />
          Performance Monitoring
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Performance Overview */}
          <CardWithHeader
            title="Team Performance Overview"
            action={<Button variant="ghost" size="small">View Details</Button>}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-base-100 rounded-lg border border-base-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {recentData.performanceMetrics?.teamProductivity || '85'}%
                  </div>
                  <div className="text-xs text-base-content opacity-60">Team Productivity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {recentData.performanceMetrics?.averageRating || '4.2'}/5
                  </div>
                  <div className="text-xs text-base-content opacity-60">Average Rating</div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium opacity-80">Recent Performance Trends</h4>
                {recentData.performanceTrends && recentData.performanceTrends.length > 0 ? (
                  recentData.performanceTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          trend.trend === 'up' ? 'bg-success/20' : 
                          trend.trend === 'down' ? 'bg-error/20' : 'bg-warning/20'
                        }`}>
                          {trend.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-success" />
                          ) : trend.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-error" />
                          ) : (
                            <Activity className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{trend.metric}</p>
                          <p className="text-xs opacity-60">{trend.description}</p>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        trend.trend === 'up' ? 'bg-success/20 text-success' :
                        trend.trend === 'down' ? 'bg-error/20 text-error' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {trend.change}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Activity className="w-8 h-8 mx-auto opacity-30 mb-1" />
                    <p className="text-sm opacity-60">No performance trends available</p>
                  </div>
                )}
              </div>
            </div>
          </CardWithHeader>

          {/* Individual Performance Tracking */}
          <CardWithHeader
            title="Individual Performance"
            action={<Button variant="ghost" size="small">View All</Button>}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="space-y-3">
              {recentData.individualPerformance && recentData.individualPerformance.length > 0 ? (
                recentData.individualPerformance.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center text-xs font-bold">
                          {member.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs opacity-60">{member.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        member.score >= 4.5 ? 'text-success' :
                        member.score >= 3.5 ? 'text-warning' : 'text-error'
                      }`}>
                        {member.score}/5
                      </div>
                      <div className="text-xs opacity-60">
                        {member.tasksCompleted} tasks
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Target className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm opacity-60">No performance data available</p>
                  <p className="text-xs opacity-40 mt-1">Performance reviews will appear here</p>
                </div>
              )}
            </div>
          </CardWithHeader>
        </div>
      </div>

      {/* Budget Oversight - Department Budget and Resource Management */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-info" />
          Budget Oversight
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Budget Summary */}
          <CardWithHeader
            title="Department Budget Summary"
            action={<Button variant="ghost" size="small">View Details</Button>}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="space-y-4">
              {/* Budget Overview */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-base-100 rounded-lg border border-base-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ${recentData.budgetData?.allocated || '50,000'}
                  </div>
                  <div className="text-xs text-base-content opacity-60">Allocated Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    ${recentData.budgetData?.spent || '32,450'}
                  </div>
                  <div className="text-xs text-base-content opacity-60">Spent</div>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Utilization</span>
                  <span className="font-medium">
                    {recentData.budgetData?.utilizationPercent || '65'}%
                  </span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={recentData.budgetData?.utilizationPercent || '65'} 
                  max="100"
                ></progress>
                <div className="text-xs opacity-60 text-center">
                  ${recentData.budgetData?.remaining || '17,550'} remaining this quarter
                </div>
              </div>

              {/* Budget Alerts */}
              {recentData.budgetAlerts && recentData.budgetAlerts.length > 0 && (
                <div className="space-y-2">
                  {recentData.budgetAlerts.map((alert, index) => (
                    <div key={index} className={`alert py-2 ${
                      alert.type === 'warning' ? 'alert-warning' : 
                      alert.type === 'error' ? 'alert-error' : 'alert-info'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardWithHeader>

          {/* Resource Allocation */}
          <CardWithHeader
            title="Resource Allocation"
            action={<Button variant="ghost" size="small">Manage</Button>}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="space-y-4">
              {/* Resource Categories */}
              {recentData.resourceAllocation && recentData.resourceAllocation.length > 0 ? (
                recentData.resourceAllocation.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-base-200 hover:bg-base-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${resource.color}`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{resource.category}</p>
                        <p className="text-xs opacity-60">{resource.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">${resource.amount}</div>
                      <div className={`text-xs ${
                        resource.status === 'on-track' ? 'text-success' :
                        resource.status === 'over-budget' ? 'text-error' : 'text-warning'
                      }`}>
                        {resource.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm opacity-60">No resource allocation data</p>
                  <p className="text-xs opacity-40 mt-1">Budget items will appear here</p>
                </div>
              )}

              {/* Quick Budget Actions */}
              <div className="pt-4 border-t border-base-200">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="small" className="btn-sm">
                    Request Budget
                  </Button>
                  <Button variant="outline" size="small" className="btn-sm">
                    View History
                  </Button>
                </div>
              </div>
            </div>
          </CardWithHeader>
        </div>
      </div>

      {/* Team Reports - Generate Department-Specific Reports */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-secondary" />
          Team Reports
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Reports */}
          <CardWithHeader
            title="Available Reports"
            action={<Button variant="ghost" size="small">View All</Button>}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="space-y-3">
              {recentData.availableReports && recentData.availableReports.length > 0 ? (
                recentData.availableReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-base-200 hover:bg-base-50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${report.iconColor}`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs opacity-60">{report.description}</p>
                        <p className="text-xs opacity-40">Last generated: {report.lastGenerated}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="small" className="btn-xs">
                        View
                      </Button>
                      <Button variant="primary" size="small" className="btn-xs">
                        Generate
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm opacity-60">No reports available</p>
                </div>
              )}
            </div>
          </CardWithHeader>

          {/* Recent Reports */}
          <CardWithHeader
            title="Recent Reports"
            action={<Button variant="ghost" size="small">View History</Button>}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="space-y-3">
              {recentData.recentReports && recentData.recentReports.length > 0 ? (
                recentData.recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs opacity-60">Generated {report.generatedDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="small" className="btn-xs">
                        Download
                      </Button>
                      <Button variant="ghost" size="small" className="btn-xs">
                        Share
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <p className="text-sm opacity-60">No recent reports</p>
                  <p className="text-xs opacity-40 mt-1">Generated reports will appear here</p>
                </div>
              )}
            </div>
          </CardWithHeader>
        </div>

        {/* Quick Report Generation */}
        <div className="mt-6">
          <CardWithHeader
            title="Quick Report Generation"
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="primary" className="h-20 flex-col">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Team Summary</span>
                <span className="text-xs opacity-70">Overall team metrics</span>
              </Button>
              <Button variant="secondary" className="h-20 flex-col">
                <Clock className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Attendance Report</span>
                <span className="text-xs opacity-70">Monthly attendance</span>
              </Button>
              <Button variant="accent" className="h-20 flex-col">
                <Activity className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Performance Report</span>
                <span className="text-xs opacity-70">Team performance</span>
              </Button>
              <Button variant="info" className="h-20 flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Leave Summary</span>
                <span className="text-xs opacity-70">Leave statistics</span>
              </Button>
            </div>
          </CardWithHeader>
        </div>
      </div>

      {/* Manager Quick Actions - Essential Tasks Only */}
      <CardWithHeader
        title="Team Management Actions"
        className="hover:shadow-lg transition-shadow duration-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" className="h-16 flex-col">
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-sm">Review Leave Requests</span>
          </Button>
          <Button variant="secondary" className="h-16 flex-col">
            <Users className="w-5 h-5 mb-1" />
            <span className="text-sm">Team Overview</span>
          </Button>
          <Button variant="accent" className="h-16 flex-col">
            <Activity className="w-5 h-5 mb-1" />
            <span className="text-sm">Performance Review</span>
          </Button>
        </div>
      </CardWithHeader>
    </div>
  );
};

export default ManagerDashboard;