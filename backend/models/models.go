package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents system users with authentication
type User struct {
	gorm.Model
	Email      string    `json:"email" gorm:"uniqueIndex;not null"`
	Password   string    `json:"-" gorm:"not null"`
	FirstName  string    `json:"firstName" gorm:"not null"`
	LastName   string    `json:"lastName" gorm:"not null"`
	Role       string    `json:"role" gorm:"not null;default:'employee'"` // admin, manager, employee
	IsActive   bool      `json:"isActive" gorm:"default:true"`
	EmployeeID *uint     `json:"employeeId,omitempty"`
	Employee   *Employee `json:"employee,omitempty" gorm:"foreignKey:EmployeeID"`
}

// Department represents company departments
type Department struct {
	gorm.Model
	Name        string     `json:"name" gorm:"not null;uniqueIndex"`
	Description string     `json:"description"`
	ManagerID   *uint      `json:"managerId,omitempty"`
	Manager     *Employee  `json:"manager,omitempty" gorm:"foreignKey:ManagerID"`
	Employees   []Employee `json:"employees,omitempty" gorm:"foreignKey:DepartmentID"`
}

// Employee represents employee records
type Employee struct {
	gorm.Model
	EmployeeCode      string          `json:"employeeCode" gorm:"uniqueIndex;not null"`
	FirstName         string          `json:"firstName" gorm:"not null"`
	LastName          string          `json:"lastName" gorm:"not null"`
	Email             string          `json:"email" gorm:"uniqueIndex;not null"`
	Phone             string          `json:"phone"`
	Address           string          `json:"address"`
	DateOfBirth       *time.Time      `json:"dateOfBirth"`
	HireDate          time.Time       `json:"hireDate" gorm:"not null"`
	Salary            float64         `json:"salary" gorm:"not null"`
	Position          string          `json:"position" gorm:"not null"`
	Status            string          `json:"status" gorm:"not null;default:'active'"` // active, inactive, terminated
	DepartmentID      uint            `json:"departmentId" gorm:"not null"`
	Department        Department      `json:"department" gorm:"foreignKey:DepartmentID"`
	ManagerID         *uint           `json:"managerId,omitempty"`
	Manager           *Employee       `json:"manager,omitempty" gorm:"foreignKey:ManagerID"`
	User              *User           `json:"user,omitempty" gorm:"foreignKey:EmployeeID"`
	LeaveRequests     []LeaveRequest  `json:"leaveRequests,omitempty" gorm:"foreignKey:EmployeeID"`
	AttendanceRecords []Attendance    `json:"attendanceRecords,omitempty" gorm:"foreignKey:EmployeeID"`
	PayrollRecords    []PayrollRecord `json:"payrollRecords,omitempty" gorm:"foreignKey:EmployeeID"`
}

// LeaveRequest represents employee leave requests
type LeaveRequest struct {
	gorm.Model
	EmployeeID uint       `json:"employeeId" gorm:"not null"`
	Employee   Employee   `json:"employee" gorm:"foreignKey:EmployeeID"`
	LeaveType  string     `json:"leaveType" gorm:"not null"` // annual, sick, emergency, etc.
	StartDate  time.Time  `json:"startDate" gorm:"not null"`
	EndDate    time.Time  `json:"endDate" gorm:"not null"`
	Days       int        `json:"days" gorm:"not null"`
	Reason     string     `json:"reason"`
	Status     string     `json:"status" gorm:"not null;default:'pending'"` // pending, approved, rejected
	ApprovedBy *uint      `json:"approvedBy,omitempty"`
	Approver   *Employee  `json:"approver,omitempty" gorm:"foreignKey:ApprovedBy"`
	ApprovedAt *time.Time `json:"approvedAt,omitempty"`
	Comments   string     `json:"comments"`
}

// Attendance represents daily attendance records
type Attendance struct {
	gorm.Model
	EmployeeID   uint       `json:"employeeId" gorm:"not null"`
	Employee     Employee   `json:"employee" gorm:"foreignKey:EmployeeID"`
	Date         time.Time  `json:"date" gorm:"not null"`
	CheckIn      *time.Time `json:"checkIn"`
	CheckOut     *time.Time `json:"checkOut"`
	Status       string     `json:"status" gorm:"not null;default:'present'"` // present, absent, late, half-day
	WorkingHours float64    `json:"workingHours" gorm:"default:0"`
	Comments     string     `json:"comments"`
}

// PayrollRecord represents monthly payroll records
type PayrollRecord struct {
	gorm.Model
	EmployeeID     uint       `json:"employeeId" gorm:"not null"`
	Employee       Employee   `json:"employee" gorm:"foreignKey:EmployeeID"`
	PayPeriodStart time.Time  `json:"payPeriodStart" gorm:"not null"`
	PayPeriodEnd   time.Time  `json:"payPeriodEnd" gorm:"not null"`
	BasicSalary    float64    `json:"basicSalary" gorm:"not null"`
	Allowances     float64    `json:"allowances" gorm:"default:0"`
	Deductions     float64    `json:"deductions" gorm:"default:0"`
	Overtime       float64    `json:"overtime" gorm:"default:0"`
	GrossPay       float64    `json:"grossPay" gorm:"not null"`
	Tax            float64    `json:"tax" gorm:"default:0"`
	NetPay         float64    `json:"netPay" gorm:"not null"`
	Status         string     `json:"status" gorm:"not null;default:'draft'"` // draft, processed, paid
	ProcessedAt    *time.Time `json:"processedAt,omitempty"`
	PaidAt         *time.Time `json:"paidAt,omitempty"`
}
