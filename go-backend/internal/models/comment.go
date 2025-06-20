package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Comment struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	SongID    primitive.ObjectID `json:"songId" bson:"songId"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Content   string             `json:"content" bson:"content"`
	Rating    int                `json:"rating" bson:"rating"` // 1-5星评分
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type CommentResponse struct {
	ID        string    `json:"id"`
	SongID    string    `json:"songId"`
	UserID    string    `json:"userId"`
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	Rating    int       `json:"rating"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateCommentRequest struct {
	SongID  string `json:"songId" binding:"required"`
	Content string `json:"content" binding:"required,min=1,max=1000"`
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
}

type UpdateCommentRequest struct {
	Content string `json:"content" binding:"min=1,max=1000"`
	Rating  int    `json:"rating" binding:"min=1,max=5"`
}

func (c *Comment) ToResponse(username string) *CommentResponse {
	return &CommentResponse{
		ID:        c.ID.Hex(),
		SongID:    c.SongID.Hex(),
		UserID:    c.UserID.Hex(),
		Username:  username,
		Content:   c.Content,
		Rating:    c.Rating,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}