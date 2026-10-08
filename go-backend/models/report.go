package models

import "time"

type Report struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ReporterID     uint      `gorm:"not null" json:"reporter_id"`
	ReportedUserID uint      `json:"reported_user_id"`
	ReportedPostID uint      `json:"reported_post_id"`
	Reason         string    `gorm:"not null" json:"reason"`
	Description    string    `json:"description"`
	Status         string    `gorm:"default:'pending'" json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
