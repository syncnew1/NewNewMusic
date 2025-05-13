package com.music.newnewmusic.service;

import com.music.newnewmusic.model.UserFavoriteSong;
import com.music.newnewmusic.repository.UserFavoriteSongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FavoriteSongService {

    private static final Logger logger = LoggerFactory.getLogger(FavoriteSongService.class); // Added logger

    private final UserFavoriteSongRepository userFavoriteSongRepository;

    @Autowired
    public FavoriteSongService(UserFavoriteSongRepository userFavoriteSongRepository) {
        this.userFavoriteSongRepository = userFavoriteSongRepository;
    }

    @Transactional
    public UserFavoriteSong addFavoriteSong(Long userId, String songId) {
        logger.info("Attempting to add favorite song: userId={}, songId={}", userId, songId);
        if (userFavoriteSongRepository.existsByUserIdAndSongId(userId, songId)) {
            logger.warn("Song {} already favorited by user {}", songId, userId);
            throw new IllegalStateException("歌曲已被收藏");
        }
        UserFavoriteSong favoriteSong = new UserFavoriteSong(userId, songId);
        try {
            UserFavoriteSong savedFavoriteSong = userFavoriteSongRepository.save(favoriteSong);
            logger.info("Successfully saved favorite song: userId={}, songId={}, favoriteId={}", userId, songId, savedFavoriteSong.getId());
            return savedFavoriteSong;
        } catch (Exception e) {
            logger.error("Error saving favorite song for userId {} and songId {}:", userId, songId, e);
            throw e; // Re-throw the exception to be handled by the controller
        }
    }

    @Transactional
    public void removeFavoriteSong(Long userId, String songId) {
        logger.info("Attempting to remove favorite song: userId={}, songId={}", userId, songId);
        try {
            userFavoriteSongRepository.deleteByUserIdAndSongId(userId, songId);
            logger.info("Successfully removed favorite song: userId={}, songId={}", userId, songId);
        } catch (Exception e) {
            logger.error("Error removing favorite song for userId {} and songId {}:", userId, songId, e);
            throw e;
        }
    }

    public List<UserFavoriteSong> getFavoriteSongsByUserId(Long userId) {
        logger.debug("Fetching favorite songs for userId={}", userId);
        return userFavoriteSongRepository.findByUserId(userId);
    }

    public boolean isSongFavorited(Long userId, String songId) {
        logger.debug("Checking if song {} is favorited by user {}", songId, userId);
        return userFavoriteSongRepository.existsByUserIdAndSongId(userId, songId);
    }
}