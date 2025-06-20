package main

import (
	"fmt"
	"log"
	"newnewmusic/internal/config"
	"newnewmusic/internal/database"
	"newnewmusic/internal/router"
	"newnewmusic/internal/service"
	"newnewmusic/internal/utils"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize database
	db, err := database.Connect(cfg.Database.URI, cfg.Database.Name)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Disconnect()

	// Initialize JWT manager
	jwtManager := utils.NewJWTManager(cfg.JWT.Secret, cfg.JWT.Expiration)

	// Initialize services
	services := service.NewServices(db, jwtManager)

	// Setup router
	r := router.SetupRouter(services, cfg)

	// Start server
	log.Printf("Server starting on %s:%d", cfg.Server.Host, cfg.Server.Port)
	if err := r.Run(fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
