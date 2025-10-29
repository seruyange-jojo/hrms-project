package controllers

import (
	"hrms-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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

	c.JSON(http.StatusOK, employees)
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

	c.JSON(http.StatusOK, employee)
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
