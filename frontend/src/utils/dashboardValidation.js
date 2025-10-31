/**
 * Data Validation Utilities for Role-Based Dashboards
 * These functions help verify that role-based data filtering is working correctly
 */

/**
 * Validate that Admin dashboard has appropriate data access
 * @param {Object} data - Dashboard data object
 * @param {Object} user - Current user object
 * @returns {Object} Validation result
 */
export const validateAdminDashboardData = (data, user) => {
  const issues = [];
  const warnings = [];

  // Admin should have access to all company data
  if (!data.stats || typeof data.stats.totalEmployees !== 'number') {
    issues.push('Admin should have access to total employee count');
  }

  if (!data.stats || typeof data.stats.totalDepartments !== 'number') {
    issues.push('Admin should have access to total department count');
  }

  if (!Array.isArray(data.recentEmployees)) {
    issues.push('Admin should have access to recent employees list');
  }

  if (!Array.isArray(data.recentAttendance)) {
    issues.push('Admin should have access to recent attendance records');
  }

  if (!Array.isArray(data.recentLeaves)) {
    issues.push('Admin should have access to recent leave requests');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    role: 'admin'
  };
};

/**
 * Validate that Manager dashboard shows only team-specific data
 * @param {Object} data - Dashboard data object
 * @param {Object} user - Current user object
 * @param {Array} allEmployees - All employees for validation
 * @returns {Object} Validation result
 */
export const validateManagerDashboardData = (data, user, allEmployees = []) => {
  const issues = [];
  const warnings = [];

  // Manager should only see team/department data
  if (data.stats && data.stats.myTeamSize === 0) {
    warnings.push('Manager has no team members assigned. Check department assignment.');
  }

  // Check if recent data contains only team members
  if (Array.isArray(data.recentData?.teamAttendance)) {
    const hasNonTeamData = data.recentData.teamAttendance.some(record => {
      // This would need actual team member validation
      return false; // Placeholder - implement actual validation
    });
    
    if (hasNonTeamData) {
      issues.push('Manager dashboard contains non-team attendance data');
    }
  }

  if (Array.isArray(data.recentData?.teamLeaveRequests)) {
    if (data.recentData.teamLeaveRequests.length > data.stats?.myTeamSize) {
      warnings.push('More leave requests than team members - may indicate data filtering issue');
    }
  }

  // Manager should not have access to company-wide payroll
  if (data.stats && data.stats.companyWidePayroll !== undefined) {
    issues.push('Manager should not have access to company-wide payroll data');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    role: 'manager'
  };
};

/**
 * Validate that Employee dashboard shows only personal data
 * @param {Object} data - Dashboard data object
 * @param {Object} user - Current user object
 * @returns {Object} Validation result
 */
export const validateEmployeeDashboardData = (data, user) => {
  const issues = [];
  const warnings = [];

  // Employee should only see personal data
  if (Array.isArray(data.recentData?.myAttendance)) {
    // All attendance records should belong to this employee
    const hasOtherEmployeeData = data.recentData.myAttendance.some(record => {
      return record.employee && record.employee.email !== user.email;
    });
    
    if (hasOtherEmployeeData) {
      issues.push('Employee dashboard contains attendance data from other employees');
    }
  }

  if (Array.isArray(data.recentData?.myLeaveRequests)) {
    // All leave requests should belong to this employee
    const hasOtherEmployeeLeaves = data.recentData.myLeaveRequests.some(leave => {
      return leave.employee && leave.employee.email !== user.email;
    });
    
    if (hasOtherEmployeeLeaves) {
      issues.push('Employee dashboard contains leave requests from other employees');
    }
  }

  // Employee should not have access to team/company stats
  if (data.stats && data.stats.totalEmployees !== undefined) {
    issues.push('Employee should not have access to total employee count');
  }

  if (data.stats && data.stats.companyWideAttendance !== undefined) {
    issues.push('Employee should not have access to company-wide attendance data');
  }

  if (data.stats && data.stats.teamSize !== undefined) {
    issues.push('Employee should not have access to team size information');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    role: 'employee'
  };
};

/**
 * Run comprehensive validation for any role-based dashboard
 * @param {string} role - User role (admin, manager, employee)
 * @param {Object} data - Dashboard data
 * @param {Object} user - Current user
 * @param {Array} allEmployees - All employees (optional, for manager validation)
 * @returns {Object} Comprehensive validation result
 */
export const validateDashboardData = (role, data, user, allEmployees = []) => {
  let validation;

  switch (role?.toLowerCase()) {
    case 'admin':
      validation = validateAdminDashboardData(data, user);
      break;
    case 'manager':
      validation = validateManagerDashboardData(data, user, allEmployees);
      break;
    case 'employee':
      validation = validateEmployeeDashboardData(data, user);
      break;
    default:
      return {
        isValid: false,
        issues: [`Unknown role: ${role}`],
        warnings: [],
        role: role || 'unknown'
      };
  }

  // Add general validation checks
  const generalIssues = [];
  
  if (!user || !user.email) {
    generalIssues.push('User information is missing or incomplete');
  }

  if (!data) {
    generalIssues.push('Dashboard data is missing');
  }

  return {
    ...validation,
    issues: [...validation.issues, ...generalIssues],
    timestamp: new Date().toISOString(),
    userId: user?.id || user?.email || 'unknown'
  };
};

/**
 * Log validation results to console with proper formatting
 * @param {Object} validation - Validation result object
 */
export const logValidationResults = (validation) => {
  const { isValid, issues, warnings, role, timestamp, userId } = validation;

  console.group(`🔍 Dashboard Validation - ${role?.toUpperCase()} (${userId})`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Valid: ${isValid ? '✅' : '❌'}`);

  if (issues.length > 0) {
    console.group('❌ Issues Found:');
    issues.forEach((issue, index) => {
      console.error(`${index + 1}. ${issue}`);
    });
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group('⚠️ Warnings:');
    warnings.forEach((warning, index) => {
      console.warn(`${index + 1}. ${warning}`);
    });
    console.groupEnd();
  }

  if (isValid && issues.length === 0) {
    console.log('✅ All validations passed - data filtering is working correctly');
  }

  console.groupEnd();
};

/**
 * Create a dashboard data summary for debugging
 * @param {Object} data - Dashboard data
 * @param {string} role - User role
 * @returns {Object} Data summary
 */
export const createDataSummary = (data, role) => {
  const summary = {
    role,
    timestamp: new Date().toISOString(),
    dataTypes: {}
  };

  // Count different types of data
  if (data.stats) {
    summary.dataTypes.stats = Object.keys(data.stats).length;
  }

  if (data.recentData) {
    Object.keys(data.recentData).forEach(key => {
      const value = data.recentData[key];
      if (Array.isArray(value)) {
        summary.dataTypes[key] = value.length;
      }
    });
  }

  // Add role-specific metrics
  switch (role?.toLowerCase()) {
    case 'admin':
      summary.scope = 'company-wide';
      summary.expectedData = ['totalEmployees', 'totalDepartments', 'allAttendance', 'allLeaves'];
      break;
    case 'manager':
      summary.scope = 'department/team';
      summary.expectedData = ['myTeamSize', 'teamAttendance', 'teamLeaves'];
      break;
    case 'employee':
      summary.scope = 'personal';
      summary.expectedData = ['myAttendance', 'myLeaves', 'personalStats'];
      break;
  }

  return summary;
};

// Export validation functions for use in dashboard components
export default {
  validateAdminDashboardData,
  validateManagerDashboardData,
  validateEmployeeDashboardData,
  validateDashboardData,
  logValidationResults,
  createDataSummary
};