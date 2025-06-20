package router

import (
	"newnewmusic/internal/config"
	"newnewmusic/internal/handler"
	"newnewmusic/internal/middleware"
	"newnewmusic/internal/service"
	"newnewmusic/internal/utils"

	"github.com/gin-gonic/gin"
)

func SetupRouter(services *service.Services, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Create JWT manager for middleware
	jwtManager := utils.NewJWTManager(cfg.JWT.Secret, cfg.JWT.Expiration)

	// Apply CORS middleware
	r.Use(middleware.CORSMiddleware(cfg))

	// Create handlers
	userHandler := handler.NewUserHandler(services.User)
	songHandler := handler.NewSongHandler(services.Song, cfg.File.UploadPath)
<<<<<<< HEAD
	playlistHandler := handler.NewPlaylistHandler(services.Playlist)
	commentHandler := handler.NewCommentHandler(services.Comment)
	followHandler := handler.NewFollowHandler(services.Follow)
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (no authentication required)
		auth := api.Group("/auth")
		{
			auth.POST("/register", userHandler.Register)
			auth.POST("/login", userHandler.Login)
		}

		// User routes (authentication required)
		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware(jwtManager))
		{
			user.GET("/profile", userHandler.GetProfile)
		}

		// Song routes
		songs := api.Group("/songs")
		{
			// Public routes
			songs.GET("", songHandler.GetAllSongs)
			songs.GET("/:id", songHandler.GetSongByID)
			songs.GET("/search", songHandler.SearchSongs)
			songs.GET("/genre/:genre", songHandler.GetSongsByGenre)
			songs.GET("/stream/:id", songHandler.StreamSong)

			// Protected routes (authentication required)
			protected := songs.Group("")
			protected.Use(middleware.AuthMiddleware(jwtManager))
			{
				protected.POST("", songHandler.CreateSong)
				protected.POST("/upload", songHandler.UploadSong)
				protected.PUT("/:id", songHandler.UpdateSong)
				protected.DELETE("/:id", songHandler.DeleteSong)
				protected.GET("/favorites", songHandler.GetFavoriteSongs)
				protected.POST("/:id/favorite", userHandler.AddFavoriteSong)
				protected.DELETE("/:id/favorite", userHandler.RemoveFavoriteSong)
				protected.GET("/favorites/user", songHandler.GetFavoriteSongs)
				protected.GET("/:id/isFavorite", songHandler.IsSongFavorited)
				protected.GET("/recommendations", songHandler.GetRecommendedSongs)
			}
		}
<<<<<<< HEAD

		// Playlist routes
		playlists := api.Group("/playlists")
		{
			// Public routes
			playlists.GET("/public", playlistHandler.GetPublicPlaylists)
			playlists.GET("/:id", playlistHandler.GetPlaylistByID)
			playlists.GET("/:id/songs", playlistHandler.GetPlaylistSongs)

			// Protected routes (authentication required)
			protected := playlists.Group("")
			protected.Use(middleware.AuthMiddleware(jwtManager))
			{
				protected.POST("", playlistHandler.CreatePlaylist)
			protected.GET("/my", playlistHandler.GetUserPlaylists)
			protected.POST("/:id/songs", playlistHandler.AddSongToPlaylist)
			protected.DELETE("/:id/songs/:songId", playlistHandler.RemoveSongFromPlaylist)
			protected.PUT("/:id", playlistHandler.UpdatePlaylist)
			protected.DELETE("/:id", playlistHandler.DeletePlaylist)
			}
		}

		// Comment routes
		comments := api.Group("/comments")
		{
			// Public routes
			comments.GET("/song/:songId", commentHandler.GetCommentsBySong)
			comments.GET("/song/:songId/rating", commentHandler.GetSongRating)

			// Protected routes (authentication required)
			protected := comments.Group("")
			protected.Use(middleware.AuthMiddleware(jwtManager))
			{
				protected.POST("", commentHandler.CreateComment)
				protected.PUT("/:id", commentHandler.UpdateComment)
				protected.DELETE("/:id", commentHandler.DeleteComment)
			}
		}

		// Follow routes
		follow := api.Group("/follow")
		follow.Use(middleware.AuthMiddleware(jwtManager))
		{
			follow.POST("/user/:userId", followHandler.FollowUser)
			follow.DELETE("/user/:userId", followHandler.UnfollowUser)
			follow.GET("/user/:userId/status", followHandler.CheckFollowStatus)
			follow.GET("/my/following", followHandler.GetMyFollowing)
			follow.GET("/my/followers", followHandler.GetMyFollowers)
		}

		// User profile routes
		users := api.Group("/users")
		{
			users.GET("/:userId/following", followHandler.GetFollowing)
			users.GET("/:userId/followers", followHandler.GetFollowers)
			users.GET("/:userId/stats", followHandler.GetFollowStats)
		}
=======
>>>>>>> eabcece (refactor: 迁移Java后端至Go语言实现)
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return r
}
