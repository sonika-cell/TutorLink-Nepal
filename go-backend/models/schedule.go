package models

import (
	"time"
)

type Schedule struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ApplicationID uint      `gorm:"not null" json:"application_id"`
	ParentID      uint      `gorm:"not null" json:"parent_id"`
	TutorID       uint      `gorm:"not null" json:"tutor_id"`
	TuitionPostID uint      `gorm:"not null" json:"tuition_post_id"`
	ClassType     string    `gorm:"default:'regular'" json:"class_type"` // "demo" or "regular"
	Date          string    `gorm:"not null" json:"date"`                // Format: "2026-09-15"
	StartTime     string    `gorm:"not null" json:"start_time"`          // Format: "10:00"
	EndTime       string    `gorm:"not null" json:"end_time"`            // Format: "11:00"
	Mode          string    `gorm:"not null" json:"mode"`                // "online" or "offline"
	Status        string    `gorm:"default:'scheduled'" json:"status"`   // scheduled, completed, cancelled
	MeetingLink   string    `json:"meeting_link"`                        // Jitsi room URL (for online)
	Notes         string    `json:"notes"`                               // Additional notes
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
