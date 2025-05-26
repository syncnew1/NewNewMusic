package com.music.newnewmusic.service;

import com.music.newnewmusic.model.Song;
import com.music.newnewmusic.model.User;
import com.music.newnewmusic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FavoriteSongService {

    private static final Logger logger = LoggerFactory.getLogger(FavoriteSongService.class);

    // private final UserFavoriteSongRepository userFavoriteSongRepository; // No longer needed
    private final UserRepository userRepository; // Added UserRepository
    private final SongService songService;

    @Autowired
    public FavoriteSongService(UserRepository userRepository, SongService songService) { // Injected UserRepository
        this.userRepository = userRepository;
        this.songService = songService;
    }

    @Transactional
    public User addFavoriteSong(String userId, String songId) {
        logger.info("Attempting to add favorite song: userId={}, songId={}", userId, songId);
        User user = userRepository.findByUsername(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", userId);
                    return new IllegalArgumentException("无效的用户ID: " + userId);
                });

        // Ensure song exists before adding to favorites
        songService.getSongById(songId)
                .orElseThrow(() -> {
                    logger.error("Song not found with id: {}", songId);
                    return new IllegalArgumentException("无效的歌曲ID: " + songId);
                });

        if (user.getFavoriteSongIds().contains(songId)) {
            logger.warn("Song {} already favorited by user {}", songId, userId);
            throw new IllegalStateException("歌曲已被收藏");
        }

        user.getFavoriteSongIds().add(songId);
        try {
            User updatedUser = userRepository.save(user);
            logger.info("Successfully added song {} to favorites for user {}", songId, userId);
            return updatedUser; // Return the updated user or void/boolean based on preference
        } catch (Exception e) {
            logger.error("Error saving user {} after adding favorite song {}:", userId, songId, e);
            throw e; 
        }
    }

    @Transactional
    public void removeFavoriteSong(String userId, String songId) {
        logger.info("Attempting to remove favorite song: userId={}, songId={}", userId, songId);
        User user = userRepository.findByUsername(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", userId);
                    // Or simply return if user not found, depending on desired behavior
                    return new IllegalArgumentException("无效的用户ID: " + userId);
                });

        if (!user.getFavoriteSongIds().contains(songId)) {
            logger.warn("Song {} not in favorites for user {}. Cannot remove.", songId, userId);
            // Optionally throw an exception or just log and return
            return; // Or throw new IllegalStateException("歌曲未被收藏");
        }

        user.getFavoriteSongIds().remove(songId);
        try {
            userRepository.save(user);
            logger.info("Successfully removed song {} from favorites for user {}", songId, userId);
        } catch (Exception e) {
            logger.error("Error saving user {} after removing favorite song {}:", userId, songId, e);
            throw e;
        }
    }

    public List<Song> getFavoriteSongsByUserId(String userId) {
        logger.debug("Fetching favorite songs for userId={}", userId);
        User user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new IllegalArgumentException("无效的用户ID: " + userId));
        
        Set<String> favoriteSongIds = user.getFavoriteSongIds();
        if (favoriteSongIds.isEmpty()) {
            return List.of(); // Return empty list if no favorites
        }
        // Fetch song details for each favorite song ID
        return favoriteSongIds.stream()
                .map(songId -> songService.getSongById(songId).orElse(null)) // Handle case where a song might have been deleted
                .filter(song -> song != null) // Filter out nulls if a song was deleted
                .collect(Collectors.toList());
    }

    public boolean isSongFavorited(String userId, String songId) {
        logger.debug("Checking if song {} is favorited by user {}", songId, userId);
        User user = userRepository.findByUsername(userId)
                .orElse(null); // Return false if user not found
        if (user == null) {
            return false;
        }
        return user.getFavoriteSongIds().contains(songId);
    }
}