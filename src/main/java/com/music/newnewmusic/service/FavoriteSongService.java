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

    private final UserRepository userRepository;
    private final SongService songService;

    @Autowired
    public FavoriteSongService(UserRepository userRepository, SongService songService) { 
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
            return updatedUser;
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
                    return new IllegalArgumentException("无效的用户ID: " + userId);
                });

        if (!user.getFavoriteSongIds().contains(songId)) {
            logger.warn("Song {} not in favorites for user {}. Cannot remove.", songId, userId);
            return; 
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
            return List.of(); 
        }
        return favoriteSongIds.stream()
                .map(songId -> songService.getSongById(songId).orElse(null)) 
                .filter(song -> song != null)
                .collect(Collectors.toList());
    }

    public boolean isSongFavorited(String userId, String songId) {
        logger.debug("Checking if song {} is favorited by user {}", songId, userId);
        User user = userRepository.findByUsername(userId)
                .orElse(null); 
        if (user == null) {
            return false;
        }
        return user.getFavoriteSongIds().contains(songId);
    }
}