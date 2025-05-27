package com.music.newnewmusic.controller;

import com.music.newnewmusic.model.Song;
import com.music.newnewmusic.model.User;
import com.music.newnewmusic.service.FavoriteSongService;
import com.music.newnewmusic.service.SongService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.music.newnewmusic.security.services.UserDetailsImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private static final Logger logger = LoggerFactory.getLogger(SongController.class);

    private final SongService songService;
    private final FavoriteSongService favoriteSongService;

    @Autowired
    public SongController(SongService songService, FavoriteSongService favoriteSongService) {
        this.songService = songService;
        this.favoriteSongService = favoriteSongService;
    }

    @GetMapping
    public List<Song> getAllSongs() {
        logger.info("Fetching all songs");
        return songService.getAllSongs();
    }

    @PostMapping("/{songId}/favorite")
    public ResponseEntity<?> addFavorite(@PathVariable String songId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            logger.warn("User details not found in security context while adding favorite song {}", songId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "用户未认证"));
        }
        String userId = userDetails.getUsername();
        logger.info("User {} attempting to add song {} to favorites", userId, songId);
        try {
            User updatedUser = favoriteSongService.addFavoriteSong(userId, songId);
            return ResponseEntity.ok(Map.of("message", "歌曲收藏成功", "favoriteSongIds", updatedUser.getFavoriteSongIds()));
        } catch (IllegalStateException e) {
            logger.warn("Failed to add favorite song for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to add favorite song due to invalid argument for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error adding favorite song {} for user {}:", songId, userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "收藏歌曲时出错"));
        }
    }

    @DeleteMapping("/{songId}/favorite")
    public ResponseEntity<?> removeFavorite(@PathVariable String songId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            logger.warn("User details not found in security context while removing favorite song {}", songId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "用户未认证"));
        }
        String userId = userDetails.getUsername();
        logger.info("User {} attempting to remove song {} from favorites", userId, songId);
        try {
            favoriteSongService.removeFavoriteSong(userId, songId);
            return ResponseEntity.ok(Map.of("message", "歌曲取消收藏成功"));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to remove favorite song due to invalid argument for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
         catch (Exception e) {
            logger.error("Error removing favorite song {} for user {}:", songId, userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "取消收藏歌曲时出错"));
        }
    }

    @GetMapping("/favorites/user")
    public ResponseEntity<?> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            logger.warn("User details not found in security context while fetching favorites");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "用户未认证"));
        }
        String userId = userDetails.getUsername();
        logger.info("Fetching favorite songs for user {}", userId);
        try {
            List<Song> favoriteSongs = favoriteSongService.getFavoriteSongsByUserId(userId);
            return ResponseEntity.ok(favoriteSongs);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to get favorite songs due to invalid argument for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching favorite songs for user {}:", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "获取收藏列表时出错"));
        }
    }

    @GetMapping("/{songId}/isFavorite")
    public ResponseEntity<Map<String, Boolean>> isFavorite(@PathVariable String songId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            logger.warn("User details not found in security context while checking favorite status for song {}: 用户未认证", songId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("isFavorite", false));
        }
        String userId = userDetails.getUsername();
        try {
            boolean isFavorited = favoriteSongService.isSongFavorited(userId, songId);
            return ResponseEntity.ok(Map.of("isFavorite", isFavorited));
        } catch (Exception e) {
            logger.error("Error checking favorite status for song {} for user {}: 检查收藏状态时出错", songId, userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("isFavorite", false));
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Song>> getRecommendedSongs(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            logger.warn("User not authenticated for recommendations");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            List<Song> recommendedSongs = songService.getRecommendedSongs(userDetails.getUsername());
            return ResponseEntity.ok(recommendedSongs);
        } catch (Exception e) {
            logger.error("Error getting recommended songs for user {}: ", userDetails.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}