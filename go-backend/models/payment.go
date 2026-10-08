package models

import "time"

type Payment struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	PlacementID     uint       `gorm:"not null;index" json:"placement_id"`
	TutorID         uint       `gorm:"not null;index" json:"tutor_id"`
	Amount          int64      `gorm:"not null" json:"amount"`
	Provider        string     `gorm:"not null" json:"provider"`
	TransactionUUID *string    `gorm:"uniqueIndex" json:"transaction_uuid"`
	Status          string     `gorm:"not null;default:'pending';index" json:"status"`
	PaymentMethod   string     `gorm:"not null" json:"payment_method"`
	PaidAt          *time.Time `json:"paid_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}
