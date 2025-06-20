package service

import (
	"go.mongodb.org/mongo-driver/mongo"
	"newnewmusic/internal/utils"
)

// Services holds all service instances
type Services struct {
	User     *UserService
	Song     *SongService
	Playlist *PlaylistService
	Comment  *CommentService
	Follow   *FollowService
}

// NewServices creates and returns a new Services instance
func NewServices(db *mongo.Database, jwtManager *utils.JWTManager) *Services {
	return &Services{
		User:     NewUserService(db, jwtManager),
		Song:     NewSongService(db),
		Playlist: NewPlaylistService(db),
		Comment:  NewCommentService(db),
		Follow:   NewFollowService(db),
	}
}