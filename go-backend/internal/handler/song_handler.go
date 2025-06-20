package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"newnewmusic/internal/models"
	"newnewmusic/internal/service"

	"github.com/gin-gonic/gin"
)

type SongHandler struct {
	songService *service.SongService
	uploadPath  string
}

func NewSongHandler(songService *service.SongService, uploadPath string) *SongHandler {
	return &SongHandler{
		songService: songService,
		uploadPath:  uploadPath,
	}
}

func (h *SongHandler) GetAllSongs(c *gin.Context) {
	songs, err := h.songService.GetAllSongs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, songs)
}

func (h *SongHandler) GetSongByID(c *gin.Context) {
	id := c.Param("id")
	song, err := h.songService.GetSongByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
		return
	}

	c.JSON(http.StatusOK, song.ToResponse())
}

func (h *SongHandler) CreateSong(c *gin.Context) {
	var song models.Song
	if err := c.ShouldBindJSON(&song); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.songService.CreateSong(&song)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, song.ToResponse())
}

func (h *SongHandler) UploadSong(c *gin.Context) {
	// Parse multipart form
	err := c.Request.ParseMultipartForm(50 << 20) // 50MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	// Get the file from form
	file, header, err := c.Request.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Audio file is required"})
		return
	}
	defer file.Close()

	// Validate file type
	if !isValidAudioFile(header.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid audio file format. Only MP3, WAV, FLAC are allowed"})
		return
	}

	// Create unique filename
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), header.Filename)
	filePath := filepath.Join(h.uploadPath, filename)

	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(h.uploadPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Save file to disk
	out, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Get form data
	title := c.Request.FormValue("title")
	artist := c.Request.FormValue("artist")
	album := c.Request.FormValue("album")
	genre := c.Request.FormValue("genre")
	durationStr := c.Request.FormValue("duration")

	if title == "" || artist == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title and artist are required"})
		return
	}

	// Parse duration
	var duration int
	if durationStr != "" {
		duration, _ = strconv.Atoi(durationStr)
	}

	// Parse multiple artists (comma-separated)
	var artists []string
	if strings.Contains(artist, ",") {
		// Split by comma and trim spaces
		artistList := strings.Split(artist, ",")
		for _, a := range artistList {
			trimmed := strings.TrimSpace(a)
			if trimmed != "" {
				artists = append(artists, trimmed)
			}
		}
	} else {
		artists = []string{strings.TrimSpace(artist)}
	}

	// Create song object
	song := models.Song{
		Title:    title,
		Artist:   artists,
		Album:    album,
		Genre:    genre,
		Duration: duration,
		FilePath: filename,
	}

	// Save to database
	err = h.songService.CreateSong(&song)
	if err != nil {
		// Delete uploaded file if database save fails
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Song uploaded successfully",
		"song":    song.ToResponse(),
	})
}

func isValidAudioFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return ext == ".mp3" || ext == ".wav" || ext == ".flac" || ext == ".m4a"
}

func (h *SongHandler) UpdateSong(c *gin.Context) {
	id := c.Param("id")
	var song models.Song
	if err := c.ShouldBindJSON(&song); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.songService.UpdateSong(id, &song)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Song updated successfully"})
}

func (h *SongHandler) DeleteSong(c *gin.Context) {
	id := c.Param("id")
	err := h.songService.DeleteSong(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Song deleted successfully"})
}

func (h *SongHandler) SearchSongs(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	songs, err := h.songService.SearchSongs(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, songs)
}

func (h *SongHandler) GetSongsByGenre(c *gin.Context) {
	genre := c.Param("genre")
	songs, err := h.songService.GetSongsByGenre(genre)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, songs)
}

func (h *SongHandler) GetFavoriteSongs(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	songs, err := h.songService.GetFavoriteSongs(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, songs)
}

func (h *SongHandler) IsSongFavorited(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	songID := c.Param("id")
	if songID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Song ID is required"})
		return
	}

	isFavorited, err := h.songService.IsSongFavorited(userID.(string), songID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isFavorited": isFavorited})
}

