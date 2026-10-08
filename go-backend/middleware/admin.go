package middleware

import (
	"net/http"

	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AdminRequired - Middleware that only allows admin users
func AdminRequired(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user_id from context (set by AuthRequired middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not authenticated",
			})
			c.Abort()
			return
		}

		// Look up user in database
		var user models.User
		if err := db.First(&user, userID.(uint)).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not found",
			})
			c.Abort()
			return
		}

		// Check if user is admin
		if user.Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access required",
			})
			c.Abort()
			return
		}

		// Store admin user in context for handlers to use
		c.Set("admin_user", user)

		c.Next()
	}
}
