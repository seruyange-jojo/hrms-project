package controllers

import (
	"hrms-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// EmployeeResponse represents the employee data structure expected by frontend
type EmployeeResponse struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Email      string  `json:"email"`
	Phone      string  `json:"phone"`
	Department string  `json:"department"`
	Position   string  `json:"position"`
	JoinDate   string  `json:"joinDate"`
	Status     string  `json:"status"`
	Salary     float64 `json:"salary"`
}

// Helper function to convert model to response format
func (ec *EmployeeController) transformEmployeeResponse(emp models.Employee) EmployeeResponse {
	departmentName := ""
	if emp.Department.Name != "" {
		departmentName = emp.Department.Name
	}

	joinDate := ""
	if !emp.HireDate.IsZero() {
		joinDate = emp.HireDate.Format("2006-01-02")
	}

	return EmployeeResponse{
		ID:         strconv.Itoa(int(emp.Model.ID)),
		Name:       emp.FirstName + " " + emp.LastName,
		Email:      emp.Email,
		Phone:      emp.Phone,
		Department: departmentName,
		Position:   emp.Position,
		JoinDate:   joinDate,
		Status:     emp.Status,
		Salary:     emp.Salary,
	}
}

type EmployeeController struct {
	db *gorm.DB
}

func NewEmployeeController(db *gorm.DB) *EmployeeController {
	return &EmployeeController{db: db}
}

func (ec *EmployeeController) GetEmployees(c *gin.Context) {
	var employees []models.Employee
	if err := ec.db.Preload("Department").Preload("Manager").Preload("User").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch employees"})
		return
	}

	// Transform to frontend expected format
	var response []EmployeeResponse
	for _, emp := range employees {
		response = append(response, ec.transformEmployeeResponse(emp))
	}

	c.JSON(http.StatusOK, response)
}

func (ec *EmployeeController) GetEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	var employee models.Employee
	if err := ec.db.Preload("Department").Preload("Manager").Preload("User").First(&employee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	response := ec.transformEmployeeResponse(employee)
	c.JSON(http.StatusOK, response)
}

func (ec *EmployeeController) CreateEmployee(c *gin.Context) {
	var employee models.Employee
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ec.db.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create employee"})
		return
	}

	// Load relationships for response
	ec.db.Preload("Department").Preload("Manager").Preload("User").First(&employee, employee.Model.ID)

	c.JSON(http.StatusCreated, employee)
}

func (ec *EmployeeController) UpdateEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	var employee models.Employee
	if err := ec.db.First(&employee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	var updateData models.Employee
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ec.db.Model(&employee).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update employee"})
		return
	}

	// Load relationships for response
	ec.db.Preload("Department").Preload("Manager").Preload("User").First(&employee, employee.Model.ID)

	c.JSON(http.StatusOK, employee)
}

func (ec *EmployeeController) DeleteEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	if err := ec.db.Delete(&models.Employee{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete employee"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employee deleted successfully"})
}
