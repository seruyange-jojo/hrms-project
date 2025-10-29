import axios from 'axios';
import type { Employee, Department, Attendance, LeaveRequest, User } from '../types';

const DEMO_MODE = (import.meta as any).env.VITE_DEMO_MODE === 'true';
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Real axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
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

// Simple delay helper for demo realism
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// In-memory mock data for DEMO mode
let demoUser: User = { id: 'u_admin', email: 'admin@hrsystem.com', name: 'Admin User', role: 'admin' };
let demoEmployees: Employee[] = [
  { id: 'emp_001', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', department: 'Engineering', position: 'Software Engineer', joinDate: '2023-01-15', status: 'active', salary: 75000 },
  { id: 'emp_002', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', department: 'Marketing', position: 'Marketing Manager', joinDate: '2024-01-01', status: 'active', salary: 65000 },
];
let demoDepartments: Department[] = [
  { id: 'dept_001', name: 'Engineering', description: 'Software development and engineering', headOfDepartment: 'John Manager', employeeCount: 1 },
  { id: 'dept_002', name: 'Marketing', description: 'Marketing and growth', headOfDepartment: 'Mary Lead', employeeCount: 1 },
];
let demoAttendance: Attendance[] = [
  { id: 'att_001', employeeId: 'emp_001', employeeName: 'John Doe', date: new Date().toISOString().split('T')[0], checkIn: '09:00', checkOut: '17:00', hours: 8, status: 'present' },
];
let demoLeaves: LeaveRequest[] = [
  { id: 'leave_001', employeeId: 'emp_002', employeeName: 'Jane Smith', leaveType: 'vacation', startDate: '2025-11-01', endDate: '2025-11-05', reason: 'Family trip', status: 'pending', appliedDate: '2025-10-20' },
];

// Auth API
export const authAPI = DEMO_MODE
  ? {
      login: async (email: string, password: string) => {
        await delay(300);
        if (email === 'admin@hrsystem.com' && password === 'admin123') {
          return { success: true, data: { token: 'demo-token', user: demoUser } } as any;
        }
        const error: any = new Error('Invalid credentials');
        error.response = { data: { message: 'Invalid credentials' } };
        throw error;
      },
      logout: async () => {
        await delay(100);
        return { success: true } as any;
      },
      getCurrentUser: async () => {
        await delay(100);
        return { success: true, data: demoUser } as any;
      },
    }
  : {
      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        // Backend returns {token, user} directly, wrap it to match expected format
        return { success: true, data: response.data };
      },
      logout: async () => {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('token');
        return { success: true, message: response.data.message || 'Logged out successfully' };
      },
      getCurrentUser: async () => {
        const response = await api.get('/users/me');
        // Backend returns user directly, wrap it to match expected format
        return { success: true, data: response.data };
      },
    };

// Employees API
export const employeesAPI = DEMO_MODE
  ? {
      getAll: async (): Promise<Employee[]> => {
        await delay(200);
        return [...demoEmployees];
      },
      getById: async (id: string): Promise<Employee> => {
        await delay(150);
        const emp = demoEmployees.find((e) => e.id === id);
        if (!emp) throw new Error('Not found');
        return { ...emp };
      },
      create: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
        await delay(200);
        const newEmp: Employee = { id: `emp_${Date.now()}`, ...employee, status: employee.status || 'active' } as Employee;
        demoEmployees.push(newEmp);
        const dept = demoDepartments.find((d) => d.name === newEmp.department);
        if (dept) dept.employeeCount = (dept.employeeCount || 0) + 1;
        return newEmp;
      },
      update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
        await delay(200);
        const idx = demoEmployees.findIndex((e) => e.id === id);
        if (idx === -1) throw new Error('Not found');
        demoEmployees[idx] = { ...demoEmployees[idx], ...employee };
        return { ...demoEmployees[idx] };
      },
      delete: async (id: string): Promise<void> => {
        await delay(150);
        demoEmployees = demoEmployees.filter((e) => e.id !== id);
      },
    }
  : {
      getAll: async (): Promise<Employee[]> => {
        const response = await api.get('/employees');
        return response.data; // Backend returns array directly
      },
      getById: async (id: string): Promise<Employee> => {
        const response = await api.get(`/employees/${id}`);
        return response.data; // Backend returns employee directly
      },
      create: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
        const response = await api.post('/employees', employee);
        return response.data; // Backend returns created employee directly
      },
      update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
        const response = await api.put(`/employees/${id}`, employee);
        return response.data; // Backend returns updated employee directly
      },
      delete: async (id: string): Promise<void> => {
        await api.delete(`/employees/${id}`);
      },
    };

