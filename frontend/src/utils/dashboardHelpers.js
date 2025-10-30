/**
 * Dashboard utility functions for role-based data filtering and calculations
 */

/**
 * Filter employees by department
 * @param {Array} employees - Array of employee objects
 * @param {string} departmentId - Department ID to filter by
 * @returns {Array} Filtered employees
 */
export const filterEmployeesByDepartment = (employees, departmentId) => {
  if (!departmentId) return employees;
  return employees.filter(emp => emp.departmentId === departmentId);
};

/**
 * Filter attendance records by employee
 * @param {Array} attendance - Array of attendance records
 * @param {string} employeeId - Employee ID to filter by
 * @returns {Array} Filtered attendance records
 */
export const filterAttendanceByEmployee = (attendance, employeeId) => {
  if (!employeeId) return attendance;
  return attendance.filter(att => 
    att.employeeId === employeeId || att.employeeId === String(employeeId)
  );
};

/**
 * Filter leave requests by employee
 * @param {Array} leaves - Array of leave requests
 * @param {string} employeeId - Employee ID to filter by
 * @returns {Array} Filtered leave requests
 */
export const filterLeavesByEmployee = (leaves, employeeId) => {
  if (!employeeId) return leaves;
  return leaves.filter(leave => 
    leave.employeeId === employeeId || leave.employeeId === String(employeeId)
  );
};

/**
 * Calculate attendance statistics for a given period
 * @param {Array} attendance - Attendance records
 * @param {Date} startDate - Start date for calculation
 * @param {Date} endDate - End date for calculation
 * @returns {Object} Attendance statistics
 */
export const calculateAttendanceStats = (attendance, startDate = null, endDate = null) => {
  const now = new Date();
  const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endDate || now;

  const filteredAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= start && recordDate <= end;
  });

  const present = filteredAttendance.filter(record => 
    record.status?.toLowerCase() === 'present'
  ).length;

  const absent = filteredAttendance.filter(record => 
    record.status?.toLowerCase() === 'absent'
  ).length;

  const late = filteredAttendance.filter(record => 
    record.status?.toLowerCase() === 'late'
  ).length;

  return {
    total: filteredAttendance.length,
    present,
    absent,
    late,
    attendanceRate: filteredAttendance.length > 0 ? (present / filteredAttendance.length) * 100 : 0
  };
};

/**
 * Calculate leave balance for an employee
 * @param {Array} leaves - Employee's leave requests
 * @param {Object} entitlements - Leave entitlements {annual: 25, sick: 10, etc.}
 * @returns {Object} Leave balance information
 */
export const calculateLeaveBalance = (leaves, entitlements = {}) => {
  const defaultEntitlements = {
    annual: 25,
    sick: 10,
    personal: 5,
    maternity: 90,
    paternity: 14
  };

  const finalEntitlements = { ...defaultEntitlements, ...entitlements };
  const currentYear = new Date().getFullYear();

  const thisYearLeaves = leaves.filter(leave => {
    const leaveDate = new Date(leave.startDate || leave.createdAt);
    return leaveDate.getFullYear() === currentYear && 
           leave.status?.toLowerCase() === 'approved';
  });

  const balance = {};

  Object.keys(finalEntitlements).forEach(leaveType => {
    const usedDays = thisYearLeaves
      .filter(leave => leave.type?.toLowerCase().includes(leaveType.toLowerCase()))
      .reduce((sum, leave) => sum + (leave.days || 0), 0);

    balance[leaveType] = {
      entitled: finalEntitlements[leaveType],
      used: usedDays,
      remaining: Math.max(0, finalEntitlements[leaveType] - usedDays)
    };
  });

  return balance;
};

/**
 * Get pending leave requests count
 * @param {Array} leaves - Leave requests
 * @returns {number} Count of pending requests
 */
export const getPendingLeavesCount = (leaves) => {
  return leaves.filter(leave => leave.status?.toLowerCase() === 'pending').length;
};

/**
 * Calculate team performance metrics
 * @param {Array} teamAttendance - Team attendance records
 * @param {number} teamSize - Number of team members
 * @returns {Object} Team performance metrics
 */
export const calculateTeamPerformance = (teamAttendance, teamSize) => {
  if (teamSize === 0) return { score: 0, metrics: {} };

  const today = new Date().toISOString().split('T')[0];
  const thisWeek = getWeekDates();
  const thisMonth = getMonthDates();

  const todayPresent = teamAttendance.filter(att => 
    att.date?.startsWith(today) && att.status?.toLowerCase() === 'present'
  ).length;

  const weekAttendance = teamAttendance.filter(att => {
    const attDate = new Date(att.date);
    return attDate >= thisWeek.start && attDate <= thisWeek.end;
  });

  const monthAttendance = teamAttendance.filter(att => {
    const attDate = new Date(att.date);
    return attDate >= thisMonth.start && attDate <= thisMonth.end;
  });

  const metrics = {
    todayAttendanceRate: teamSize > 0 ? (todayPresent / teamSize) * 100 : 0,
    weeklyAttendanceRate: calculateAttendanceStats(weekAttendance).attendanceRate,
    monthlyAttendanceRate: calculateAttendanceStats(monthAttendance).attendanceRate
  };

  // Overall performance score (weighted average)
  const score = Math.round(
    (metrics.todayAttendanceRate * 0.3) +
    (metrics.weeklyAttendanceRate * 0.4) +
    (metrics.monthlyAttendanceRate * 0.3)
  );

  return { score, metrics };
};

/**
 * Get current week date range
 * @returns {Object} Start and end dates for current week
 */
export const getWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Get current month date range
 * @returns {Object} Start and end dates for current month
 */
export const getMonthDates = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Format employee data for display
 * @param {Object} employee - Employee object
 * @returns {Object} Formatted employee data
 */
export const formatEmployeeForDisplay = (employee) => ({
  id: employee.id || employee.ID,
  name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
  email: employee.email,
  position: employee.position || employee.jobTitle || 'N/A',
  department: employee.department?.name || 'N/A',
  status: employee.status || 'active',
  joinDate: employee.createdAt || employee.joinDate,
  avatar: `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()
});

/**
 * Handle API errors consistently across dashboards
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {Object} Standardized error response
 */
export const handleDashboardError = (error, context = 'dashboard') => {
  console.error(`Error in ${context}:`, error);
  
  const errorMessage = error.response?.data?.message || 
                      error.message || 
                      'An unexpected error occurred';

  return {
    success: false,
    error: errorMessage,
    data: null
  };
};

/**
 * Safe data extraction from API responses
 * @param {Object} response - API response
 * @returns {Array} Data array or empty array
 */
export const extractDataFromResponse = (response) => {
  if (!response) return [];
  return response.data || response || [];
};