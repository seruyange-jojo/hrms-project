export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'employee';
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
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approverComments?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}



