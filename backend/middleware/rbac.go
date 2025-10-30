package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole middleware that checks if user has one of the allowed roles
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "User role not found in context",
			})
			c.Abort()
			return
		}

		userRoleStr, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid user role format",
			})
			c.Abort()
			return
		}

		// Check if user role is in allowed roles
		for _, role := range allowedRoles {
			if userRoleStr == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"success":       false,
			"message":       "Insufficient permissions for this operation",
			"required_role": allowedRoles,
			"user_role":     userRoleStr,
		})
		c.Abort()
	})
}

// RequireHR middleware - only HR (admin) can access
func RequireHR() gin.HandlerFunc {
	return RequireRole("hr", "admin")
}

// RequireManager middleware - managers and above can access
func RequireManager() gin.HandlerFunc {
	return RequireRole("hr", "admin", "manager")
}

// RequireEmployee middleware - any authenticated user can access
func RequireEmployee() gin.HandlerFunc {
	return RequireRole("hr", "admin", "manager", "employee")
}

// RequireSelfOrHR middleware - user can access their own data or HR can access anyone's
func RequireSelfOrHR() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		userRole, roleExists := c.Get("userRole")
		userID, idExists := c.Get("userID")

		if !roleExists || !idExists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "User context not found",
			})
			c.Abort()
			return
		}

		userRoleStr := userRole.(string)

		// HR/Admin can access anyone's data
		if userRoleStr == "hr" || userRoleStr == "admin" {
			c.Next()
			return
		}

		// For non-HR users, check if they're accessing their own data
		requestedUserID := c.Param("id")
		if requestedUserID == "" {
			// If no ID in path, assume they're accessing their own data
			c.Next()
			return
		}

		// Convert userID to string for comparison
		currentUserIDStr := ""
		switch v := userID.(type) {
		case string:
			currentUserIDStr = v
		case float64:
			currentUserIDStr = string(rune(int(v)))
		case int:
			currentUserIDStr = string(rune(v))
		default:
			currentUserIDStr = ""
		}

		if requestedUserID != currentUserIDStr {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You can only access your own data",
			})
			c.Abort()
			return
		}

		c.Next()
	})
}
