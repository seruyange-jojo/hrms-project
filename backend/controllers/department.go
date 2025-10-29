package controllers

import (
	"hrms-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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

	c.JSON(http.StatusOK, departments)
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

	c.JSON(http.StatusOK, department)
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
