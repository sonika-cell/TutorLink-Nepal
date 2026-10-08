package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/joho/godotenv"
	"gorm.io/gorm"

	"tutorlink/handlers"
	"tutorlink/middleware"
	"tutorlink/models"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db, err := gorm.Open(sqlite.Open("tutorlink.db"), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(&models.User{}, &models.TutorProfile{},
		&models.TuitionPost{}, &models.Application{}, &models.Schedule{},
		&models.Placement{}, &models.Report{}, &models.Payment{})

	if err != nil {
		panic(err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	authHandler := handlers.AuthHandler{DB: db}
	tutorProfileHandler := handlers.TutorProfileHandler{DB: db}
	tuitionPostHandler := handlers.NewTuitionPostHandler(db)
	applicationHandler := handlers.NewApplicationHandler(db)
	scheduleHandler := handlers.NewScheduleHandler(db)
	placementHandler := handlers.NewPlacementHandler(db)
	adminHandler := handlers.NewAdminHandler(db)
	paymentHandler := handlers.NewPaymentHandler(db)

	// ==========================================
	// AUTH ROUTES
	// ==========================================
	r.POST("/api/register", authHandler.Register)
	r.POST("/api/login", authHandler.Login)

	// ==========================================
	// TUTOR PROFILE ROUTES
	// ==========================================
	r.POST("/api/tutor/profile", middleware.AuthRequired(), tutorProfileHandler.CreateProfile)
	r.POST("/api/tutor/upload-cv", middleware.AuthRequired(), tutorProfileHandler.UploadCV)
	r.GET("/api/tutor/:id/cv", tutorProfileHandler.DownloadCV)
	r.GET("/api/tutors", middleware.AuthRequired(), tutorProfileHandler.GetTutors)
	r.GET("/api/tutor/:id", middleware.AuthRequired(), tutorProfileHandler.GetTutorByID)

	// ==========================================
	// TUITION POST ROUTES
	// ==========================================
	r.POST("/api/tuition/post", middleware.AuthRequired(), tuitionPostHandler.CreateTuitionPost)
	r.DELETE("/api/tuition/post/:id", middleware.AuthRequired(), tuitionPostHandler.DeleteTuitionPost)
	r.GET("/api/tuition/posts", middleware.AuthRequired(), tuitionPostHandler.GetTuitionPosts)

	// ==========================================
	// APPLICATION ROUTES
	// ==========================================
	r.POST("/api/application/apply", middleware.AuthRequired(), applicationHandler.ApplyToTuition)
	r.GET("/api/applications/tutor", middleware.AuthRequired(), applicationHandler.GetTutorApplications)
	r.GET("/api/applications/parent", middleware.AuthRequired(), applicationHandler.GetParentApplications)
	r.PUT("/api/application/:id/status", middleware.AuthRequired(), applicationHandler.UpdateApplicationStatus)

	// ==========================================
	// SCHEDULE ROUTES
	// ==========================================
	r.POST("/api/schedule", middleware.AuthRequired(), scheduleHandler.CreateSchedule)
	r.GET("/api/schedules/tutor", middleware.AuthRequired(), scheduleHandler.GetTutorSchedules)
	r.GET("/api/schedules/parent", middleware.AuthRequired(), scheduleHandler.GetParentSchedules)
	r.PUT("/api/schedule/:id/status", middleware.AuthRequired(), scheduleHandler.UpdateScheduleStatus)

	// ==========================================
	// PLACEMENT ROUTES (Placement Fee Flow)
	// ==========================================
	r.POST("/api/placement", middleware.AuthRequired(), placementHandler.CreatePlacement)
	r.GET("/api/placements/tutor", middleware.AuthRequired(), placementHandler.GetTutorPlacements)
	r.GET("/api/placements/parent", middleware.AuthRequired(), placementHandler.GetParentPlacements)
	r.GET("/api/placements/all", middleware.AuthRequired(), placementHandler.GetAllPlacements)

	// ⚠️ SPECIFIC routes MUST come before generic :id routes
	r.GET("/api/placement/:id/parent-contact", middleware.AuthRequired(), placementHandler.GetParentContact)

	// Generic :id routes come AFTER
	r.GET("/api/placement/:id", middleware.AuthRequired(), placementHandler.GetPlacementByID)
	r.PUT("/api/placement/:id/pay", middleware.AuthRequired(), placementHandler.MarkAsPaid)
	r.PUT("/api/placement/:id/confirm", middleware.AuthRequired(), placementHandler.ConfirmPayment)

	// ==========================================
	// PAYMENT ROUTES (Placement Fee Flow)
	// ==========================================
	r.POST("/api/payments/create", middleware.AuthRequired(), paymentHandler.CreatePayment)
	// Payment routes (Placement Fee Flow)
	r.PUT("/api/payments/:id/confirm", middleware.AuthRequired(), paymentHandler.ConfirmPayment)
	r.PUT("/api/payments/:id/fail", middleware.AuthRequired(), paymentHandler.FailPayment)
	r.GET("/api/payments/placement/:placementId", middleware.AuthRequired(), paymentHandler.GetPaymentsForPlacement)

	// ==========================================
	// ADMIN ROUTES — Protected (Admin only)
	// ==========================================
	adminRoutes := r.Group("/api/admin")
	adminRoutes.Use(middleware.AuthRequired())
	adminRoutes.Use(middleware.AdminRequired(db))
	{
		adminRoutes.GET("/users", adminHandler.GetUsers)
		adminRoutes.GET("/tutors", adminHandler.GetTutors)
		adminRoutes.GET("/posts", adminHandler.GetPosts)
		adminRoutes.GET("/applications", adminHandler.GetApplications)
		adminRoutes.GET("/placements", adminHandler.GetPlacements)
		adminRoutes.GET("/reports", adminHandler.GetReports)
		adminRoutes.PUT("/reports/:id/status", adminHandler.UpdateReportStatus)
	}

	// ==========================================
	// PROTECTED TEST ROUTE
	// ==========================================
	r.GET("/api/protected", middleware.AuthRequired(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "You are authenticated!",
		})
	})

	// ==========================================
	// HEALTH CHECK
	// ==========================================
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "TutorLink Nepal backend is running!",
		})
	})

	r.Run(":8080")
}
