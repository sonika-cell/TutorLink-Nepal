package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"tutorlink/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type KhaltiHandler struct {
	DB *gorm.DB
}

func NewKhaltiHandler(db *gorm.DB) *KhaltiHandler {
	return &KhaltiHandler{DB: db}
}

// ---------------------------------------------------------------------
// Initiate Payment
// POST /api/payments/khalti/initiate
// ---------------------------------------------------------------------
func (h *KhaltiHandler) InitiatePayment(c *gin.Context) {
	tutorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	tutorID := tutorIDVal.(uint)

	var body struct {
		PlacementID uint `json:"placement_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "placement_id is required"})
		return
	}

	// Load placement
	var placement models.Placement
	if err := h.DB.First(&placement, body.PlacementID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Placement not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify ownership
	if placement.TutorID != tutorID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not your placement"})
		return
	}

	// Verify status
	if placement.Status != "pending_payment" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placement not awaiting payment"})
		return
	}

	// Read env
	secretKey := os.Getenv("KHALTI_SECRET_KEY")
	baseURL := os.Getenv("KHALTI_BASE_URL")
	frontendURL := os.Getenv("FRONTEND_URL")

	if secretKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Khalti secret key not configured"})
		return
	}

	// Generate unique purchase_order_id
	orderID := fmt.Sprintf("TL-%d-%d", placement.ID, time.Now().Unix())

	// Amount in PAISA (1 rupee = 100 paisa)
	amountInPaisa := int(placement.Amount) * 100

	// Build request
	payload := map[string]interface{}{
		"return_url":          frontendURL + "/tutor/payment/success",
		"website_url":         frontendURL,
		"amount":              amountInPaisa,
		"purchase_order_id":   orderID,
		"purchase_order_name": fmt.Sprintf("TutorLink Placement Fee - Placement #%d", placement.ID),
	}

	jsonBody, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", baseURL+"/epayment/initiate/", bytes.NewBuffer(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to build request"})
		return
	}
	req.Header.Set("Authorization", "Key "+secretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach Khalti"})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":  "Khalti initiate failed",
			"status": resp.StatusCode,
			"body":   string(respBody),
		})
		return
	}

	var khaltiResp struct {
		Pidx       string `json:"pidx"`
		PaymentURL string `json:"payment_url"`
	}
	if err := json.Unmarshal(respBody, &khaltiResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid Khalti response"})
		return
	}

	// Save pidx on a pending payment record
	var payment models.Payment
	err = h.DB.
		Where("placement_id = ? AND tutor_id = ? AND status = ?", placement.ID, tutorID, "pending").
		First(&payment).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new
		payment = models.Payment{
			PlacementID:     placement.ID,
			TutorID:         tutorID,
			Amount:          int64(placement.Amount),
			Provider:        "Khalti",
			Status:          "pending",
			PaymentMethod:   "khalti",
			TransactionUUID: &khaltiResp.Pidx,
		}
		if err := h.DB.Create(&payment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save payment"})
			return
		}
	} else {
		// Update pidx on existing pending payment
		payment.TransactionUUID = &khaltiResp.Pidx
		h.DB.Save(&payment)
	}

	c.JSON(http.StatusOK, gin.H{
		"pidx":        khaltiResp.Pidx,
		"payment_url": khaltiResp.PaymentURL,
		"payment_id":  payment.ID,
	})
}

// ---------------------------------------------------------------------
// Verify Payment (called after Khalti redirects back)
// POST /api/payments/khalti/verify
// ---------------------------------------------------------------------
func (h *KhaltiHandler) VerifyPayment(c *gin.Context) {
	tutorIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	tutorID := tutorIDVal.(uint)

	var body struct {
		Pidx string `json:"pidx" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pidx is required"})
		return
	}

	secretKey := os.Getenv("KHALTI_SECRET_KEY")
	baseURL := os.Getenv("KHALTI_BASE_URL")

	// Build lookup request
	payload := map[string]string{"pidx": body.Pidx}
	jsonBody, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", baseURL+"/epayment/lookup/", bytes.NewBuffer(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to build request"})
		return
	}
	req.Header.Set("Authorization", "Key "+secretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach Khalti"})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":  "Khalti lookup failed",
			"status": resp.StatusCode,
			"body":   string(respBody),
		})
		return
	}

	var lookup struct {
		Pidx          string `json:"pidx"`
		TotalAmount   int    `json:"total_amount"`
		Status        string `json:"status"`
		TransactionID string `json:"transaction_id"`
	}
	if err := json.Unmarshal(respBody, &lookup); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid Khalti response"})
		return
	}

	// Only "Completed" means real payment
	if lookup.Status != "Completed" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "Payment not completed",
			"status": lookup.Status,
		})
		return
	}

	// Find the payment by pidx
	var payment models.Payment
	if err := h.DB.Where("transaction_uuid = ?", lookup.Pidx).First(&payment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	// Verify ownership
	if payment.TutorID != tutorID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not your payment"})
		return
	}

	// Idempotency: if already success, just return OK
	if payment.Status == "success" {
		c.JSON(http.StatusOK, gin.H{"message": "Payment already verified", "payment": payment})
		return
	}

	// Verify amount matches
	expectedPaisa := int(payment.Amount) * 100
	if lookup.TotalAmount != expectedPaisa {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":    "Amount mismatch",
			"expected": expectedPaisa,
			"received": lookup.TotalAmount,
		})
		return
	}

	// Mark payment success
	now := time.Now()
	payment.Status = "success"
	payment.PaidAt = &now
	h.DB.Save(&payment)

	// Confirm placement
	var placement models.Placement
	if err := h.DB.First(&placement, payment.PlacementID).Error; err == nil {
		placement.Status = "confirmed"
		placement.ConfirmedAt = now
		placement.PaymentRef = lookup.TransactionID
		h.DB.Save(&placement)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment verified and placement confirmed",
		"payment": payment,
	})
}
