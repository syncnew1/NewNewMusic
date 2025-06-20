package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Song struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	Artist      []string           `json:"artist" bson:"artist"`
	Album       string             `json:"album" bson:"album"`
	Genre       string             `json:"genre" bson:"genre"`
	Duration    int                `json:"duration" bson:"duration"` // in seconds
	FilePath    string             `json:"filePath" bson:"filePath"`
	CoverImage  string             `json:"coverImage" bson:"coverImage"`
	ReleaseDate time.Time          `json:"releaseDate" bson:"releaseDate"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type SongResponse struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Artist      []string  `json:"artist"`
	Album       string    `json:"album"`
	Genre       string    `json:"genre"`
	Duration    int       `json:"duration"`
	FilePath    string    `json:"filePath"`
	CoverImage  string    `json:"coverImage"`
	ReleaseDate time.Time `json:"releaseDate"`
}

func (s *Song) ToResponse() *SongResponse {
	return &SongResponse{
		ID:          s.ID.Hex(),
		Title:       s.Title,
		Artist:      s.Artist,
		Album:       s.Album,
		Genre:       s.Genre,
		Duration:    s.Duration,
		FilePath:    s.FilePath,
		CoverImage:  s.CoverImage,
		ReleaseDate: s.ReleaseDate,
	}
}
