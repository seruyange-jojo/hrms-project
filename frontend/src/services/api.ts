import axios from 'axios';
import type { Employee, Department, Attendance, LeaveRequest } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Axios instance configured for backend API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.warn('Access denied:', error.response.data);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network error - backend may be unavailable');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // Store token and user data in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return { success: true, data: response.data };
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true, message: response.data.message || 'Logged out successfully' };
    } catch (error) {
      // Even if logout fails on backend, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true, message: 'Logged out locally' };
    }
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return { success: true, data: response.data };
  },
};

// Employees API
export const employeesAPI = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees');
    return response.data; // Backend returns array directly
  },
  getById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data; // Backend returns employee directly
  },
  create: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    // Transform frontend data to backend format
    const backendData = {
      firstName: employee.name.split(' ')[0] || employee.name,
      lastName: employee.name.split(' ').slice(1).join(' ') || '',
      email: employee.email,
      phone: employee.phone,
      departmentId: parseInt(employee.department) || 1, // Will need department mapping
      position: employee.position,
      joinDate: employee.joinDate,
      status: employee.status || 'active',
      salary: employee.salary,
    };
    const response = await api.post('/employees', backendData);
    return response.data; // Backend returns created employee directly
  },
  update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    // Transform frontend data to backend format
    const backendData: any = {};
    if (employee.name) {
      backendData.firstName = employee.name.split(' ')[0] || employee.name;
      backendData.lastName = employee.name.split(' ').slice(1).join(' ') || '';
    }
    if (employee.email) backendData.email = employee.email;
    if (employee.phone) backendData.phone = employee.phone;
    if (employee.department) backendData.departmentId = parseInt(employee.department) || 1;
    if (employee.position) backendData.position = employee.position;
    if (employee.joinDate) backendData.joinDate = employee.joinDate;
    if (employee.status) backendData.status = employee.status;
    if (employee.salary) backendData.salary = employee.salary;
    
    const response = await api.put(`/employees/${id}`, backendData);
    return response.data; // Backend returns updated employee directly
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};

// Departments API
export const departmentsAPI = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data; // Backend returns array directly
  },
  getById: async (id: string): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data; // Backend returns department directly
  },
  create: async (department: Omit<Department, 'id' | 'employeeCount'>): Promise<Department> => {
    const response = await api.post('/departments', department);
    return response.data; // Backend returns created department directly
  },
  update: async (id: string, department: Partial<Department>): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, department);
    return response.data; // Backend returns updated department directly
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (): Promise<Attendance[]> => {
    const response = await api.get('/attendance');
    return response.data; // Backend returns array directly
  },
  getByEmployeeId: async (employeeId: string): Promise<Attendance[]> => {
    // Filter on backend side or use getAll and filter on frontend
    const response = await api.get('/attendance');
    return response.data.filter((a: Attendance) => a.employeeId === employeeId);
  },
  markCheckIn: async (employeeId: string): Promise<Attendance> => {
    const checkInData = {
      employeeId: parseInt(employeeId), // Backend expects number
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toTimeString().slice(0, 5),
      status: 'present'
    };
    const response = await api.post('/attendance', checkInData);
    return response.data; // Backend returns created attendance directly
  },
  markCheckOut: async (employeeId: string): Promise<Attendance> => {
    const today = new Date().toISOString().split('T')[0];
    const allAttendance = await api.get('/attendance');
    const todayRecord = allAttendance.data.find((a: Attendance) => 
      a.employeeId === employeeId && a.date === today
    );
    
    if (!todayRecord) {
      throw new Error('Check-in not found for today');
    }
    
    const updateData = { 
      checkOut: new Date().toTimeString().slice(0, 5)
    };
    const response = await api.put(`/attendance/${todayRecord.id}`, updateData);
    return response.data;
  },
  create: async (attendance: Omit<Attendance, 'id'>): Promise<Attendance> => {
    // Transform frontend data to backend format
    const backendData = {
      employeeId: parseInt(attendance.employeeId), // Backend expects number
      date: attendance.date,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      hours: attendance.hours,
      status: attendance.status,
    };
    const response = await api.post('/attendance', backendData);
    return response.data; // Backend returns created attendance directly
  },
};

// Leave Requests API
export const leaveAPI = {
  getAll: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/leaves');
    return response.data; // Backend returns array directly
  },
  getByEmployeeId: async (employeeId: string): Promise<LeaveRequest[]> => {
    // Filter on frontend for now
    const response = await api.get('/leaves');
    return response.data.filter((l: LeaveRequest) => l.employeeId === employeeId);
  },
  create: async (leaveRequest: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>): Promise<LeaveRequest> => {
    // Transform frontend data to backend format
    const backendData = {
      employeeId: parseInt(leaveRequest.employeeId), // Backend expects number
      leaveType: leaveRequest.leaveType,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      days: leaveRequest.days,
      reason: leaveRequest.reason,
    };
    const response = await api.post('/leaves', backendData);
    return response.data; // Backend returns created leave directly
  },
  updateStatus: async (id: string, status: LeaveRequest['status'], comments?: string): Promise<LeaveRequest> => {
    const response = await api.put(`/leaves/${id}`, { status, comments });
    return response.data; // Backend returns updated leave directly
  },
  approve: async (id: string, comments?: string): Promise<LeaveRequest> => {
    const response = await api.post(`/leaves/${id}/approve`, { comments });
    return response.data; // Backend returns approved leave directly
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/leaves/${id}`);
  },
};

// Payroll API (if needed)
export const payrollAPI = {
  getAll: async () => {
    const response = await api.get('/payroll');
    return response.data;
  },
  getByEmployeeId: async (employeeId: string) => {
    const response = await api.get('/payroll');
    return response.data.filter((p: any) => p.employeeId === employeeId);
  },
};

export default api;

