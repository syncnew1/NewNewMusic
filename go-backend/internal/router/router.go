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
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return r
}
