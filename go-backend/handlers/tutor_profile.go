package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TutorProfileHandler struct {
	DB *gorm.DB
}

type CreateTutorProfileInput struct {
	FullName        string `json:"full_name"`
	Phone           string `json:"phone"`
	Qualification   string `json:"qualification"`
	Subjects        string `json:"subjects"`
	ExperienceYears int    `json:"experience_years"`
	HighestClass    string `json:"highest_class"`
	Bio             string `json:"bio"`
	Location        string `json:"location"`
	CVText          string `json:"cv_text"`
	CVPath          string `json:"cv_path"`
	CVFileName      string `json:"cv_file_name"`
}

func (h *TutorProfileHandler) CreateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID not found",
		})
		return
	}

	var input CreateTutorProfileInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data",
		})
		return
	}

	var existingProfile models.TutorProfile

	result := h.DB.Where("user_id = ?", userID.(uint)).First(&existingProfile)

	if result.Error == nil {
		// Update existing profile
		existingProfile.FullName = input.FullName
		existingProfile.Phone = input.Phone
		existingProfile.Qualification = input.Qualification
		existingProfile.Subjects = input.Subjects
		existingProfile.ExperienceYears = input.ExperienceYears
		existingProfile.HighestClass = input.HighestClass
		existingProfile.Bio = input.Bio
		existingProfile.Location = input.Location
		existingProfile.CVText = input.CVText
		existingProfile.CVPath = input.CVPath
		existingProfile.CVFileName = input.CVFileName

		if err := h.DB.Save(&existingProfile).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update tutor profile",
			})
			return
		}

		// Mark user as having a profile
		var user models.User
		if err := h.DB.First(&user, userID.(uint)).Error; err == nil {
			user.HasProfile = true
			h.DB.Save(&user)
		}

		c.JSON(http.StatusOK, existingProfile)
		return
	}

	// Create new profile
	profile := models.TutorProfile{
		UserID:          userID.(uint),
		FullName:        input.FullName,
		Phone:           input.Phone,
		Qualification:   input.Qualification,
		Subjects:        input.Subjects,
		ExperienceYears: input.ExperienceYears,
		HighestClass:    input.HighestClass,
		Bio:             input.Bio,
		Location:        input.Location,
		CVText:          input.CVText,
		CVPath:          input.CVPath,
		CVFileName:      input.CVFileName,
	}

	if err := h.DB.Create(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Mark user as having a profile
	var user models.User
	if err := h.DB.First(&user, userID.(uint)).Error; err == nil {
		user.HasProfile = true
		h.DB.Save(&user)
	}

	c.JSON(http.StatusCreated, profile)
}

// UploadCV - Tutor uploads their CV (PDF only)
func (h *TutorProfileHandler) UploadCV(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("cv")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No file uploaded",
		})
		return
	}

	// Check file type - PDF only
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are allowed",
		})
		return
	}

	// Check file size - max 2MB
	if file.Size > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File size must be less than 2MB",
		})
		return
	}

	// Create unique filename
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("user_%d_%d%s", userID.(uint), timestamp, ext)
	filePath := filepath.Join("uploads", "cv", filename)

	// Ensure directory exists
	if err := os.MkdirAll("uploads/cv", 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory",
		})
		return
	}

	// Save file
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}

	// Update tutor profile with CV path
	var profile models.TutorProfile
	if err := h.DB.Where("user_id = ?", userID.(uint)).First(&profile).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tutor profile not found. Create profile first.",
		})
		return
	}

	profile.CVPath = filePath
	profile.CVFileName = file.Filename
	if err := h.DB.Save(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update profile with CV",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "CV uploaded successfully",
		"cv_path":      filePath,
		"cv_file_name": file.Filename,
	})
}

// DownloadCV - Serve CV file for download
func (h *TutorProfileHandler) DownloadCV(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User ID required",
		})
		return
	}

	var profile models.TutorProfile
	if err := h.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tutor profile not found",
		})
		return
	}

	if profile.CVPath == "" {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "No CV uploaded",
		})
		return
	}

	// Check if file exists
	if _, err := os.Stat(profile.CVPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "CV file not found on server",
		})
		return
	}

	c.File(profile.CVPath)
}

// GetTutors - Get all tutors with their profiles
func (h *TutorProfileHandler) GetTutors(c *gin.Context) {
	var profiles []models.TutorProfile

	if err := h.DB.Find(&profiles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tutors",
		})
		return
	}

	type TutorWithUser struct {
		models.TutorProfile
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	var result []TutorWithUser
	for _, profile := range profiles {
		var user models.User
		if err := h.DB.First(&user, profile.UserID).Error; err == nil {
			result = append(result, TutorWithUser{
				TutorProfile: profile,
				Username:     user.Username,
				Email:        user.Email,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"tutors": result,
		"count":  len(result),
	})
}

// GetTutorByID - Get a specific tutor's profile by ID
func (h *TutorProfileHandler) GetTutorByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Tutor ID is required",
		})
		return
	}

	var profile models.TutorProfile
	if err := h.DB.Where("user_id = ?", id).First(&profile).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tutor not found",
		})
		return
	}

	var user models.User
	if err := h.DB.First(&user, profile.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tutor":    profile,
		"username": user.Username,
		"email":    user.Email,
	})
}
