package handlers

import (
	"fmt"
	"net/http"
	"time"

	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PlacementHandler struct {
	DB *gorm.DB
}

func NewPlacementHandler(db *gorm.DB) *PlacementHandler {
	return &PlacementHandler{DB: db}
}

// CreatePlacement - Parent confirms hire and creates a placement record
func (h *PlacementHandler) CreatePlacement(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var input struct {
		ApplicationID uint `json:"application_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Get the application
	var application models.Application
	if err := h.DB.First(&application, input.ApplicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Application not found",
		})
		return
	}

	// Get the tuition post to verify parent owns it
	var tuitionPost models.TuitionPost
	if err := h.DB.First(&tuitionPost, application.TuitionPostID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tuition post not found",
		})
		return
	}

	// Check if parent owns the post
	if tuitionPost.ParentID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You are not authorized to hire for this post",
		})
		return
	}

	// Check if placement already exists
	var existingPlacement models.Placement
	if err := h.DB.Where("application_id = ?", input.ApplicationID).First(&existingPlacement).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Placement already exists for this application",
		})
		return
	}

	// Calculate fee: 25% of budget

	var budget float64 = 0
	if tuitionPost.Budget != "" {
		var parsed float64
		if _, err := fmt.Sscanf(tuitionPost.Budget, "%f", &parsed); err == nil {
			budget = parsed
		}
	}

	// Minimum budget is Rs. 5000, default to 5000 if empty
	if budget < 5000 {
		budget = 5000
	}

	feeAmount := budget * 0.25

	// Create the placement
	placement := models.Placement{
		ApplicationID: input.ApplicationID,
		ParentID:      userID.(uint),
		TutorID:       application.TutorID,
		TuitionPostID: application.TuitionPostID,
		Amount:        feeAmount,
		Status:        "pending_payment",
	}

	if err := h.DB.Create(&placement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create placement: " + err.Error(),
		})
		return
	}

	// Update application status to "hired"
	application.Status = "hired"
	h.DB.Save(&application)

	// Close the tuition post
	tuitionPost.Status = "closed"
	h.DB.Save(&tuitionPost)

	// Reject all other pending applications
	h.DB.Model(&models.Application{}).
		Where("tuition_post_id = ? AND id != ? AND status = ?", application.TuitionPostID, application.ID, "pending").
		Update("status", "rejected")

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Placement created successfully",
		"placement": placement,
	})
}

// GetTutorPlacements - Get all placements for logged-in tutor
func (h *PlacementHandler) GetTutorPlacements(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var placements []models.Placement
	if err := h.DB.Where("tutor_id = ?", userID.(uint)).Find(&placements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch placements",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"placements": placements,
		"count":      len(placements),
	})
}

// GetParentPlacements - Get all placements for logged-in parent
func (h *PlacementHandler) GetParentPlacements(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var placements []models.Placement
	if err := h.DB.Where("parent_id = ?", userID.(uint)).Find(&placements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch placements",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"placements": placements,
		"count":      len(placements),
	})
}

// MarkAsPaid - Tutor clicks "I've Paid"
func (h *PlacementHandler) MarkAsPaid(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	placementID := c.Param("id")

	var placement models.Placement
	if err := h.DB.First(&placement, placementID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Placement not found",
		})
		return
	}

	// Check if tutor owns this placement
	if placement.TutorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You are not authorized to update this placement",
		})
		return
	}

	// Check current status
	if placement.Status != "pending_payment" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Placement is not in pending_payment state",
		})
		return
	}

	var input struct {
		PaymentMethod string `json:"payment_method"`
		PaymentRef    string `json:"payment_ref"`
	}

	c.ShouldBindJSON(&input)

	placement.Status = "pending_verification"
	placement.PaymentMethod = input.PaymentMethod
	placement.PaymentRef = input.PaymentRef
	placement.PaidAt = time.Now()

	if err := h.DB.Save(&placement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update placement",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Payment marked. Waiting for verification.",
		"placement": placement,
	})
}

// ConfirmPayment - Admin/Parent confirms payment was received
func (h *PlacementHandler) ConfirmPayment(c *gin.Context) {
	placementID := c.Param("id")

	var placement models.Placement
	if err := h.DB.First(&placement, placementID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Placement not found",
		})
		return
	}

	placement.Status = "paid"
	placement.ConfirmedAt = time.Now()

	if err := h.DB.Save(&placement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to confirm payment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Payment confirmed! Scheduling unlocked.",
		"placement": placement,
	})
}

// GetPlacementByID - Get a specific placement
func (h *PlacementHandler) GetPlacementByID(c *gin.Context) {
	id := c.Param("id")

	var placement models.Placement
	if err := h.DB.First(&placement, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Placement not found",
		})
		return
	}

	c.JSON(http.StatusOK, placement)
}

// GetAllPlacements - Admin: Get all placements
func (h *PlacementHandler) GetAllPlacements(c *gin.Context) {
	var placements []models.Placement
	if err := h.DB.Order("created_at DESC").Find(&placements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch placements",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"placements": placements,
		"count":      len(placements),
	})
}

// GetParentContact - Tutor gets parent contact info after payment confirmed
// GET /api/placement/:id/parent-contact
func (h *PlacementHandler) GetParentContact(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	placementID := c.Param("id")
	if placementID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Placement ID required",
		})
		return
	}

	// Load placement
	var placement models.Placement
	if err := h.DB.First(&placement, placementID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Placement not found",
		})
		return
	}

	// Check if the logged-in user is the tutor
	if placement.TutorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "This placement does not belong to you",
		})
		return
	}

	// Only reveal contact AFTER payment is confirmed
	if placement.Status != "confirmed" && placement.Status != "paid" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Payment must be completed before accessing parent contact",
		})
		return
	}

	// Load parent user
	var parent models.User
	if err := h.DB.First(&parent, placement.ParentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Parent not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name":  parent.Username,
		"email": parent.Email,
		"phone": parent.Phone,
	})
}
