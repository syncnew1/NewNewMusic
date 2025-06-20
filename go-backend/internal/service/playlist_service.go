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

type PlaylistService struct {
	playlistCollection *mongo.Collection
	userCollection     *mongo.Collection
	songCollection     *mongo.Collection
}

func NewPlaylistService(db *mongo.Database) *PlaylistService {
	return &PlaylistService{
		playlistCollection: db.Collection("playlists"),
		userCollection:     db.Collection("users"),
		songCollection:     db.Collection("songs"),
	}
}

func (s *PlaylistService) CreatePlaylist(userID primitive.ObjectID, req *models.CreatePlaylistRequest) (*models.PlaylistResponse, error) {
	playlist := &models.Playlist{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     userID,
		Songs:       []primitive.ObjectID{},
		IsPublic:    req.IsPublic,
		Tags:        req.Tags,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err := s.playlistCollection.InsertOne(context.Background(), playlist)
	if err != nil {
		return nil, err
	}

	// 更新用户的播放列表
	_, err = s.userCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": userID},
		bson.M{"$push": bson.M{"playlists": playlist.ID}},
	)
	if err != nil {
		return nil, err
	}

	// 获取用户名
	var user models.User
	err = s.userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		return nil, err
	}

	return playlist.ToResponse(user.Username), nil
}

func (s *PlaylistService) GetPlaylistByID(playlistID primitive.ObjectID) (*models.PlaylistResponse, error) {
	var playlist models.Playlist
	err := s.playlistCollection.FindOne(context.Background(), bson.M{"_id": playlistID}).Decode(&playlist)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("playlist not found")
		}
		return nil, err
	}

	// 获取歌单所有者信息
	var user models.User
	err = s.userCollection.FindOne(context.Background(), bson.M{"_id": playlist.OwnerID}).Decode(&user)
	if err != nil {
		return nil, err
	}

	return playlist.ToResponse(user.Username), nil
}

