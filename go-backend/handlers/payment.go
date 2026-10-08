package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"tutorlink/models"
)

const (
	ProviderEsewa  = "eSewa"
	ProviderKhalti = "Khalti"

	PaymentStatusPending = "pending"
	PaymentMethodQR      = "qr"
)

type PaymentHandler struct {
	DB *gorm.DB
}

func NewPaymentHandler(db *gorm.DB) *PaymentHandler {
	return &PaymentHandler{DB: db}
}

func generateTxnID() (string, error) {
	b := make([]byte, 16)

	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return "TXN-" + hex.EncodeToString(b), nil
}

// POST /api/payments/create
func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	// Get tutor ID from JWT middleware.
	tutorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	tutorID, ok := tutorIDVal.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user identity",
		})
		return
	}

	var body struct {
		PlacementID uint   `json:"placement_id" binding:"required"`
		Provider    string `json:"provider"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "placement_id is required",
		})
		return
	}

	if body.Provider == "" {
		body.Provider = ProviderEsewa
	}

	if body.Provider != ProviderEsewa &&
		body.Provider != ProviderKhalti {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "provider must be eSewa or Khalti",
		})
		return
	}

	// Load placement.
	var placement models.Placement

	if err := h.DB.First(&placement, body.PlacementID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Placement not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not load placement",
		})
		return
	}

	// Verify ownership.
	if placement.TutorID != tutorID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "This placement does not belong to you",
		})
		return
	}

	// Verify payment state.
	if placement.Status != "pending_payment" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Placement is not awaiting payment",
		})
		return
	}

	// Prevent duplicate pending payments.
	var existing models.Payment

	err := h.DB.
		Where(
			"placement_id = ? AND tutor_id = ? AND status = ?",
			placement.ID,
			tutorID,
			PaymentStatusPending,
		).
		First(&existing).Error

	if err == nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Payment already initiated",
			"payment": existing,
		})
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not check existing payment",
		})
		return
	}

	// Calculate 25% fee as whole rupees.
	// Use the placement amount directly (already calculated as 25% of budget)
	fee := int64(placement.Amount)

	txnID, err := generateTxnID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not generate transaction ID",
		})
		return
	}

	payment := models.Payment{
		PlacementID:     placement.ID,
		TutorID:         tutorID,
		Amount:          fee,
		Provider:        body.Provider,
		TransactionUUID: &txnID,
		Status:          PaymentStatusPending,
		PaymentMethod:   PaymentMethodQR,
	}

	if err := h.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not create payment",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payment initiated",
		"payment": payment,
	})
}

// PUT /api/payments/:id/confirm
// Tutor clicks "I've Paid" → marks payment as success + confirms placement
func (h *PaymentHandler) ConfirmPayment(c *gin.Context) {
	// Get tutor ID from JWT
	tutorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	tutorID, ok := tutorIDVal.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user identity",
		})
		return
	}

	// Get payment ID from URL
	paymentID := c.Param("id")
	if paymentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payment ID is required",
		})
		return
	}

	// Load payment
	var payment models.Payment
	if err := h.DB.First(&payment, paymentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Payment not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not load payment",
		})
		return
	}

	// Verify ownership
	if payment.TutorID != tutorID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "This payment does not belong to you",
		})
		return
	}

	// Check payment status
	if payment.Status != PaymentStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payment is not pending",
		})
		return
	}

	// Load placement
	var placement models.Placement
	if err := h.DB.First(&placement, payment.PlacementID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not load placement",
		})
		return
	}

	now := time.Now()

	// Do both updates in one transaction so they can't get out of sync.
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		// Mark payment as success
		payment.Status = "success"
		payment.PaidAt = &now
		if err := tx.Save(&payment).Error; err != nil {
			return err
		}

		// Mark placement as confirmed
		placement.Status = "confirmed"
		placement.ConfirmedAt = now
		if err := tx.Save(&placement).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not confirm payment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Payment confirmed! You can now schedule the demo class.",
		"payment":   payment,
		"placement": placement,
	})
}

// PUT /api/payments/:id/fail
// Tutor clicks "Payment Failed" → marks payment as failed
func (h *PaymentHandler) FailPayment(c *gin.Context) {
	tutorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	tutorID, ok := tutorIDVal.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user identity",
		})
		return
	}

	paymentID := c.Param("id")
	if paymentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payment ID is required",
		})
		return
	}

	var payment models.Payment
	if err := h.DB.First(&payment, paymentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Payment not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not load payment",
		})
		return
	}

	if payment.TutorID != tutorID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "This payment does not belong to you",
		})
		return
	}

	// Only pending payments can be marked as failed
	if payment.Status != PaymentStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payment is not pending",
		})
		return
	}

	payment.Status = "failed"
	if err := h.DB.Save(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not update payment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment marked as failed. You can retry.",
		"payment": payment,
	})
}

// GET /api/payments/placement/:placementId
// Returns all payment attempts for a placement (owned by the logged-in tutor).
func (h *PaymentHandler) GetPaymentsForPlacement(c *gin.Context) {
	// Get tutor ID from middleware
	tutorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	tutorID, ok := tutorIDVal.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user identity",
		})
		return
	}

	// Parse placement ID
	placementID := c.Param("placementId")
	if placementID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Placement ID is required",
		})
		return
	}

	// Verify the placement belongs to this tutor
	var placement models.Placement
	if err := h.DB.First(&placement, placementID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Placement not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not load placement",
		})
		return
	}

	if placement.TutorID != tutorID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "This placement does not belong to you",
		})
		return
	}

	// Fetch all payments for this placement, newest first
	var payments []models.Payment
	if err := h.DB.
		Where("placement_id = ?", placement.ID).
		Order("created_at DESC").
		Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not load payments",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"placement_id": placement.ID,
		"count":        len(payments),
		"payments":     payments,
	})
}
