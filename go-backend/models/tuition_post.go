package models

import (
	"time"
)

type TuitionPost struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ParentID      uint      `gorm:"not null" json:"parent_id"`
	Subject       string    `gorm:"not null" json:"subject"`
	Grade         string    `gorm:"not null" json:"grade"`
	Description   string    `json:"description"`
	Location      string    `gorm:"not null" json:"location"`
	PreferredMode string    `gorm:"not null" json:"preferred_mode"` // "online" or "offline" or "both"
	Budget        string    `json:"budget"`
	Status        string    `gorm:"default:'open'" json:"status"` // "open", "closed", "in_progress"
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
