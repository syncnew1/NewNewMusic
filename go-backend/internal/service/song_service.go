package service

import (
	"context"
	"time"

	"newnewmusic/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SongService struct {
	collection *mongo.Collection
}

func NewSongService(db *mongo.Database) *SongService {
	return &SongService{
		collection: db.Collection("songs"),
	}
}

func (s *SongService) GetAllSongs() ([]*models.SongResponse, error) {
	cursor, err := s.collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var songs []*models.SongResponse
	for cursor.Next(context.Background()) {
		var song models.Song
		if err := cursor.Decode(&song); err != nil {
			continue
		}
		songs = append(songs, song.ToResponse())
	}

	return songs, nil
}

func (s *SongService) GetSongByID(id string) (*models.Song, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var song models.Song
	err = s.collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&song)
	if err != nil {
		return nil, err
	}

	return &song, nil
}

func (s *SongService) CreateSong(song *models.Song) error {
	song.ID = primitive.NewObjectID()
	song.CreatedAt = time.Now()
	song.UpdatedAt = time.Now()

	_, err := s.collection.InsertOne(context.Background(), song)
	return err
}

func (s *SongService) UpdateSong(id string, song *models.Song) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	song.UpdatedAt = time.Now()
	update := bson.M{
		"$set": bson.M{
			"title":       song.Title,
			"artist":      song.Artist,
			"album":       song.Album,
			"genre":       song.Genre,
			"duration":    song.Duration,
			"coverImage":  song.CoverImage,
			"releaseDate": song.ReleaseDate,
			"updatedAt":   song.UpdatedAt,
		},
	}

	_, err = s.collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	return err
}

func (s *SongService) DeleteSong(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = s.collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

func (s *SongService) SearchSongs(query string) ([]*models.SongResponse, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"title": bson.M{"$regex": query, "$options": "i"}},
			{"artist": bson.M{"$regex": query, "$options": "i"}},
			{"album": bson.M{"$regex": query, "$options": "i"}},
			{"genre": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	cursor, err := s.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var songs []*models.SongResponse
	for cursor.Next(context.Background()) {
		var song models.Song
		if err := cursor.Decode(&song); err != nil {
			continue
		}
		songs = append(songs, song.ToResponse())
	}

	return songs, nil
}

func (s *SongService) GetSongsByGenre(genre string) ([]*models.SongResponse, error) {
	filter := bson.M{"genre": bson.M{"$regex": genre, "$options": "i"}}
	opts := options.Find().SetLimit(10)

	cursor, err := s.collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var songs []*models.SongResponse
	for cursor.Next(context.Background()) {
		var song models.Song
		if err := cursor.Decode(&song); err != nil {
			continue
		}
		songs = append(songs, song.ToResponse())
	}

	return songs, nil
}

func (s *SongService) GetFavoriteSongs(userID string) ([]*models.SongResponse, error) {
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	// Get user's favorite song IDs
	var user models.User
	err = s.collection.Database().Collection("users").FindOne(
		context.Background(),
		bson.M{"_id": userObjID},
	).Decode(&user)
	if err != nil {
		return nil, err
	}

	if len(user.FavoriteSongs) == 0 {
		return []*models.SongResponse{}, nil
	}

	// Get songs by IDs
	filter := bson.M{"_id": bson.M{"$in": user.FavoriteSongs}}
	cursor, err := s.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var songs []*models.SongResponse
	for cursor.Next(context.Background()) {
		var song models.Song
		if err := cursor.Decode(&song); err != nil {
			continue
		}
		songs = append(songs, song.ToResponse())
	}

	return songs, nil
}

func (s *SongService) IsSongFavorited(userID, songID string) (bool, error) {
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return false, err
	}

	songObjID, err := primitive.ObjectIDFromHex(songID)
	if err != nil {
		return false, err
	}

	// Check if song is in user's favorites
	var user models.User
	err = s.collection.Database().Collection("users").FindOne(
		context.Background(),
		bson.M{"_id": userObjID},
	).Decode(&user)
	if err != nil {
		return false, err
	}

	// Check if songID is in favorites
	for _, favSongID := range user.FavoriteSongs {
		if favSongID == songObjID {
			return true, nil
		}
	}

	return false, nil
}
