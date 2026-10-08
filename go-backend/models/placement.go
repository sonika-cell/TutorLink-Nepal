package models

import "time"

type Placement struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	ApplicationID       uint      `gorm:"not null" json:"application_id"`
	ParentID            uint      `gorm:"not null" json:"parent_id"`
	TutorID             uint      `gorm:"not null" json:"tutor_id"`
	TuitionPostID       uint      `gorm:"not null" json:"tuition_post_id"`
	Amount              float64   `gorm:"not null" json:"amount"`
	Status              string    `gorm:"default:'pending_payment'" json:"status"` // pending_payment, pending_verification, paid, cancelled
	PaymentMethod       string    `json:"payment_method"`                          // qr, esewa, khalti, manual
	PaymentRef          string    `json:"payment_ref"`                             // Optional reference
	EmailReminderSent   bool      `gorm:"default:false" json:"email_reminder_sent"`
	CallReminderSent    bool      `gorm:"default:false" json:"call_reminder_sent"`
	EmailReminderSentAt time.Time `json:"email_reminder_sent_at"`
	CallReminderSentAt  time.Time `json:"call_reminder_sent_at"`
	PaidAt              time.Time `json:"paid_at"`
	ConfirmedAt         time.Time `json:"confirmed_at"`
	CancelledAt         time.Time `json:"cancelled_at"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
