package controllers

import (
	"hrms-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PayrollController struct {
	db *gorm.DB
}

func NewPayrollController(db *gorm.DB) *PayrollController {
	return &PayrollController{db: db}
}

// GetPayrollRecords - HR sees all, Employees see only their own
func (pc *PayrollController) GetPayrollRecords(c *gin.Context) {
	userRole := c.GetString("userRole")
	userID, _ := c.Get("userID")

	var payrollRecords []models.PayrollRecord
	query := pc.db.Preload("Employee").Preload("Employee.Department")

	switch userRole {
	case "hr", "admin":
		// HR can see all payroll records
		if err := query.Find(&payrollRecords).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to fetch payroll records",
			})
			return
		}

	case "manager":
		// Managers can see their department's payroll records
		var user models.User
		if err := pc.db.Preload("Employee").First(&user, userID).Error; err != nil {
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

		if err := query.Joins("JOIN employees ON payroll_records.employee_id = employees.id").
			Where("employees.department_id = ?", user.Employee.DepartmentID).
			Find(&payrollRecords).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to fetch department payroll records",
			})
			return
		}

	case "employee":
		// Employees can only see their own payroll records
		var user models.User
		if err := pc.db.Preload("Employee").First(&user, userID).Error; err != nil {
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

		if err := query.Where("employee_id = ?", user.Employee.ID).Find(&payrollRecords).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to fetch personal payroll records",
			})
			return
		}

	default:
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Invalid user role",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    payrollRecords,
	})
}

// CreatePayrollRecord - HR only
func (pc *PayrollController) CreatePayrollRecord(c *gin.Context) {
	var payrollRecord models.PayrollRecord
	if err := c.ShouldBindJSON(&payrollRecord); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Calculate gross pay and net pay
	payrollRecord.GrossPay = payrollRecord.BasicSalary + payrollRecord.Allowances + payrollRecord.Overtime
	payrollRecord.NetPay = payrollRecord.GrossPay - payrollRecord.Deductions - payrollRecord.Tax

	if err := pc.db.Create(&payrollRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create payroll record",
		})
		return
	}

	// Load employee data for response
	pc.db.Preload("Employee").Preload("Employee.Department").First(&payrollRecord, payrollRecord.ID)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    payrollRecord,
		"message": "Payroll record created successfully",
	})
}

// UpdatePayrollRecord - HR only
func (pc *PayrollController) UpdatePayrollRecord(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid payroll record ID",
		})
		return
	}

	var payrollRecord models.PayrollRecord
	if err := pc.db.First(&payrollRecord, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Payroll record not found",
		})
		return
	}

	var updateData models.PayrollRecord
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Recalculate gross pay and net pay
	if updateData.BasicSalary > 0 || updateData.Allowances > 0 || updateData.Overtime > 0 || updateData.Deductions > 0 || updateData.Tax > 0 {
		updateData.GrossPay = updateData.BasicSalary + updateData.Allowances + updateData.Overtime
		updateData.NetPay = updateData.GrossPay - updateData.Deductions - updateData.Tax
	}

	if err := pc.db.Model(&payrollRecord).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update payroll record",
		})
		return
	}

	// Load updated data for response
	pc.db.Preload("Employee").Preload("Employee.Department").First(&payrollRecord, payrollRecord.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    payrollRecord,
		"message": "Payroll record updated successfully",
	})
}

// DeletePayrollRecord - HR only
func (pc *PayrollController) DeletePayrollRecord(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid payroll record ID",
		})
		return
	}

	if err := pc.db.Delete(&models.PayrollRecord{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete payroll record",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payroll record deleted successfully",
	})
}

// DownloadPayrollReport - HR can download all payroll reports
func (pc *PayrollController) DownloadPayrollReport(c *gin.Context) {
	// Get query parameters for filtering
	month := c.DefaultQuery("month", "")
	year := c.DefaultQuery("year", "")
	departmentID := c.DefaultQuery("department_id", "")

	var payrollRecords []models.PayrollRecord
	query := pc.db.Preload("Employee").Preload("Employee.Department")

	// Apply filters
	if month != "" && year != "" {
		query = query.Where("EXTRACT(MONTH FROM pay_period_start) = ? AND EXTRACT(YEAR FROM pay_period_start) = ?", month, year)
	}

	if departmentID != "" {
		query = query.Joins("JOIN employees ON payroll_records.employee_id = employees.id").
			Where("employees.department_id = ?", departmentID)
	}

	if err := query.Find(&payrollRecords).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch payroll records for report",
		})
		return
	}

	// In a real implementation, you would generate CSV/PDF here
	// For now, return JSON data that can be used to generate reports
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    payrollRecords,
		"message": "Payroll report data retrieved successfully",
		"note":    "In production, this would return a downloadable file",
	})
}
