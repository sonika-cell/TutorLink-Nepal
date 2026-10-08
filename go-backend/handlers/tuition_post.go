package handlers

import (
	"net/http"
	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TuitionPostHandler struct {
	DB *gorm.DB
}

func NewTuitionPostHandler(db *gorm.DB) *TuitionPostHandler {
	return &TuitionPostHandler{DB: db}
}

type CreateTuitionPostInput struct {
	Subject       string `json:"subject" binding:"required"`
	Grade         string `json:"grade" binding:"required"`
	Description   string `json:"description"`
	Location      string `json:"location"`
	PreferredMode string `json:"mode" binding:"required"`
	Budget        string `json:"budget"`
}

// CreateTuitionPost - Parent creates a new tuition post
func (h *TuitionPostHandler) CreateTuitionPost(c *gin.Context) {
	// Get the logged-in user ID from the context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	// Validate input
	var input CreateTuitionPostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Create the tuition post
	tuitionPost := models.TuitionPost{
		ParentID:      userID.(uint),
		Subject:       input.Subject,
		Grade:         input.Grade,
		Description:   input.Description,
		Location:      input.Location,
		PreferredMode: input.PreferredMode,
		Budget:        input.Budget,
		Status:        "open",
	}

	if err := h.DB.Create(&tuitionPost).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create tuition post: " + err.Error(),
		})
		return
	}

	// Mark the parent as having posted
	var user models.User
	if err := h.DB.First(&user, userID.(uint)).Error; err == nil {
		user.HasPosted = true
		h.DB.Save(&user)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Tuition post created successfully",
		"post":    tuitionPost,
	})
}

// GetTuitionPosts - Get all tuition posts
func (h *TuitionPostHandler) GetTuitionPosts(c *gin.Context) {
	var posts []models.TuitionPost

	if err := h.DB.Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tuition posts",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"count": len(posts),
	})
}

// DeleteTuitionPost - Parent deletes their own tuition post
func (h *TuitionPostHandler) DeleteTuitionPost(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Post ID is required",
		})
		return
	}

	var post models.TuitionPost
	if err := h.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tuition post not found",
		})
		return
	}

	if post.ParentID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You are not authorized to delete this post",
		})
		return
	}

	if err := h.DB.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete tuition post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tuition post deleted successfully",
	})
}
