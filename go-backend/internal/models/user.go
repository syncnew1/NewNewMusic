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
<<<<<<< HEAD
	Playlists     []primitive.ObjectID `json:"playlists" bson:"playlists"`
	Following     []primitive.ObjectID `json:"following" bson:"following"`
	Followers     []primitive.ObjectID `json:"followers" bson:"followers"`
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
	CreatedAt     time.Time            `json:"createdAt" bson:"createdAt"`
	UpdatedAt     time.Time            `json:"updatedAt" bson:"updatedAt"`
}

type UserResponse struct {
	ID            string    `json:"id"`
	Username      string    `json:"username"`
	Email         string    `json:"email"`
	FavoriteSongs []string  `json:"favoriteSongs"`
<<<<<<< HEAD
	Playlists     []string  `json:"playlists"`
	Following     []string  `json:"following"`
	Followers     []string  `json:"followers"`
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
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

<<<<<<< HEAD
	playlists := make([]string, len(u.Playlists))
	for i, id := range u.Playlists {
		playlists[i] = id.Hex()
	}

	following := make([]string, len(u.Following))
	for i, id := range u.Following {
		following[i] = id.Hex()
	}

	followers := make([]string, len(u.Followers))
	for i, id := range u.Followers {
		followers[i] = id.Hex()
	}

=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
	return &UserResponse{
		ID:            u.ID.Hex(),
		Username:      u.Username,
		Email:         u.Email,
		FavoriteSongs: favoriteSongs,
<<<<<<< HEAD
		Playlists:     playlists,
		Following:     following,
		Followers:     followers,
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
		CreatedAt:     u.CreatedAt,
	}
}
