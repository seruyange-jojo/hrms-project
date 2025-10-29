package routes

import (
	"hrms-backend/controllers"
	"hrms-backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	// Initialize controllers
	authController := controllers.NewAuthController(db)
	userController := controllers.NewUserController(db)
	employeeController := controllers.NewEmployeeController(db)
	departmentController := controllers.NewDepartmentController(db)

	// Health check route
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "HRMS API is running"})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")

	// Public routes (no authentication required)
	auth := v1.Group("/auth")
	{
		auth.POST("/login", authController.Login)
		auth.POST("/logout", authController.Logout)
	}

	// Protected routes (authentication required)
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		users := protected.Group("/users")
		{
			users.GET("/me", userController.GetCurrentUser)
			users.PUT("/me", userController.UpdateCurrentUser)
			users.GET("/", userController.GetUsers)
			users.POST("/", userController.CreateUser)
			users.GET("/:id", userController.GetUser)
			users.PUT("/:id", userController.UpdateUser)
			users.DELETE("/:id", userController.DeleteUser)
		}

		// Employee routes
		employees := protected.Group("/employees")
		{
			employees.GET("/", employeeController.GetEmployees)
			employees.POST("/", employeeController.CreateEmployee)
			employees.GET("/:id", employeeController.GetEmployee)
			employees.PUT("/:id", employeeController.UpdateEmployee)
			employees.DELETE("/:id", employeeController.DeleteEmployee)
		}

		// Department routes
		departments := protected.Group("/departments")
		{
			departments.GET("/", departmentController.GetDepartments)
			departments.POST("/", departmentController.CreateDepartment)
			departments.GET("/:id", departmentController.GetDepartment)
			departments.PUT("/:id", departmentController.UpdateDepartment)
			departments.DELETE("/:id", departmentController.DeleteDepartment)
		}
	}
}
