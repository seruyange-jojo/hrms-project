package controllers

import (
	"hrms-backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LeaveResponse represents the leave request data structure expected by frontend
type LeaveResponse struct {
	ID           string `json:"id"`
	EmployeeID   string `json:"employeeId"`
	EmployeeName string `json:"employeeName"`
	LeaveType    string `json:"leaveType"`
	StartDate    string `json:"startDate"`
	EndDate      string `json:"endDate"`
	Days         int    `json:"days"`
	Reason       string `json:"reason"`
	Status       string `json:"status"`
	AppliedDate  string `json:"appliedDate"`
	ApprovedBy   string `json:"approvedBy,omitempty"`
	ApprovedAt   string `json:"approvedAt,omitempty"`
	Comments     string `json:"comments,omitempty"`
}

// Helper function to convert model to response format
func (lc *LeaveController) transformLeaveResponse(leave models.LeaveRequest) LeaveResponse {
	employeeName := ""
	if leave.Employee.FirstName != "" && leave.Employee.LastName != "" {
		employeeName = leave.Employee.FirstName + " " + leave.Employee.LastName
	}

	startDate := ""
	if !leave.StartDate.IsZero() {
		startDate = leave.StartDate.Format("2006-01-02")
	}

	endDate := ""
	if !leave.EndDate.IsZero() {
		endDate = leave.EndDate.Format("2006-01-02")
	}

	appliedDate := ""
	if !leave.CreatedAt.IsZero() {
		appliedDate = leave.CreatedAt.Format("2006-01-02")
	}

	approvedBy := ""
	if leave.Approver != nil {
		approvedBy = leave.Approver.FirstName + " " + leave.Approver.LastName
	}

	approvedAt := ""
	if leave.ApprovedAt != nil {
		approvedAt = leave.ApprovedAt.Format("2006-01-02")
	}

	return LeaveResponse{
		ID:           strconv.Itoa(int(leave.Model.ID)),
		EmployeeID:   strconv.Itoa(int(leave.EmployeeID)),
		EmployeeName: employeeName,
		LeaveType:    leave.LeaveType,
		StartDate:    startDate,
		EndDate:      endDate,
		Days:         leave.Days,
		Reason:       leave.Reason,
		Status:       leave.Status,
		AppliedDate:  appliedDate,
		ApprovedBy:   approvedBy,
		ApprovedAt:   approvedAt,
		Comments:     leave.Comments,
	}
}

type LeaveController struct {
	db *gorm.DB
}

func NewLeaveController(db *gorm.DB) *LeaveController {
	return &LeaveController{db: db}
}

// GetLeaveRequests - HR sees all, Managers see department requests, Employees see own
func (lc *LeaveController) GetLeaveRequests(c *gin.Context) {
	userRole := c.GetString("userRole")
	userID, _ := c.Get("userID")

	var leaveRequests []models.LeaveRequest
	query := lc.db.Preload("Employee").Preload("Employee.Department").Preload("Approver")

	switch userRole {
	case "hr", "admin":
		// HR can see all leave requests
		if err := query.Find(&leaveRequests).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leave requests"})
			return
		}

	case "manager":
		// Managers can see leave requests from their department
		var user models.User
		if err := lc.db.Preload("Employee").First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		if user.Employee == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Manager must be associated with an employee record"})
			return
		}

		// Get leave requests from the same department
		if err := query.Joins("JOIN employees ON leave_requests.employee_id = employees.id").
			Where("employees.department_id = ?", user.Employee.DepartmentID).
			Find(&leaveRequests).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch department leave requests"})
			return
		}

	case "employee":
		// Employees can only see their own leave requests
		var user models.User
		if err := lc.db.Preload("Employee").First(&user, userID).Error; err != nil {
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

		if err := query.Where("employee_id = ?", user.Employee.ID).Find(&leaveRequests).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to fetch personal leave requests",
			})
			return
		}

	default:
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid user role"})
		return
	}

	// Transform to frontend expected format
	var response []LeaveResponse
	for _, leave := range leaveRequests {
		response = append(response, lc.transformLeaveResponse(leave))
	}

	c.JSON(http.StatusOK, response)
}

