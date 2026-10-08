package handlers

import (
	"net/http"

	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	DB *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{DB: db}
}

// GetUsers - Admin: Get all users
func (h *AdminHandler) GetUsers(c *gin.Context) {
	var users []models.User

	// Fetch all users ordered by newest first
	if err := h.DB.Order("created_at DESC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch users",
		})
		return
	}

	// Build response with safe fields only (no password hash)
	type UserResponse struct {
		ID        uint   `json:"id"`
		Username  string `json:"username"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		IsActive  bool   `json:"is_active"`
		CreatedAt string `json:"created_at"`
	}

	var result []UserResponse
	for _, u := range users {
		result = append(result, UserResponse{
			ID:        u.ID,
			Username:  u.Username,
			Email:     u.Email,
			Role:      u.Role,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt.Format("2006-01-02"),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"users": result,
		"count": len(result),
	})
}

// GetTutors - Admin: Get all tutors with their profiles
func (h *AdminHandler) GetTutors(c *gin.Context) {
	var users []models.User

	// Fetch all users with role = "tutor"
	if err := h.DB.Where("role = ?", "tutor").Order("created_at DESC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tutors",
		})
		return
	}

	// Build response with tutor + profile info
	type TutorResponse struct {
		ID              uint   `json:"id"`
		Username        string `json:"username"`
		Email           string `json:"email"`
		IsActive        bool   `json:"is_active"`
		CreatedAt       string `json:"created_at"`
		HasProfile      bool   `json:"has_profile"`
		FullName        string `json:"full_name"`
		Phone           string `json:"phone"`
		Qualification   string `json:"qualification"`
		Subjects        string `json:"subjects"`
		ExperienceYears int    `json:"experience_years"`
		HighestClass    string `json:"highest_class"`
		Location        string `json:"location"`
		HasCV           bool   `json:"has_cv"`
		CVFileName      string `json:"cv_file_name"`
	}

	var result []TutorResponse
	for _, u := range users {
		tutor := TutorResponse{
			ID:         u.ID,
			Username:   u.Username,
			Email:      u.Email,
			IsActive:   u.IsActive,
			CreatedAt:  u.CreatedAt.Format("2006-01-02"),
			HasProfile: u.HasProfile,
		}

		// Fetch profile if exists
		var profile models.TutorProfile
		if err := h.DB.Where("user_id = ?", u.ID).First(&profile).Error; err == nil {
			tutor.FullName = profile.FullName
			tutor.Phone = profile.Phone
			tutor.Qualification = profile.Qualification
			tutor.Subjects = profile.Subjects
			tutor.ExperienceYears = profile.ExperienceYears
			tutor.HighestClass = profile.HighestClass
			tutor.Location = profile.Location
			tutor.HasCV = profile.CVPath != ""
			tutor.CVFileName = profile.CVFileName
		}

		result = append(result, tutor)
	}

	c.JSON(http.StatusOK, gin.H{
		"tutors": result,
		"count":  len(result),
	})
}

// GetPosts - Admin: Get all tuition posts
func (h *AdminHandler) GetPosts(c *gin.Context) {
	var posts []models.TuitionPost

	if err := h.DB.Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tuition posts",
		})
		return
	}

	// Build response with parent info
	type PostResponse struct {
		ID            uint   `json:"id"`
		ParentID      uint   `json:"parent_id"`
		ParentName    string `json:"parent_name"`
		ParentEmail   string `json:"parent_email"`
		Subject       string `json:"subject"`
		Grade         string `json:"grade"`
		Description   string `json:"description"`
		Location      string `json:"location"`
		PreferredMode string `json:"preferred_mode"`
		Budget        string `json:"budget"`
		Status        string `json:"status"`
		CreatedAt     string `json:"created_at"`
	}

	var result []PostResponse
	for _, p := range posts {
		post := PostResponse{
			ID:            p.ID,
			ParentID:      p.ParentID,
			Subject:       p.Subject,
			Grade:         p.Grade,
			Description:   p.Description,
			Location:      p.Location,
			PreferredMode: p.PreferredMode,
			Budget:        p.Budget,
			Status:        p.Status,
			CreatedAt:     p.CreatedAt.Format("2006-01-02"),
		}

		// Get parent info
		var parent models.User
		if err := h.DB.First(&parent, p.ParentID).Error; err == nil {
			post.ParentName = parent.Username
			post.ParentEmail = parent.Email
		}

		result = append(result, post)
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": result,
		"count": len(result),
	})
}

// GetApplications - Admin: Get all applications
func (h *AdminHandler) GetApplications(c *gin.Context) {
	var applications []models.Application

	if err := h.DB.Order("created_at DESC").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch applications",
		})
		return
	}

	type AppResponse struct {
		ID            uint   `json:"id"`
		Status        string `json:"status"`
		Message       string `json:"message"`
		CreatedAt     string `json:"created_at"`
		TutorID       uint   `json:"tutor_id"`
		TutorName     string `json:"tutor_name"`
		TutorEmail    string `json:"tutor_email"`
		ParentID      uint   `json:"parent_id"`
		ParentName    string `json:"parent_name"`
		ParentEmail   string `json:"parent_email"`
		TuitionPostID uint   `json:"tuition_post_id"`
		PostSubject   string `json:"post_subject"`
		PostGrade     string `json:"post_grade"`
	}

	var result []AppResponse
	for _, app := range applications {
		item := AppResponse{
			ID:            app.ID,
			Status:        app.Status,
			Message:       app.Message,
			CreatedAt:     app.CreatedAt.Format("2006-01-02"),
			TutorID:       app.TutorID,
			TuitionPostID: app.TuitionPostID,
		}

		// Get tutor info
		var tutor models.User
		if err := h.DB.First(&tutor, app.TutorID).Error; err == nil {
			item.TutorName = tutor.Username
			item.TutorEmail = tutor.Email
		}

		// Get post info
		var post models.TuitionPost
		if err := h.DB.First(&post, app.TuitionPostID).Error; err == nil {
			item.PostSubject = post.Subject
			item.PostGrade = post.Grade
			item.ParentID = post.ParentID

			// Get parent info
			var parent models.User
			if err := h.DB.First(&parent, post.ParentID).Error; err == nil {
				item.ParentName = parent.Username
				item.ParentEmail = parent.Email
			}
		}

		result = append(result, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": result,
		"count":        len(result),
	})
}

// GetPlacements - Admin: Get all placements with full details
func (h *AdminHandler) GetPlacements(c *gin.Context) {
	var placements []models.Placement

	if err := h.DB.Order("created_at DESC").Find(&placements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch placements",
		})
		return
	}

	type PlacementResponse struct {
		ID            uint    `json:"id"`
		Status        string  `json:"status"`
		Amount        float64 `json:"amount"`
		PaymentMethod string  `json:"payment_method"`
		CreatedAt     string  `json:"created_at"`
		ParentID      uint    `json:"parent_id"`
		ParentName    string  `json:"parent_name"`
		ParentEmail   string  `json:"parent_email"`
		TutorID       uint    `json:"tutor_id"`
		TutorName     string  `json:"tutor_name"`
		TutorEmail    string  `json:"tutor_email"`
		PostSubject   string  `json:"post_subject"`
		PostGrade     string  `json:"post_grade"`
	}

	var result []PlacementResponse
	for _, p := range placements {
		item := PlacementResponse{
			ID:            p.ID,
			Status:        p.Status,
			Amount:        p.Amount,
			PaymentMethod: p.PaymentMethod,
			CreatedAt:     p.CreatedAt.Format("2006-01-02"),
			ParentID:      p.ParentID,
			TutorID:       p.TutorID,
		}

		// Get parent info
		var parent models.User
		if err := h.DB.First(&parent, p.ParentID).Error; err == nil {
			item.ParentName = parent.Username
			item.ParentEmail = parent.Email
		}

		// Get tutor info
		var tutor models.User
		if err := h.DB.First(&tutor, p.TutorID).Error; err == nil {
			item.TutorName = tutor.Username
			item.TutorEmail = tutor.Email
		}

		// Get post info
		var post models.TuitionPost
		if err := h.DB.First(&post, p.TuitionPostID).Error; err == nil {
			item.PostSubject = post.Subject
			item.PostGrade = post.Grade
		}

		result = append(result, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"placements": result,
		"count":      len(result),
	})
}

// report
// GetReports - Admin: Get all reports
func (h *AdminHandler) GetReports(c *gin.Context) {
	var reports []models.Report

	if err := h.DB.Order("created_at DESC").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch reports",
		})
		return
	}

	type ReportResponse struct {
		ID             uint   `json:"id"`
		Reason         string `json:"reason"`
		Description    string `json:"description"`
		Status         string `json:"status"`
		CreatedAt      string `json:"created_at"`
		ReporterID     uint   `json:"reporter_id"`
		ReporterName   string `json:"reporter_name"`
		ReporterEmail  string `json:"reporter_email"`
		ReportedUserID uint   `json:"reported_user_id"`
		ReportedName   string `json:"reported_name"`
		ReportedPostID uint   `json:"reported_post_id"`
		ReportedPost   string `json:"reported_post"`
	}

	var result []ReportResponse
	for _, r := range reports {
		item := ReportResponse{
			ID:             r.ID,
			Reason:         r.Reason,
			Description:    r.Description,
			Status:         r.Status,
			CreatedAt:      r.CreatedAt.Format("2006-01-02"),
			ReporterID:     r.ReporterID,
			ReportedUserID: r.ReportedUserID,
			ReportedPostID: r.ReportedPostID,
		}

		// Get reporter info
		var reporter models.User
		if err := h.DB.First(&reporter, r.ReporterID).Error; err == nil {
			item.ReporterName = reporter.Username
			item.ReporterEmail = reporter.Email
		}

		// Get reported user info (if exists)
		if r.ReportedUserID != 0 {
			var reportedUser models.User
			if err := h.DB.First(&reportedUser, r.ReportedUserID).Error; err == nil {
				item.ReportedName = reportedUser.Username
			}
		}

		// Get reported post info (if exists)
		if r.ReportedPostID != 0 {
			var reportedPost models.TuitionPost
			if err := h.DB.First(&reportedPost, r.ReportedPostID).Error; err == nil {
				item.ReportedPost = reportedPost.Subject
			}
		}

		result = append(result, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"reports": result,
		"count":   len(result),
	})
}

// UpdateReportStatus - Admin: Update report status
func (h *AdminHandler) UpdateReportStatus(c *gin.Context) {
	id := c.Param("id")

	var report models.Report
	if err := h.DB.First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Report not found",
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

	// Validate status
	validStatuses := map[string]bool{
		"pending":  true,
		"reviewed": true,
		"resolved": true,
	}

	if !validStatuses[input.Status] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Status must be pending, reviewed, or resolved",
		})
		return
	}

	report.Status = input.Status
	if err := h.DB.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update report",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Report status updated",
		"report":  report,
	})
}
