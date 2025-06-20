package service

import (
	"context"
	"errors"
	"time"

	"newnewmusic/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type FollowService struct {
	userCollection *mongo.Collection
}

func NewFollowService(db *mongo.Database) *FollowService {
	return &FollowService{
		userCollection: db.Collection("users"),
	}
}

func (s *FollowService) FollowUser(followerID, followeeID primitive.ObjectID) error {
	if followerID == followeeID {
		return errors.New("cannot follow yourself")
	}

	// 检查被关注用户是否存在
	var followee models.User
	err := s.userCollection.FindOne(context.Background(), bson.M{"_id": followeeID}).Decode(&followee)
	if err != nil {
		return errors.New("user to follow not found")
	}

	// 检查是否已经关注
	var follower models.User
	err = s.userCollection.FindOne(context.Background(), bson.M{"_id": followerID}).Decode(&follower)
	if err != nil {
		return errors.New("follower not found")
	}

	// 检查是否已经在关注列表中
	for _, id := range follower.Following {
		if id == followeeID {
			return errors.New("already following this user")
		}
	}

	// 添加到关注者的关注列表
	_, err = s.userCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": followerID},
		bson.M{"$push": bson.M{"following": followeeID}, "$set": bson.M{"updatedAt": time.Now()}},
	)
	if err != nil {
		return err
	}

	// 添加到被关注者的粉丝列表
	_, err = s.userCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": followeeID},
		bson.M{"$push": bson.M{"followers": followerID}, "$set": bson.M{"updatedAt": time.Now()}},
	)

	return err
}

func (s *FollowService) UnfollowUser(followerID, followeeID primitive.ObjectID) error {
	if followerID == followeeID {
		return errors.New("cannot unfollow yourself")
	}

	// 从关注者的关注列表中移除
	_, err := s.userCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": followerID},
		bson.M{"$pull": bson.M{"following": followeeID}, "$set": bson.M{"updatedAt": time.Now()}},
	)
	if err != nil {
		return err
	}

	// 从被关注者的粉丝列表中移除
	_, err = s.userCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": followeeID},
		bson.M{"$pull": bson.M{"followers": followerID}, "$set": bson.M{"updatedAt": time.Now()}},
	)

	return err
}

func (s *FollowService) GetFollowing(userID primitive.ObjectID) ([]*models.UserResponse, error) {
	var user models.User
	err := s.userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if len(user.Following) == 0 {
		return []*models.UserResponse{}, nil
	}

	// 获取关注的用户信息
	cursor, err := s.userCollection.Find(context.Background(), bson.M{"_id": bson.M{"$in": user.Following}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err = cursor.All(context.Background(), &users); err != nil {
		return nil, err
	}

	responses := make([]*models.UserResponse, len(users))
	for i, u := range users {
		responses[i] = u.ToResponse()
	}

	return responses, nil
}

func (s *FollowService) GetFollowers(userID primitive.ObjectID) ([]*models.UserResponse, error) {
	var user models.User
	err := s.userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if len(user.Followers) == 0 {
		return []*models.UserResponse{}, nil
	}

	// 获取粉丝的用户信息
	cursor, err := s.userCollection.Find(context.Background(), bson.M{"_id": bson.M{"$in": user.Followers}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err = cursor.All(context.Background(), &users); err != nil {
		return nil, err
	}

	responses := make([]*models.UserResponse, len(users))
	for i, u := range users {
		responses[i] = u.ToResponse()
	}

	return responses, nil
}

func (s *FollowService) IsFollowing(followerID, followeeID primitive.ObjectID) (bool, error) {
	var user models.User
	err := s.userCollection.FindOne(context.Background(), bson.M{"_id": followerID}).Decode(&user)
	if err != nil {
		return false, err
	}

	for _, id := range user.Following {
		if id == followeeID {
			return true, nil
		}
	}

	return false, nil
}

func (s *FollowService) GetFollowStats(userID primitive.ObjectID) (int, int, error) {
	var user models.User
	err := s.userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return 0, 0, errors.New("user not found")
	}

	return len(user.Following), len(user.Followers), nil
}