package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Playlist struct {
	ID          primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Name        string               `json:"name" bson:"name"`
	Description string               `json:"description" bson:"description"`
	OwnerID     primitive.ObjectID   `json:"ownerId" bson:"ownerId"`
	Songs       []primitive.ObjectID `json:"songs" bson:"songs"`
	IsPublic    bool                 `json:"isPublic" bson:"isPublic"`
	Tags        []string             `json:"tags" bson:"tags"` // 用于智能播放列表分类
	CreatedAt   time.Time            `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time            `json:"updatedAt" bson:"updatedAt"`
}

type PlaylistResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     string    `json:"ownerId"`
	OwnerName   string    `json:"ownerName"`
	Songs       []string  `json:"songs"`
	IsPublic    bool      `json:"isPublic"`
	Tags        []string  `json:"tags"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreatePlaylistRequest struct {
	Name        string   `json:"name" binding:"required,min=1,max=100"`
	Description string   `json:"description" binding:"max=500"`
	IsPublic    bool     `json:"isPublic"`
	Tags        []string `json:"tags"`
}

type UpdatePlaylistRequest struct {
	Name        string   `json:"name" binding:"min=1,max=100"`
	Description string   `json:"description" binding:"max=500"`
	IsPublic    *bool    `json:"isPublic"`
	Tags        []string `json:"tags"`
}

type AddSongToPlaylistRequest struct {
	SongID string `json:"songId" binding:"required"`
}

func (p *Playlist) ToResponse(ownerName string) *PlaylistResponse {
	songs := make([]string, len(p.Songs))
	for i, id := range p.Songs {
		songs[i] = id.Hex()
	}

	return &PlaylistResponse{
		ID:          p.ID.Hex(),
		Name:        p.Name,
		Description: p.Description,
		OwnerID:     p.OwnerID.Hex(),
		OwnerName:   ownerName,
		Songs:       songs,
		IsPublic:    p.IsPublic,
		Tags:        p.Tags,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}