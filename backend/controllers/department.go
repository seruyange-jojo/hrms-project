package controllers

import (
	"hrms-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DepartmentResponse represents the department data structure expected by frontend
type DepartmentResponse struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	Description      string `json:"description"`
	HeadOfDepartment string `json:"headOfDepartment,omitempty"`
	EmployeeCount    int    `json:"employeeCount,omitempty"`
}

// Helper function to convert model to response format
func (dc *DepartmentController) transformDepartmentResponse(dept models.Department) DepartmentResponse {
	headOfDepartment := ""
	if dept.Manager != nil {
		headOfDepartment = dept.Manager.FirstName + " " + dept.Manager.LastName
	}

	employeeCount := len(dept.Employees)

	return DepartmentResponse{
		ID:               strconv.Itoa(int(dept.Model.ID)),
		Name:             dept.Name,
		Description:      dept.Description,
		HeadOfDepartment: headOfDepartment,
		EmployeeCount:    employeeCount,
	}
}

type DepartmentController struct {
	db *gorm.DB
}

func NewDepartmentController(db *gorm.DB) *DepartmentController {
	return &DepartmentController{db: db}
}

func (dc *DepartmentController) GetDepartments(c *gin.Context) {
	var departments []models.Department
	if err := dc.db.Preload("Manager").Preload("Employees").Find(&departments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch departments"})
		return
	}

	// Transform to frontend expected format
	var response []DepartmentResponse
	for _, dept := range departments {
		response = append(response, dc.transformDepartmentResponse(dept))
	}

	c.JSON(http.StatusOK, response)
}

func (dc *DepartmentController) GetDepartment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department ID"})
		return
	}

	var department models.Department
	if err := dc.db.Preload("Manager").Preload("Employees").First(&department, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Department not found"})
		return
	}

	response := dc.transformDepartmentResponse(department)
	c.JSON(http.StatusOK, response)
}

func (dc *DepartmentController) CreateDepartment(c *gin.Context) {
	var department models.Department
	if err := c.ShouldBindJSON(&department); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := dc.db.Create(&department).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create department"})
		return
	}

	c.JSON(http.StatusCreated, department)
}

func (dc *DepartmentController) UpdateDepartment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department ID"})
		return
	}

	var department models.Department
	if err := dc.db.First(&department, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Department not found"})
		return
	}

	var updateData models.Department
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := dc.db.Model(&department).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update department"})
		return
	}

	c.JSON(http.StatusOK, department)
}

func (dc *DepartmentController) DeleteDepartment(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department ID"})
		return
	}

	if err := dc.db.Delete(&models.Department{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete department"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Department deleted successfully"})
}
