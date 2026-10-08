package models

import "time"

type TutorProfile struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"unique;not null" json:"user_id"`
	FullName        string    `gorm:"not null" json:"full_name"`
	Phone           string    `json:"phone"`
	Qualification   string    `json:"qualification"`
	Subjects        string    `json:"subjects"`
	ExperienceYears int       `json:"experience_years"`
	HighestClass    string    `json:"highest_class"`
	Bio             string    `json:"bio"`
	Location        string    `json:"location"`
	CVText          string    `json:"cv_text"`
	CVPath          string    `json:"cv_path"`
	CVFileName      string    `json:"cv_file_name"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
