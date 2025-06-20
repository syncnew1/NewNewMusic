package service

import (
	"context"
	"errors"
	"time"

	"newnewmusic/internal/models"
	"newnewmusic/internal/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserService struct {
	collection *mongo.Collection
	jwtManager *utils.JWTManager
}

func NewUserService(db *mongo.Database, jwtManager *utils.JWTManager) *UserService {
	return &UserService{
		collection: db.Collection("users"),
		jwtManager: jwtManager,
	}
}

func (s *UserService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Check if user already exists
	var existingUser models.User
	err := s.collection.FindOne(context.Background(), bson.M{
		"$or": []bson.M{
			{"username": req.Username},
			{"email": req.Email},
		},
	}).Decode(&existingUser)

	if err == nil {
		return nil, errors.New("user already exists")
	}

	if err != mongo.ErrNoDocuments {
		return nil, err
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		ID:            primitive.NewObjectID(),
		Username:      req.Username,
		Email:         req.Email,
		Password:      hashedPassword,
		FavoriteSongs: []primitive.ObjectID{},
<<<<<<< HEAD
		Playlists:     []primitive.ObjectID{},
		Following:     []primitive.ObjectID{},
		Followers:     []primitive.ObjectID{},
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	_, err = s.collection.InsertOne(context.Background(), user)
	if err != nil {
		return nil, err
	}

	// Generate token
	token, err := s.jwtManager.GenerateToken(user.ID, user.Username)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:        user.ToResponse(),
		AccessToken: token,
		Token:       token,
	}, nil
}

func (s *UserService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	var user models.User
	err := s.collection.FindOne(context.Background(), bson.M{"username": req.Username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	// Check password
	if !utils.CheckPassword(req.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Generate token
	token, err := s.jwtManager.GenerateToken(user.ID, user.Username)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:        user.ToResponse(),
		AccessToken: token,
		Token:       token,
	}, nil
}

func (s *UserService) GetUserByID(userID string) (*models.User, error) {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	var user models.User
	err = s.collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) AddFavoriteSong(userID, songID string) error {
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	songObjID, err := primitive.ObjectIDFromHex(songID)
	if err != nil {
		return err
	}

	_, err = s.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": userObjID},
		bson.M{"$addToSet": bson.M{"favoriteSongs": songObjID}},
	)

	return err
}

func (s *UserService) RemoveFavoriteSong(userID, songID string) error {
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	songObjID, err := primitive.ObjectIDFromHex(songID)
	if err != nil {
		return err
	}

	_, err = s.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": userObjID},
		bson.M{"$pull": bson.M{"favoriteSongs": songObjID}},
	)

	return err
}
