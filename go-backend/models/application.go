package models

import (
	"time"
)

type Application struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	TutorID       uint      `gorm:"not null" json:"tutor_id"`
	TuitionPostID uint      `gorm:"not null" json:"tuition_post_id"`
	Status        string    `gorm:"default:'pending'" json:"status"` // pending, accepted, rejected
	Message       string    `json:"message"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
