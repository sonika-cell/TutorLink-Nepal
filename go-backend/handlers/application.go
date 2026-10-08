package handlers

import (
	"net/http"
	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ApplicationHandler struct {
	DB *gorm.DB
}

func NewApplicationHandler(db *gorm.DB) *ApplicationHandler {
	return &ApplicationHandler{DB: db}
}

type CreateApplicationInput struct {
	TuitionPostID uint   `json:"tuition_post_id" binding:"required"`
	Message       string `json:"message"`
}

// ApplyToTuition - Tutor applies to a tuition post
func (h *ApplicationHandler) ApplyToTuition(c *gin.Context) {
	// Get the logged-in user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	// Validate input
	var input CreateApplicationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Check if the tuition post exists
	var tuitionPost models.TuitionPost
	if err := h.DB.First(&tuitionPost, input.TuitionPostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tuition post not found",
		})
		return
	}

	// Check if the tuition post is already closed (accepted by another tutor)
	if tuitionPost.Status == "closed" {
		c.JSON(http.StatusConflict, gin.H{
			"error": "This tuition post has already been filled",
		})
		return
	}

	// Check if tutor already applied to this post
	var existingApplication models.Application
	result := h.DB.Where("tutor_id = ? AND tuition_post_id = ?", userID.(uint), input.TuitionPostID).First(&existingApplication)
	if result.Error == nil {
		// Provide specific error based on the existing application status
		if existingApplication.Status == "accepted" {
			c.JSON(http.StatusConflict, gin.H{
				"error": "You have already been accepted for this tuition post",
			})
			return
		}
		if existingApplication.Status == "pending" {
			c.JSON(http.StatusConflict, gin.H{
				"error": "You have already applied to this tuition post. Please wait for the parent's response.",
			})
			return
		}
		if existingApplication.Status == "rejected" {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Your previous application for this tuition post was rejected. You cannot apply again.",
			})
			return
		}
	}

	// Check if any other tutor has already been accepted for this post
	var acceptedApplication models.Application
	resultAccepted := h.DB.Where("tuition_post_id = ? AND status = ?", input.TuitionPostID, "accepted").First(&acceptedApplication)
	if resultAccepted.Error == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "This tuition post has already been filled by another tutor",
		})
		return
	}

	// Create the application
	application := models.Application{
		TutorID:       userID.(uint),
		TuitionPostID: input.TuitionPostID,
		Status:        "pending",
		Message:       input.Message,
	}

	if err := h.DB.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to submit application: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Application submitted successfully",
		"application": application,
	})
}

// GetTutorApplications - Get all applications for the logged-in tutor
func (h *ApplicationHandler) GetTutorApplications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var applications []models.Application
	if err := h.DB.Where("tutor_id = ?", userID.(uint)).Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch applications",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": applications,
		"count":        len(applications),
	})
}

// GetParentApplications - Get all applications for tuition posts created by the logged-in parent
func (h *ApplicationHandler) GetParentApplications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	// First, get all tuition posts created by this parent
	var tuitionPosts []models.TuitionPost
	if err := h.DB.Where("parent_id = ?", userID.(uint)).Find(&tuitionPosts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tuition posts",
		})
		return
	}

	// Get all post IDs
	postIDs := make([]uint, len(tuitionPosts))
	for i, post := range tuitionPosts {
		postIDs[i] = post.ID
	}

	if len(postIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"applications": []models.Application{},
			"count":        0,
		})
		return
	}

	// Get all applications for these tuition posts
	var applications []models.Application
	if err := h.DB.Where("tuition_post_id IN ?", postIDs).Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch applications",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": applications,
		"count":        len(applications),
	})
}

// UpdateApplicationStatus - Parent accepts or rejects a tutor's application
func (h *ApplicationHandler) UpdateApplicationStatus(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	// Get application ID from URL
	applicationID := c.Param("id")
	if applicationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Application ID is required",
		})
		return
	}

	// Get the application
	var application models.Application
	if err := h.DB.First(&application, applicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Application not found",
		})
		return
	}

	// Get the tuition post to check if this parent owns it
	var tuitionPost models.TuitionPost
	if err := h.DB.First(&tuitionPost, application.TuitionPostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tuition post not found",
		})
		return
	}

	// Check if the parent owns this tuition post
	if tuitionPost.ParentID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You are not authorized to update this application",
		})
		return
	}

	// Validate input
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Validate status
	if input.Status != "accepted" && input.Status != "rejected" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Status must be 'accepted' or 'rejected'",
		})
		return
	}

	// Update the application status
	application.Status = input.Status
	if err := h.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update application status",
		})
		return
	}

	// If accepted, close the tuition post and reject all other applications
	if input.Status == "accepted" {
		// Close the tuition post
		tuitionPost.Status = "closed"
		if err := h.DB.Save(&tuitionPost).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to close tuition post",
			})
			return
		}

		// Reject all other pending applications for this post
		h.DB.Model(&models.Application{}).
			Where("tuition_post_id = ? AND id != ? AND status = ?", application.TuitionPostID, application.ID, "pending").
			Update("status", "rejected")
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Application " + input.Status + " successfully",
		"application": application,
	})
}
