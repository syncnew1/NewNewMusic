package com.music.newnewmusic.service;

import com.music.newnewmusic.model.UserFavoriteSong;
import com.music.newnewmusic.repository.UserFavoriteSongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteSongService {

    private final UserFavoriteSongRepository userFavoriteSongRepository;

    @Autowired
    public FavoriteSongService(UserFavoriteSongRepository userFavoriteSongRepository) {
        this.userFavoriteSongRepository = userFavoriteSongRepository;
    }

    @Transactional
    public UserFavoriteSong addFavoriteSong(Long userId, String songId) {
        if (userFavoriteSongRepository.existsByUserIdAndSongId(userId, songId)) {
            throw new IllegalStateException("歌曲已被收藏");
        }
        UserFavoriteSong favoriteSong = new UserFavoriteSong(userId, songId);
        return userFavoriteSongRepository.save(favoriteSong);
    }

    @Transactional
    public void removeFavoriteSong(Long userId, String songId) {
        userFavoriteSongRepository.deleteByUserIdAndSongId(userId, songId);
    }

    public List<UserFavoriteSong> getFavoriteSongsByUserId(Long userId) {
        return userFavoriteSongRepository.findByUserId(userId);
    }

    public boolean isSongFavorited(Long userId, String songId) {
        return userFavoriteSongRepository.existsByUserIdAndSongId(userId, songId);
    }
}