func (s *PlaylistService) GetPlaylistSongs(playlistID primitive.ObjectID) ([]*models.SongResponse, error) {
	// 首先获取歌单信息
	var playlist models.Playlist
	err := s.playlistCollection.FindOne(context.Background(), bson.M{"_id": playlistID}).Decode(&playlist)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("playlist not found")
		}
		return nil, err
	}

	// 如果歌单为空，返回空数组
	if len(playlist.Songs) == 0 {
		return []*models.SongResponse{}, nil
	}

	// 获取歌曲详情
	cursor, err := s.songCollection.Find(context.Background(), bson.M{"_id": bson.M{"$in": playlist.Songs}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var songs []models.Song
	if err = cursor.All(context.Background(), &songs); err != nil {
		return nil, err
	}

	// 转换为响应格式
	responses := make([]*models.SongResponse, len(songs))
	for i, song := range songs {
		responses[i] = song.ToResponse()
	}

	return responses, nil
}

func (s *PlaylistService) GetPlaylistsByUser(userID primitive.ObjectID) ([]*models.PlaylistResponse, error) {
	// 首先检查用户是否存在
	var user models.User
	err := s.userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	cursor, err := s.playlistCollection.Find(context.Background(), bson.M{"ownerId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var playlists []models.Playlist
	if err = cursor.All(context.Background(), &playlists); err != nil {
		return nil, err
	}

	responses := make([]*models.PlaylistResponse, len(playlists))
	for i, playlist := range playlists {
		responses[i] = playlist.ToResponse(user.Username)
	}

	return responses, nil
}

func (s *PlaylistService) GetPublicPlaylists() ([]*models.PlaylistResponse, error) {
	cursor, err := s.playlistCollection.Find(context.Background(), bson.M{"isPublic": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var playlists []models.Playlist
	if err = cursor.All(context.Background(), &playlists); err != nil {
		return nil, err
	}

	// 获取所有用户名
	userIDs := make([]primitive.ObjectID, len(playlists))
	for i, playlist := range playlists {
		userIDs[i] = playlist.OwnerID
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

	responses := make([]*models.PlaylistResponse, len(playlists))
	for i, playlist := range playlists {
		responses[i] = playlist.ToResponse(userMap[playlist.OwnerID])
	}

	return responses, nil
}

func (s *PlaylistService) AddSongToPlaylist(playlistID, userID primitive.ObjectID, songID primitive.ObjectID) error {
	// 验证播放列表所有权
	var playlist models.Playlist
	err := s.playlistCollection.FindOne(context.Background(), bson.M{"_id": playlistID}).Decode(&playlist)
	if err != nil {
		return err
	}

	if playlist.OwnerID != userID {
		return errors.New("unauthorized: you can only modify your own playlists")
	}

	// 验证歌曲存在
	var song models.Song
	err = s.songCollection.FindOne(context.Background(), bson.M{"_id": songID}).Decode(&song)
	if err != nil {
		return errors.New("song not found")
	}

	// 检查歌曲是否已在播放列表中
	for _, id := range playlist.Songs {
		if id == songID {
			return errors.New("song already in playlist")
		}
	}

	// 添加歌曲到播放列表
	_, err = s.playlistCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": playlistID},
		bson.M{
			"$push": bson.M{"songs": songID},
			"$set":  bson.M{"updatedAt": time.Now()},
		},
	)

	return err
}

func (s *PlaylistService) UpdatePlaylist(playlistID, userID primitive.ObjectID, req *models.UpdatePlaylistRequest) (*models.PlaylistResponse, error) {
	// 验证播放列表所有权
	var playlist models.Playlist
	err := s.playlistCollection.FindOne(context.Background(), bson.M{"_id": playlistID}).Decode(&playlist)
	if err != nil {
		return nil, err
	}

	if playlist.OwnerID != userID {
		return nil, errors.New("unauthorized: you can only update your own playlists")
	}

	// 构建更新字段
	updateFields := bson.M{
		"updatedAt": time.Now(),
	}

	if req.Name != "" {
		updateFields["name"] = req.Name
	}
	if req.Description != "" {
		updateFields["description"] = req.Description
	}
	if req.IsPublic != nil {
		updateFields["isPublic"] = *req.IsPublic
	}
	if req.Tags != nil {
		updateFields["tags"] = req.Tags
	}

	// 更新播放列表
	_, err = s.playlistCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": playlistID},
		bson.M{"$set": updateFields},
	)
	if err != nil {
		return nil, err
	}

	// 获取更新后的播放列表
	err = s.playlistCollection.FindOne(context.Background(), bson.M{"_id": playlistID}).Decode(&playlist)
	if err != nil {
		return nil, err
	}

	// 获取所有者用户名
	var user models.User
	err = s.userCollection.FindOne(context.Background(), bson.M{"_id": playlist.OwnerID}).Decode(&user)
	if err != nil {
		return nil, err
	}

	// 使用ToResponse方法来构建响应
	return playlist.ToResponse(user.Username), nil
}

func (s *PlaylistService) RemoveSongFromPlaylist(playlistID, userID primitive.ObjectID, songID primitive.ObjectID) error {
	// 验证播放列表所有权
	var playlist models.Playlist
	err := s.playlistCollection.FindOne(context.Background(), bson.M{"_id": playlistID}).Decode(&playlist)
	if err != nil {
		return err
	}

	if playlist.OwnerID != userID {
		return errors.New("unauthorized: you can only modify your own playlists")
	}

	// 从播放列表中移除歌曲
	_, err = s.playlistCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": playlistID},
		bson.M{
			"$pull": bson.M{"songs": songID},
			"$set":  bson.M{"updatedAt": time.Now()},
		},
	)

	return err
}

func (s *PlaylistService) DeletePlaylist(playlistID, userID primitive.ObjectID) error {
	// 验证播放列表所有权
	var playlist models.Playlist
	err := s.playlistCollection.FindOne(context.Background(), bson.M{"_id": playlistID}).Decode(&playlist)
	if err != nil {
		return err
	}

	if playlist.OwnerID != userID {
		return errors.New("unauthorized: you can only delete your own playlists")
	}

	// 删除播放列表
	_, err = s.playlistCollection.DeleteOne(context.Background(), bson.M{"_id": playlistID})
	if err != nil {
		return err
	}

	// 从用户的播放列表中移除
	_, err = s.userCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": userID},
		bson.M{"$pull": bson.M{"playlists": playlistID}},
	)

	return err
}