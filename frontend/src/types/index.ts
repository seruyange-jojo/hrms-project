export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  employeeId?: number;
  employee?: Employee;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive';
  salary?: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headOfDepartment?: string;
  employeeCount?: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'sick' | 'vacation' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  overtime: number;
  grossPay: number;
  tax: number;
  netPay: number;
  status: 'draft' | 'processed' | 'paid';
  processedAt?: string;
  paidAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}



