package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID            primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Username      string               `json:"username" bson:"username"`
	Email         string               `json:"email" bson:"email"`
	Password      string               `json:"-" bson:"password"` // Never return password in JSON
	FavoriteSongs []primitive.ObjectID `json:"favoriteSongs" bson:"favoriteSongs"`
	CreatedAt     time.Time            `json:"createdAt" bson:"createdAt"`
	UpdatedAt     time.Time            `json:"updatedAt" bson:"updatedAt"`
}

type UserResponse struct {
	ID            string    `json:"id"`
	Username      string    `json:"username"`
	Email         string    `json:"email"`
	FavoriteSongs []string  `json:"favoriteSongs"`
	CreatedAt     time.Time `json:"createdAt"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type AuthResponse struct {
	User        *UserResponse `json:"user"`
	AccessToken string        `json:"accessToken"`
	Token       string        `json:"token"` // Keep for backward compatibility
}

func (u *User) ToResponse() *UserResponse {
	favoriteSongs := make([]string, len(u.FavoriteSongs))
	for i, id := range u.FavoriteSongs {
		favoriteSongs[i] = id.Hex()
	}

	return &UserResponse{
		ID:            u.ID.Hex(),
		Username:      u.Username,
		Email:         u.Email,
		FavoriteSongs: favoriteSongs,
		CreatedAt:     u.CreatedAt,
	}
}
