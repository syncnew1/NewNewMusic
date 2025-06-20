package service

import (
	"context"
	"errors"
	"time"

	"newnewmusic/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CommentService struct {
	commentCollection *mongo.Collection
	userCollection    *mongo.Collection
	songCollection    *mongo.Collection
}

func NewCommentService(db *mongo.Database) *CommentService {
	return &CommentService{
		commentCollection: db.Collection("comments"),
		userCollection:    db.Collection("users"),
		songCollection:    db.Collection("songs"),
	}
}

func (s *CommentService) CreateComment(userID primitive.ObjectID, req *models.CreateCommentRequest) (*models.CommentResponse, error) {
	// 验证歌曲存在
	songID, err := primitive.ObjectIDFromHex(req.SongID)
	if err != nil {
		return nil, errors.New("invalid song ID")
	}

	var song models.Song
	err = s.songCollection.FindOne(context.Background(), bson.M{"_id": songID}).Decode(&song)
	if err != nil {
		return nil, errors.New("song not found")
	}

	// 允许用户对同一首歌发表多条评论

	comment := &models.Comment{
		ID:        primitive.NewObjectID(),
		SongID:    songID,
		UserID:    userID,
		Content:   req.Content,
		Rating:    req.Rating,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = s.commentCollection.InsertOne(context.Background(), comment)
	if err != nil {
		return nil, err
	}

	// 获取用户名
	var user models.User
	err = s.userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return nil, err
	}

	return comment.ToResponse(user.Username), nil
}

func (s *CommentService) GetCommentsBySong(songID string) ([]*models.CommentResponse, error) {
	songObjectID, err := primitive.ObjectIDFromHex(songID)
	if err != nil {
		return nil, errors.New("invalid song ID")
	}

	// 按创建时间倒序排列
	opts := options.Find().SetSort(bson.D{{"createdAt", -1}})
	cursor, err := s.commentCollection.Find(context.Background(), bson.M{"songId": songObjectID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var comments []models.Comment
	if err = cursor.All(context.Background(), &comments); err != nil {
		return nil, err
	}

	// 获取所有用户名
	userIDs := make([]primitive.ObjectID, len(comments))
	for i, comment := range comments {
		userIDs[i] = comment.UserID
	}

	userCursor, err := s.userCollection.Find(context.Background(), bson.M{"_id": bson.M{"$in": userIDs}})
	if err != nil {
		return nil, err
	}
	defer userCursor.Close(context.Background())

	var users []models.User
	if err = userCursor.All(context.Background(), &users); err != nil {
		return nil, err
	}

	// 创建用户ID到用户名的映射
	userMap := make(map[primitive.ObjectID]string)
	for _, user := range users {
		userMap[user.ID] = user.Username
	}

	responses := make([]*models.CommentResponse, len(comments))
	for i, comment := range comments {
		responses[i] = comment.ToResponse(userMap[comment.UserID])
	}

	return responses, nil
}

func (s *CommentService) UpdateComment(commentID string, userID primitive.ObjectID, req *models.UpdateCommentRequest) (*models.CommentResponse, error) {
	commentObjectID, err := primitive.ObjectIDFromHex(commentID)
	if err != nil {
		return nil, errors.New("invalid comment ID")
	}

	// 验证评论存在且属于当前用户
	var comment models.Comment
	err = s.commentCollection.FindOne(context.Background(), bson.M{"_id": commentObjectID}).Decode(&comment)
	if err != nil {
		return nil, errors.New("comment not found")
	}

	if comment.UserID != userID {
		return nil, errors.New("unauthorized: you can only edit your own comments")
	}

	// 更新评论
	update := bson.M{"updatedAt": time.Now()}
	if req.Content != "" {
		update["content"] = req.Content
	}
	if req.Rating > 0 {
		update["rating"] = req.Rating
	}

	_, err = s.commentCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": commentObjectID},
		bson.M{"$set": update},
	)
	if err != nil {
		return nil, err
	}

	// 获取更新后的评论
	err = s.commentCollection.FindOne(context.Background(), bson.M{"_id": commentObjectID}).Decode(&comment)
	if err != nil {
		return nil, err
	}

	// 获取用户名
	var user models.User
	err = s.userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return nil, err
	}

	return comment.ToResponse(user.Username), nil
}

func (s *CommentService) DeleteComment(commentID string, userID primitive.ObjectID) error {
	commentObjectID, err := primitive.ObjectIDFromHex(commentID)
	if err != nil {
		return errors.New("invalid comment ID")
	}

	// 验证评论存在且属于当前用户
	var comment models.Comment
	err = s.commentCollection.FindOne(context.Background(), bson.M{"_id": commentObjectID}).Decode(&comment)
	if err != nil {
		return errors.New("comment not found")
	}

	if comment.UserID != userID {
		return errors.New("unauthorized: you can only delete your own comments")
	}

	// 删除评论
	_, err = s.commentCollection.DeleteOne(context.Background(), bson.M{"_id": commentObjectID})
	return err
}

func (s *CommentService) GetSongRating(songID string) (float64, int, error) {
	songObjectID, err := primitive.ObjectIDFromHex(songID)
	if err != nil {
		return 0, 0, errors.New("invalid song ID")
	}

	// 聚合查询计算平均评分
	pipeline := []bson.M{
		{"$match": bson.M{"songId": songObjectID}},
		{"$group": bson.M{
			"_id":         nil,
			"avgRating":   bson.M{"$avg": "$rating"},
			"totalRating": bson.M{"$sum": 1},
		}},
	}

	cursor, err := s.commentCollection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return 0, 0, err
	}
	defer cursor.Close(context.Background())

	var result []bson.M
	if err = cursor.All(context.Background(), &result); err != nil {
		return 0, 0, err
	}

	if len(result) == 0 {
		return 0, 0, nil
	}

	avgRating := result[0]["avgRating"].(float64)
	totalRating := int(result[0]["totalRating"].(int32))

	return avgRating, totalRating, nil
}