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
	attendanceController := controllers.NewAttendanceController(db)
	leaveController := controllers.NewLeaveController(db)
	payrollController := controllers.NewPayrollController(db)

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
		// User routes - Different access levels
		users := protected.Group("/users")
		{
			users.GET("/me", userController.GetCurrentUser)
			users.PUT("/me", userController.UpdateCurrentUser)
			users.GET("/", middleware.RequireHR(), userController.GetUsers)            // HR only
			users.POST("/", middleware.RequireHR(), userController.CreateUser)         // HR only
			users.GET("/:id", middleware.RequireSelfOrHR(), userController.GetUser)    // Self or HR
			users.PUT("/:id", middleware.RequireSelfOrHR(), userController.UpdateUser) // Self or HR
			users.DELETE("/:id", middleware.RequireHR(), userController.DeleteUser)    // HR only
		}

		// Employee routes - HR can manage all, Managers can view department, Employees can view own
		employees := protected.Group("/employees")
		{
			employees.GET("/", middleware.RequireEmployee(), employeeController.GetEmployees)   // All roles with filtered data
			employees.POST("/", middleware.RequireHR(), employeeController.CreateEmployee)      // HR only
			employees.GET("/:id", middleware.RequireEmployee(), employeeController.GetEmployee) // All roles with access control
			employees.PUT("/:id", middleware.RequireHR(), employeeController.UpdateEmployee)    // HR only
			employees.DELETE("/:id", middleware.RequireHR(), employeeController.DeleteEmployee) // HR only
		}

		// Department routes - HR can manage all, others can view
		departments := protected.Group("/departments")
		{
			departments.GET("/", middleware.RequireEmployee(), departmentController.GetDepartments)   // All can view
			departments.POST("/", middleware.RequireHR(), departmentController.CreateDepartment)      // HR only
			departments.GET("/:id", middleware.RequireEmployee(), departmentController.GetDepartment) // All can view
			departments.PUT("/:id", middleware.RequireHR(), departmentController.UpdateDepartment)    // HR only
			departments.DELETE("/:id", middleware.RequireHR(), departmentController.DeleteDepartment) // HR only
		}

		// Attendance routes - Role-based access within controller
		attendance := protected.Group("/attendance")
		{
			attendance.GET("/", middleware.RequireEmployee(), attendanceController.GetAttendance)                      // All roles with filtered data
			attendance.POST("/", middleware.RequireEmployee(), attendanceController.CreateAttendance)                  // Employees log own, HR can create any
			attendance.GET("/report", middleware.RequireManager(), attendanceController.GetDepartmentAttendanceReport) // Managers get department report
			attendance.PUT("/:id", middleware.RequireHR(), attendanceController.UpdateAttendance)                      // HR only
			attendance.DELETE("/:id", middleware.RequireHR(), attendanceController.DeleteAttendance)                   // HR only
		}

		// Leave routes - Role-based access within controller
		leaves := protected.Group("/leaves")
		{
			leaves.GET("/", middleware.RequireEmployee(), leaveController.GetLeaveRequests)          // All roles with filtered data
			leaves.POST("/", middleware.RequireEmployee(), leaveController.CreateLeaveRequest)       // Employees create own, HR can create any
			leaves.PUT("/:id", middleware.RequireEmployee(), leaveController.UpdateLeaveRequest)     // Own requests for employees, any for HR
			leaves.POST("/:id/approve", middleware.RequireHR(), leaveController.ApproveLeaveRequest) // HR only
			leaves.DELETE("/:id", middleware.RequireEmployee(), leaveController.DeleteLeaveRequest)  // Own pending requests for employees, any for HR
		}

		// Payroll routes - HR manages all, Employees see own
		payroll := protected.Group("/payroll")
		{
			payroll.GET("/", middleware.RequireEmployee(), payrollController.GetPayrollRecords)       // All roles with filtered data
			payroll.POST("/", middleware.RequireHR(), payrollController.CreatePayrollRecord)          // HR only
			payroll.GET("/download", middleware.RequireHR(), payrollController.DownloadPayrollReport) // HR only
			payroll.PUT("/:id", middleware.RequireHR(), payrollController.UpdatePayrollRecord)        // HR only
			payroll.DELETE("/:id", middleware.RequireHR(), payrollController.DeletePayrollRecord)     // HR only
		}
	}
}