// CreateLeaveRequest - Employees create leave requests, HR can create for anyone
func (lc *LeaveController) CreateLeaveRequest(c *gin.Context) {
	userRole := c.GetString("userRole")
	userID, _ := c.Get("userID")

	var leaveRequest models.LeaveRequest
	if err := c.ShouldBindJSON(&leaveRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// For employees, ensure they can only create requests for themselves
	if userRole == "employee" {
		var user models.User
		if err := lc.db.Preload("Employee").First(&user, userID).Error; err != nil {
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

		leaveRequest.EmployeeID = user.Employee.ID
	}

	// Calculate number of days
	duration := leaveRequest.EndDate.Sub(leaveRequest.StartDate)
	leaveRequest.Days = int(duration.Hours()/24) + 1 // +1 to include both start and end days

	// Set initial status
	if leaveRequest.Status == "" {
		leaveRequest.Status = "pending"
	}

	if err := lc.db.Create(&leaveRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create leave request",
		})
		return
	}

	// Load employee data for response
	lc.db.Preload("Employee").Preload("Employee.Department").First(&leaveRequest, leaveRequest.ID)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    leaveRequest,
		"message": "Leave request submitted successfully",
	})
}

// UpdateLeaveRequest - Update leave request (own requests for employees, any for HR)
func (lc *LeaveController) UpdateLeaveRequest(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid leave request ID",
		})
		return
	}

	userRole := c.GetString("userRole")
	userID, _ := c.Get("userID")

	var leaveRequest models.LeaveRequest
	if err := lc.db.Preload("Employee").First(&leaveRequest, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Leave request not found",
		})
		return
	}

	// Check permissions: employees can only update their own pending requests
	if userRole == "employee" {
		var user models.User
		if err := lc.db.Preload("Employee").First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}

		if user.Employee == nil || user.Employee.ID != leaveRequest.EmployeeID {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You can only update your own leave requests",
			})
			return
		}

		if leaveRequest.Status != "pending" {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You can only update pending leave requests",
			})
			return
		}
	}

	var updateData models.LeaveRequest
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Recalculate days if dates are updated
	if !updateData.StartDate.IsZero() && !updateData.EndDate.IsZero() {
		duration := updateData.EndDate.Sub(updateData.StartDate)
		updateData.Days = int(duration.Hours()/24) + 1
	}

	if err := lc.db.Model(&leaveRequest).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update leave request",
		})
		return
	}

	// Load updated data for response
	lc.db.Preload("Employee").Preload("Employee.Department").Preload("Approver").First(&leaveRequest, leaveRequest.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    leaveRequest,
		"message": "Leave request updated successfully",
	})
}

// ApproveLeaveRequest - HR approves/rejects leave requests
func (lc *LeaveController) ApproveLeaveRequest(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid leave request ID",
		})
		return
	}

	userID, _ := c.Get("userID")

	var leaveRequest models.LeaveRequest
	if err := lc.db.First(&leaveRequest, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Leave request not found",
		})
		return
	}

	var approvalData struct {
		Status   string `json:"status" binding:"required,oneof=approved rejected"`
		Comments string `json:"comments"`
	}

	if err := c.ShouldBindJSON(&approvalData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Get approver employee ID
	var user models.User
	if err := lc.db.Preload("Employee").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Approver not found",
		})
		return
	}

	if user.Employee == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Approver must be associated with an employee record",
		})
		return
	}

	// Update leave request
	now := time.Now()
	leaveRequest.Status = approvalData.Status
	leaveRequest.Comments = approvalData.Comments
	leaveRequest.ApprovedBy = &user.Employee.ID
	leaveRequest.ApprovedAt = &now

	if err := lc.db.Save(&leaveRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update leave request status",
		})
		return
	}

	// Load updated data for response
	lc.db.Preload("Employee").Preload("Employee.Department").Preload("Approver").First(&leaveRequest, leaveRequest.ID)

	action := "approved"
	if approvalData.Status == "rejected" {
		action = "rejected"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    leaveRequest,
		"message": "Leave request " + action + " successfully",
	})
}

// DeleteLeaveRequest - Delete leave request (own pending requests for employees, any for HR)
func (lc *LeaveController) DeleteLeaveRequest(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid leave request ID",
		})
		return
	}

	userRole := c.GetString("userRole")
	userID, _ := c.Get("userID")

	var leaveRequest models.LeaveRequest
	if err := lc.db.Preload("Employee").First(&leaveRequest, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Leave request not found",
		})
		return
	}

	// Check permissions: employees can only delete their own pending requests
	if userRole == "employee" {
		var user models.User
		if err := lc.db.Preload("Employee").First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}

		if user.Employee == nil || user.Employee.ID != leaveRequest.EmployeeID {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You can only delete your own leave requests",
			})
			return
		}

		if leaveRequest.Status != "pending" {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You can only delete pending leave requests",
			})
			return
		}
	}

	if err := lc.db.Delete(&leaveRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete leave request",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave request deleted successfully",
	})
}
