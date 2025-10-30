package controllers

import (
	"hrms-backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AttendanceResponse represents the attendance data structure expected by frontend
type AttendanceResponse struct {
	ID           string `json:"id"`
	EmployeeID   string `json:"employeeId"`
	EmployeeName string `json:"employeeName"`
	Date         string `json:"date"`
	CheckIn      string `json:"checkIn"`
	CheckOut     string `json:"checkOut,omitempty"`
	Hours        int    `json:"hours,omitempty"`
	Status       string `json:"status"`
}

// Helper function to convert model to response format
func (ac *AttendanceController) transformAttendanceResponse(att models.Attendance) AttendanceResponse {
	employeeName := ""
	if att.Employee.FirstName != "" && att.Employee.LastName != "" {
		employeeName = att.Employee.FirstName + " " + att.Employee.LastName
	}

	date := ""
	if !att.Date.IsZero() {
		date = att.Date.Format("2006-01-02")
	}

	checkIn := ""
	if att.CheckIn != nil {
		checkIn = att.CheckIn.Format("15:04")
	}

	checkOut := ""
	if att.CheckOut != nil {
		checkOut = att.CheckOut.Format("15:04")
	}

	hours := int(att.WorkingHours)

	return AttendanceResponse{
		ID:           strconv.Itoa(int(att.Model.ID)),
		EmployeeID:   strconv.Itoa(int(att.EmployeeID)),
		EmployeeName: employeeName,
		Date:         date,
		CheckIn:      checkIn,
		CheckOut:     checkOut,
		Hours:        hours,
		Status:       att.Status,
	}
}

type AttendanceController struct {
	db *gorm.DB
}

func NewAttendanceController(db *gorm.DB) *AttendanceController {
	return &AttendanceController{db: db}
}

// GetAttendance - HR can see all, Managers see their department, Employees see own
func (ac *AttendanceController) GetAttendance(c *gin.Context) {
	userRole := c.GetString("userRole")
	userID, _ := c.Get("userID")

	var attendance []models.Attendance
	query := ac.db.Preload("Employee").Preload("Employee.Department")

	switch userRole {
	case "hr", "admin":
		// HR can see all attendance records
		if err := query.Find(&attendance).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance records"})
			return
		}

	case "manager":
		// Managers can only see their department's attendance
		var user models.User
		if err := ac.db.Preload("Employee").First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		if user.Employee == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Manager must be associated with an employee record"})
			return
		}

		// Find all employees in the same department
		if err := query.Joins("JOIN employees ON attendance.employee_id = employees.id").
			Where("employees.department_id = ?", user.Employee.DepartmentID).
			Find(&attendance).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch department attendance"})
			return
		}

	case "employee":
		// Employees can only see their own attendance
		var user models.User
		if err := ac.db.Preload("Employee").First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		if user.Employee == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "User must be associated with an employee record"})
			return
		}

		if err := query.Where("employee_id = ?", user.Employee.ID).Find(&attendance).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch personal attendance"})
			return
		}

	default:
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid user role"})
		return
	}

	// Transform to frontend expected format
	var response []AttendanceResponse
	for _, att := range attendance {
		response = append(response, ac.transformAttendanceResponse(att))
	}

	c.JSON(http.StatusOK, response)
}

// CreateAttendance - Employees log their own attendance, HR can create for anyone
func (ac *AttendanceController) CreateAttendance(c *gin.Context) {
	userRole := c.GetString("userRole")
	userID, _ := c.Get("userID")

	var attendance models.Attendance
	if err := c.ShouldBindJSON(&attendance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// For employees, ensure they can only log their own attendance
	if userRole == "employee" {
		var user models.User
		if err := ac.db.Preload("Employee").First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}

		if user.Employee == nil {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "User must be associated with an employee record",
			})
			return
		}

		attendance.EmployeeID = user.Employee.ID
	}

	// Calculate work hours if both check-in and check-out are provided
	if attendance.CheckIn != nil && attendance.CheckOut != nil {
		duration := attendance.CheckOut.Sub(*attendance.CheckIn)
		attendance.WorkingHours = duration.Hours()
	}

	if err := ac.db.Create(&attendance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create attendance record",
		})
		return
	}

	// Load employee data for response
	ac.db.Preload("Employee").First(&attendance, attendance.ID)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    attendance,
		"message": "Attendance logged successfully",
	})
}

// UpdateAttendance - Update attendance record (HR only)
func (ac *AttendanceController) UpdateAttendance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid attendance ID",
		})
		return
	}

	var attendance models.Attendance
	if err := ac.db.First(&attendance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Attendance record not found",
		})
		return
	}

	var updateData models.Attendance
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Calculate work hours if both times are provided
	if updateData.CheckIn != nil && updateData.CheckOut != nil {
		duration := updateData.CheckOut.Sub(*updateData.CheckIn)
		updateData.WorkingHours = duration.Hours()
	}

	if err := ac.db.Model(&attendance).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update attendance record",
		})
		return
	}

	// Load employee data for response
	ac.db.Preload("Employee").First(&attendance, attendance.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    attendance,
		"message": "Attendance updated successfully",
	})
}

// DeleteAttendance - Delete attendance record (HR only)
func (ac *AttendanceController) DeleteAttendance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid attendance ID",
		})
		return
	}

	if err := ac.db.Delete(&models.Attendance{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete attendance record",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Attendance record deleted successfully",
	})
}

// GetDepartmentAttendanceReport - For managers to get their department's attendance report
func (ac *AttendanceController) GetDepartmentAttendanceReport(c *gin.Context) {
	userID, _ := c.Get("userID")

	var user models.User
	if err := ac.db.Preload("Employee").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	if user.Employee == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Manager must be associated with an employee record",
		})
		return
	}

	// Get attendance report for the department
	var attendanceReport []struct {
		EmployeeName string     `json:"employeeName"`
		Date         time.Time  `json:"date"`
		CheckIn      *time.Time `json:"checkIn"`
		CheckOut     *time.Time `json:"checkOut"`
		WorkingHours float64    `json:"workingHours"`
		Status       string     `json:"status"`
	}

	if err := ac.db.Table("attendance").
		Select("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name, attendance.date, attendance.check_in, attendance.check_out, attendance.working_hours, attendance.status").
		Joins("JOIN employees ON attendance.employee_id = employees.id").
		Where("employees.department_id = ?", user.Employee.DepartmentID).
		Order("attendance.date DESC").
		Scan(&attendanceReport).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate department attendance report",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    attendanceReport,
		"message": "Department attendance report generated successfully",
	})
}