// Departments API
export const departmentsAPI = DEMO_MODE
  ? {
      getAll: async (): Promise<Department[]> => {
        await delay(150);
        return [...demoDepartments];
      },
      getById: async (id: string): Promise<Department> => {
        await delay(150);
        const dept = demoDepartments.find((d) => d.id === id);
        if (!dept) throw new Error('Not found');
        return { ...dept };
      },
      create: async (department: Omit<Department, 'id' | 'employeeCount'>): Promise<Department> => {
        await delay(150);
        const newDept: Department = { id: `dept_${Date.now()}`, employeeCount: 0, ...department } as Department;
        demoDepartments.push(newDept);
        return newDept;
      },
      update: async (id: string, department: Partial<Department>): Promise<Department> => {
        await delay(150);
        const idx = demoDepartments.findIndex((d) => d.id === id);
        if (idx === -1) throw new Error('Not found');
        demoDepartments[idx] = { ...demoDepartments[idx], ...department };
        return { ...demoDepartments[idx] };
      },
      delete: async (id: string): Promise<void> => {
        await delay(150);
        demoDepartments = demoDepartments.filter((d) => d.id !== id);
      },
    }
  : {
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
export const attendanceAPI = DEMO_MODE
  ? {
      getAll: async (): Promise<Attendance[]> => {
        await delay(150);
        return [...demoAttendance];
      },
      getByEmployeeId: async (employeeId: string): Promise<Attendance[]> => {
        await delay(150);
        return demoAttendance.filter((a) => a.employeeId === employeeId);
      },
      markCheckIn: async (employeeId: string): Promise<Attendance> => {
        await delay(150);
        const emp = demoEmployees.find((e) => e.id === employeeId);
        const rec: Attendance = {
          id: `att_${Date.now()}`,
          employeeId,
          employeeName: emp ? emp.name : 'Unknown',
          date: new Date().toISOString().split('T')[0],
          checkIn: new Date().toTimeString().slice(0, 5),
          status: 'present',
        };
        demoAttendance.push(rec);
        return rec;
      },
      markCheckOut: async (employeeId: string): Promise<Attendance> => {
        await delay(150);
        const today = new Date().toISOString().split('T')[0];
        const rec = demoAttendance.find((a) => a.employeeId === employeeId && a.date === today);
        if (!rec) throw new Error('Check-in not found');
        rec.checkOut = new Date().toTimeString().slice(0, 5);
        if (rec.checkIn && rec.checkOut) {
          const [hIn, mIn] = rec.checkIn.split(':').map(Number);
          const [hOut, mOut] = rec.checkOut.split(':').map(Number);
          rec.hours = (hOut + mOut / 60) - (hIn + mIn / 60);
        }
        return { ...rec };
      },
      create: async (attendance: Omit<Attendance, 'id'>): Promise<Attendance> => {
        await delay(150);
        const rec: Attendance = { id: `att_${Date.now()}`, ...attendance } as Attendance;
        demoAttendance.push(rec);
        return rec;
      },
    }
  : {
      getAll: async (): Promise<Attendance[]> => {
        const response = await api.get('/attendance');
        return response.data.data;
      },
      getByEmployeeId: async (employeeId: string): Promise<Attendance[]> => {
        const response = await api.get(`/attendance/employee/${employeeId}`);
        return response.data.data;
      },
      markCheckIn: async (employeeId: string): Promise<Attendance> => {
        const response = await api.post('/attendance/checkin', { employeeId });
        return response.data.data;
      },
      markCheckOut: async (employeeId: string): Promise<Attendance> => {
        const response = await api.post('/attendance/checkout', { employeeId });
        return response.data.data;
      },
      create: async (attendance: Omit<Attendance, 'id'>): Promise<Attendance> => {
        const response = await api.post('/attendance', attendance);
        return response.data.data;
      },
    };

// Leave Requests API
export const leaveAPI = DEMO_MODE
  ? {
      getAll: async (): Promise<LeaveRequest[]> => {
        await delay(150);
        return [...demoLeaves];
      },
      getByEmployeeId: async (employeeId: string): Promise<LeaveRequest[]> => {
        await delay(150);
        return demoLeaves.filter((l) => l.employeeId === employeeId);
      },
      create: async (leaveRequest: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>): Promise<LeaveRequest> => {
        await delay(150);
        const emp = demoEmployees.find((e) => e.id === leaveRequest.employeeId);
        const rec: LeaveRequest = {
          id: `leave_${Date.now()}`,
          status: 'pending',
          appliedDate: new Date().toISOString().split('T')[0],
          ...leaveRequest,
          employeeName: emp ? emp.name : 'Unknown',
        } as LeaveRequest;
        demoLeaves.push(rec);
        return rec;
      },
      updateStatus: async (id: string, status: LeaveRequest['status'], comments?: string): Promise<LeaveRequest> => {
        await delay(150);
        const idx = demoLeaves.findIndex((l) => l.id === id);
        if (idx === -1) throw new Error('Not found');
        demoLeaves[idx] = { ...demoLeaves[idx], status, approverComments: comments };
        return { ...demoLeaves[idx] };
      },
      delete: async (id: string): Promise<void> => {
        await delay(150);
        demoLeaves = demoLeaves.filter((l) => l.id !== id);
      },
    }
  : {
      getAll: async (): Promise<LeaveRequest[]> => {
        const response = await api.get('/leave-requests');
        return response.data.data;
      },
      getByEmployeeId: async (employeeId: string): Promise<LeaveRequest[]> => {
        const response = await api.get(`/leave-requests/employee/${employeeId}`);
        return response.data.data;
      },
      create: async (leaveRequest: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>): Promise<LeaveRequest> => {
        const response = await api.post('/leave-requests', leaveRequest);
        return response.data.data;
      },
      updateStatus: async (id: string, status: LeaveRequest['status'], comments?: string): Promise<LeaveRequest> => {
        const response = await api.put(`/leave-requests/${id}`, { status, approverComments: comments });
        return response.data.data;
      },
      delete: async (id: string): Promise<void> => {
        await api.delete(`/leave-requests/${id}`);
      },
    };

export default api;

