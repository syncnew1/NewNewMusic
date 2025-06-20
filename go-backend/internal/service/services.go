package service

import (
	"newnewmusic/internal/config"
	"newnewmusic/internal/utils"

	"go.mongodb.org/mongo-driver/mongo"
)

type Services struct {
	User *UserService
	Song *SongService
}

func NewServices(db *mongo.Database, cfg *config.Config) *Services {
	jwtManager := utils.NewJWTManager(cfg.JWT.Secret, cfg.JWT.Expiration)

	return &Services{
		User: NewUserService(db, jwtManager),
		Song: NewSongService(db),
	}
}
