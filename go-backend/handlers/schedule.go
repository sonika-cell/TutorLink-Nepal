package handlers

import (
	"net/http"
	"strconv"
	"time"

	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ScheduleHandler struct {
	DB *gorm.DB
}

func NewScheduleHandler(db *gorm.DB) *ScheduleHandler {
	return &ScheduleHandler{DB: db}
}

type CreateScheduleInput struct {
	ApplicationID uint   `json:"application_id" binding:"required"`
	ClassType     string `json:"class_type"` // "demo" or "regular"
	Date          string `json:"date" binding:"required"`
	StartTime     string `json:"start_time" binding:"required"`
	EndTime       string `json:"end_time" binding:"required"`
	Mode          string `json:"mode" binding:"required"` // "online" or "offline"
	Notes         string `json:"notes"`
}

// CreateSchedule - Tutor creates a demo schedule after payment is confirmed
func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var input CreateScheduleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// ==========================================================
	// DATE VALIDATION: must be today or within next 30 days
	// ==========================================================
	classDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid date format. Use YYYY-MM-DD",
		})
		return
	}

	// Normalize to midnight for accurate comparison
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)
	classDate = time.Date(classDate.Year(), classDate.Month(), classDate.Day(), 0, 0, 0, 0, time.Local)

	// Block past dates
	if classDate.Before(today) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cannot schedule a class in the past",
		})
		return
	}

	// Block dates more than 30 days in the future
	maxDate := today.AddDate(0, 0, 30)
	if classDate.After(maxDate) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cannot schedule a class more than 30 days in the future",
		})
		return
	}

	// ==========================================================
	// APPLICATION & PLACEMENT VALIDATION
	// ==========================================================

	// Get the application
	var application models.Application
	if err := h.DB.First(&application, input.ApplicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Application not found",
		})
		return
	}

	// Verify the user is the TUTOR (not the parent)
	if application.TutorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only the tutor can schedule the demo class",
		})
		return
	}

	// Check that a placement exists and is confirmed (paid)
	var placement models.Placement
	if err := h.DB.Where("application_id = ?", application.ID).First(&placement).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Placement not found. Payment must be completed first.",
		})
		return
	}

	// Only allow scheduling if payment is confirmed
	if placement.Status != "confirmed" && placement.Status != "paid" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Payment must be confirmed before scheduling. Current placement status: " + placement.Status,
		})
		return
	}

	// ==========================================================
	// CREATE SCHEDULE
	// ==========================================================

	// Generate meeting link for online classes
	meetingLink := ""
	if input.Mode == "online" {
		meetingLink = "https://meet.jit.si/TutorLink-Class-" + strconv.Itoa(int(application.ID))
	}

	// Create schedule
	schedule := models.Schedule{
		ApplicationID: input.ApplicationID,
		ParentID:      placement.ParentID,
		TutorID:       placement.TutorID,
		TuitionPostID: application.TuitionPostID,
		ClassType:     input.ClassType,
		Date:          input.Date,
		StartTime:     input.StartTime,
		EndTime:       input.EndTime,
		Mode:          input.Mode,
		Status:        "scheduled",
		MeetingLink:   meetingLink,
		Notes:         input.Notes,
	}

	if input.ClassType == "" {
		schedule.ClassType = "regular"
	}

	if err := h.DB.Create(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create schedule: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Demo class scheduled successfully",
		"schedule": schedule,
	})
}

// GetTutorSchedules - Get all schedules for the logged-in tutor
func (h *ScheduleHandler) GetTutorSchedules(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var schedules []models.Schedule
	if err := h.DB.Where("tutor_id = ?", userID.(uint)).Order("date ASC, start_time ASC").Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch schedules",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"schedules": schedules,
		"count":     len(schedules),
	})
}

// GetParentSchedules - Get all schedules for the logged-in parent
func (h *ScheduleHandler) GetParentSchedules(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var schedules []models.Schedule
	if err := h.DB.Where("parent_id = ?", userID.(uint)).Order("date ASC, start_time ASC").Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch schedules",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"schedules": schedules,
		"count":     len(schedules),
	})
}

// UpdateScheduleStatus - Update schedule status (completed/cancelled)
func (h *ScheduleHandler) UpdateScheduleStatus(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	scheduleID := c.Param("id")
	if scheduleID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Schedule ID is required",
		})
		return
	}

	var schedule models.Schedule
	if err := h.DB.First(&schedule, scheduleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Schedule not found",
		})
		return
	}

	// Check if user is the parent or tutor
	if schedule.ParentID != userID.(uint) && schedule.TutorID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You are not authorized to update this schedule",
		})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if input.Status != "completed" && input.Status != "cancelled" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Status must be 'completed' or 'cancelled'",
		})
		return
	}

	schedule.Status = input.Status
	if err := h.DB.Save(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update schedule",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Schedule " + input.Status + " successfully",
		"schedule": schedule,
	})
}
