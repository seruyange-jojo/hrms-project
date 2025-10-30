import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  }
};

// User API
export const userAPI = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  
  updateCurrentUser: async (userData) => {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  },
  
  getUsers: async () => {
    const response = await apiClient.get('/users/');
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};

// Employee API
export const employeeAPI = {
  getEmployees: async () => {
    const response = await apiClient.get('/employees/');
    return response.data;
  },
  
  createEmployee: async (employeeData) => {
    const response = await apiClient.post('/employees/', employeeData);
    return response.data;
  },
  
  getEmployee: async (id) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },
  
  updateEmployee: async (id, employeeData) => {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  },
  
  deleteEmployee: async (id) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  }
};

// Department API
export const departmentAPI = {
  getDepartments: async () => {
    const response = await apiClient.get('/departments/');
    return response.data;
  },
  
  createDepartment: async (departmentData) => {
    const response = await apiClient.post('/departments/', departmentData);
    return response.data;
  },
  
  getDepartment: async (id) => {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  },
  
  updateDepartment: async (id, departmentData) => {
    const response = await apiClient.put(`/departments/${id}`, departmentData);
    return response.data;
  },
  
  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  }
};

// Attendance API
export const attendanceAPI = {
  getAttendance: async () => {
    const response = await apiClient.get('/attendance/');
    return response.data;
  },
  
  createAttendance: async (attendanceData) => {
    const response = await apiClient.post('/attendance/', attendanceData);
    return response.data;
  },
  
  getAttendanceReport: async () => {
    const response = await apiClient.get('/attendance/report');
    return response.data;
  },
  
  updateAttendance: async (id, attendanceData) => {
    const response = await apiClient.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },
  
  deleteAttendance: async (id) => {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  }
};

// Leave API
export const leaveAPI = {
  getLeaveRequests: async () => {
    const response = await apiClient.get('/leaves/');
    return response.data;
  },
  
  createLeaveRequest: async (leaveData) => {
    const response = await apiClient.post('/leaves/', leaveData);
    return response.data;
  },
  
  updateLeaveRequest: async (id, leaveData) => {
    const response = await apiClient.put(`/leaves/${id}`, leaveData);
    return response.data;
  },
  
  approveLeaveRequest: async (id) => {
    const response = await apiClient.post(`/leaves/${id}/approve`);
    return response.data;
  },
  
  deleteLeaveRequest: async (id) => {
    const response = await apiClient.delete(`/leaves/${id}`);
    return response.data;
  }
};

// Payroll API
export const payrollAPI = {
  getPayrollRecords: async () => {
    const response = await apiClient.get('/payroll/');
    return response.data;
  },
  
  createPayrollRecord: async (payrollData) => {
    const response = await apiClient.post('/payroll/', payrollData);
    return response.data;
  },
  
  downloadPayrollReport: async () => {
    const response = await apiClient.get('/payroll/download', {
      responseType: 'blob'
    });
    return response.data;
  },
  
  updatePayrollRecord: async (id, payrollData) => {
    const response = await apiClient.put(`/payroll/${id}`, payrollData);
    return response.data;
  },
  
  deletePayrollRecord: async (id) => {
    const response = await apiClient.delete(`/payroll/${id}`);
    return response.data;
  }
};

// Dashboard API - Role-specific data fetching
export const dashboardAPI = {
  // Admin dashboard data
  getAdminStats: async () => {
    const response = await apiClient.get('/dashboard/admin/stats');
    return response.data;
  },
  
  getRecentEmployees: async (limit = 5) => {
    const response = await apiClient.get(`/employees/?limit=${limit}&sort=created_at&order=desc`);
    return response.data;
  },
  
  getRecentAttendance: async (limit = 5) => {
    const response = await apiClient.get(`/attendance/?limit=${limit}&sort=created_at&order=desc`);
    return response.data;
  },
  
  getRecentLeaveRequests: async (limit = 5) => {
    const response = await apiClient.get(`/leaves/?limit=${limit}&sort=created_at&order=desc`);
    return response.data;
  },
  
  // Manager dashboard data
  getManagerStats: async () => {
    const response = await apiClient.get('/dashboard/manager/stats');
    return response.data;
  },
  
  getTeamMembers: async () => {
    const response = await apiClient.get('/dashboard/manager/team');
    return response.data;
  },
  
  getPendingLeaveRequests: async () => {
    const response = await apiClient.get('/dashboard/manager/leaves/pending');
    return response.data;
  },
  
  getTeamAttendance: async () => {
    const response = await apiClient.get('/dashboard/manager/attendance');
    return response.data;
  },
  
  // Employee dashboard data
  getEmployeeStats: async () => {
    const response = await apiClient.get('/dashboard/employee/stats');
    return response.data;
  },
  
  getMyAttendance: async (limit = 10) => {
    const response = await apiClient.get(`/dashboard/employee/attendance?limit=${limit}`);
    return response.data;
  },
  
  getMyLeaveRequests: async () => {
    const response = await apiClient.get('/dashboard/employee/leaves');
    return response.data;
  },
  
  getMyPayrollInfo: async () => {
    const response = await apiClient.get('/dashboard/employee/payroll');
    return response.data;
  }
};

export default apiClient;