func (h *SongHandler) GetRecommendedSongs(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get user's favorite songs to understand preferences
	favoriteSongs, err := h.songService.GetFavoriteSongs(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get all songs
	allSongs, err := h.songService.GetAllSongs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Advanced recommendation algorithm with fuzzy matching
	recommendedSongs := h.getSmartRecommendations(favoriteSongs, allSongs)

	c.JSON(http.StatusOK, recommendedSongs)
}

// getSmartRecommendations implements an advanced recommendation algorithm
func (h *SongHandler) getSmartRecommendations(favoriteSongs, allSongs []*models.SongResponse) []*models.SongResponse {
	type SongScore struct {
		Song  *models.SongResponse
		Score float64
	}

	// If no favorites, recommend diverse popular songs
	if len(favoriteSongs) == 0 {
		return h.getDefaultRecommendations(allSongs)
	}

	// Create favorite song lookup for exclusion
	favoriteIDs := make(map[string]bool)
	for _, song := range favoriteSongs {
		favoriteIDs[song.ID] = true
	}

	// Extract user preferences
	favoriteGenres := make(map[string]int)
	favoriteArtists := make(map[string]int)
	favoriteAlbums := make(map[string]int)

	for _, song := range favoriteSongs {
		if song.Genre != "" {
			favoriteGenres[song.Genre]++
		}
		for _, artist := range song.Artist {
			if artist != "" {
				favoriteArtists[artist]++
			}
		}
		if song.Album != "" {
			favoriteAlbums[song.Album]++
		}
	}

	// Score all non-favorite songs
	var scoredSongs []SongScore
	for _, song := range allSongs {
		// Skip if already in favorites
		if favoriteIDs[song.ID] {
			continue
		}

		score := h.calculateSongScore(song, favoriteGenres, favoriteArtists, favoriteAlbums)
		if score > 0 {
			scoredSongs = append(scoredSongs, SongScore{Song: song, Score: score})
		}
	}

	// Sort by score (descending)
	for i := 0; i < len(scoredSongs)-1; i++ {
		for j := i + 1; j < len(scoredSongs); j++ {
			if scoredSongs[i].Score < scoredSongs[j].Score {
				scoredSongs[i], scoredSongs[j] = scoredSongs[j], scoredSongs[i]
			}
		}
	}

	// Return top recommendations
	recommendedSongs := []*models.SongResponse{}
	maxRecommendations := 15
	for i, scoredSong := range scoredSongs {
		if i >= maxRecommendations {
			break
		}
		recommendedSongs = append(recommendedSongs, scoredSong.Song)
	}

	// If we don't have enough recommendations, add some diverse songs
	if len(recommendedSongs) < 10 {
		defaultRecs := h.getDefaultRecommendations(allSongs)
		for _, song := range defaultRecs {
			if !favoriteIDs[song.ID] && !h.containsSong(recommendedSongs, song.ID) {
				recommendedSongs = append(recommendedSongs, song)
				if len(recommendedSongs) >= 10 {
					break
				}
			}
		}
	}

	return recommendedSongs
}

// calculateSongScore calculates a recommendation score for a song based on user preferences
func (h *SongHandler) calculateSongScore(song *models.SongResponse, favoriteGenres, favoriteArtists, favoriteAlbums map[string]int) float64 {
	var score float64

	// Genre matching (weight: 3.0)
	if genreCount, exists := favoriteGenres[song.Genre]; exists {
		score += float64(genreCount) * 3.0
	}

	// Artist matching (weight: 4.0)
	for _, artist := range song.Artist {
		if artistCount, exists := favoriteArtists[artist]; exists {
			score += float64(artistCount) * 4.0
		}
	}

	// Album matching (weight: 2.0)
	if albumCount, exists := favoriteAlbums[song.Album]; exists && song.Album != "" {
		score += float64(albumCount) * 2.0
	}

	// Artist similarity bonus (weight: 1.5)
	for _, songArtist := range song.Artist {
		for favoriteArtist := range favoriteArtists {
			if h.isArtistSimilar(songArtist, favoriteArtist) {
				score += 1.5
			}
		}
	}

	// Genre similarity bonus (weight: 1.0)
	for favoriteGenre := range favoriteGenres {
		if h.isGenreSimilar(song.Genre, favoriteGenre) {
			score += 1.0
		}
	}

	return score
}

// isArtistSimilar checks if two artists are similar (fuzzy matching)
func (h *SongHandler) isArtistSimilar(artist1, artist2 string) bool {
	if artist1 == artist2 {
		return false // Exact match is handled separately
	}

	// Convert to lowercase for comparison
	a1 := strings.ToLower(artist1)
	a2 := strings.ToLower(artist2)

	// Check if one artist name contains the other
	if strings.Contains(a1, a2) || strings.Contains(a2, a1) {
		return true
	}

	// Check for common words (for bands/groups)
	words1 := strings.Fields(a1)
	words2 := strings.Fields(a2)
	commonWords := 0
	for _, w1 := range words1 {
		for _, w2 := range words2 {
			if w1 == w2 && len(w1) > 2 { // Ignore short words
				commonWords++
			}
		}
	}

	return commonWords > 0
}

// isGenreSimilar checks if two genres are similar
func (h *SongHandler) isGenreSimilar(genre1, genre2 string) bool {
	if genre1 == genre2 {
		return false // Exact match is handled separately
	}

	// Define genre similarity groups
	genreGroups := map[string][]string{
		"rock":       {"rock", "alternative", "indie", "punk", "metal"},
		"pop":        {"pop", "dance", "disco", "electronic"},
		"hip-hop":    {"hip hop", "rap", "r&b", "soul", "funk"},
		"classical":  {"classical", "jazz", "blues", "folk"},
		"electronic": {"electronic", "house", "techno", "ambient", "dance"},
		"country":    {"country", "folk", "bluegrass"},
	}

	g1 := strings.ToLower(genre1)
	g2 := strings.ToLower(genre2)

	// Check if genres belong to the same group
	for _, group := range genreGroups {
		g1InGroup := false
		g2InGroup := false
		for _, g := range group {
			if strings.Contains(g1, g) || strings.Contains(g, g1) {
				g1InGroup = true
			}
			if strings.Contains(g2, g) || strings.Contains(g, g2) {
				g2InGroup = true
			}
		}
		if g1InGroup && g2InGroup {
			return true
		}
	}

	return false
}

// getDefaultRecommendations returns diverse recommendations for new users
func (h *SongHandler) getDefaultRecommendations(allSongs []*models.SongResponse) []*models.SongResponse {
	recommendedSongs := []*models.SongResponse{}
	genreCount := make(map[string]int)
	maxPerGenre := 2

	// Try to get diverse genres
	for _, song := range allSongs {
		if song.Genre != "" && genreCount[song.Genre] < maxPerGenre {
			recommendedSongs = append(recommendedSongs, song)
			genreCount[song.Genre]++
			if len(recommendedSongs) >= 10 {
				break
			}
		}
	}

	// Fill remaining slots with any songs
	for _, song := range allSongs {
		if !h.containsSong(recommendedSongs, song.ID) {
			recommendedSongs = append(recommendedSongs, song)
			if len(recommendedSongs) >= 10 {
				break
			}
		}
	}

	return recommendedSongs
}

// containsSong checks if a song is already in the recommendations
func (h *SongHandler) containsSong(songs []*models.SongResponse, songID string) bool {
	for _, song := range songs {
		if song.ID == songID {
			return true
		}
	}
	return false
}

func (h *SongHandler) StreamSong(c *gin.Context) {
	id := c.Param("id")
	song, err := h.songService.GetSongByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Song not found"})
		return
	}

	filePath := filepath.Join(h.uploadPath, song.FilePath)
	file, err := os.Open(filePath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Audio file not found"})
		return
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get file info"})
		return
	}

	fileSize := fileInfo.Size()
	rangeHeader := c.GetHeader("Range")

	if rangeHeader != "" {
		// Handle range requests for audio streaming
		var start, end int64
		n, err := strconv.ParseInt(rangeHeader[6:], 10, 64) // Remove "bytes="
		if err == nil {
			start = n
			end = fileSize - 1
		} else {
			start = 0
			end = fileSize - 1
		}

		c.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, fileSize))
		c.Header("Accept-Ranges", "bytes")
		c.Header("Content-Length", strconv.FormatInt(end-start+1, 10))
		c.Header("Content-Type", "audio/mpeg")
		c.Status(http.StatusPartialContent)

		file.Seek(start, 0)
		io.CopyN(c.Writer, file, end-start+1)
	} else {
		c.Header("Content-Length", strconv.FormatInt(fileSize, 10))
		c.Header("Content-Type", "audio/mpeg")
		c.Header("Accept-Ranges", "bytes")
		c.Status(http.StatusOK)
		io.Copy(c.Writer, file)
	}
}
