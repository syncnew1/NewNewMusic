package com.music.newnewmusic.repository;

import com.music.newnewmusic.model.UserFavoriteSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFavoriteSongRepository extends JpaRepository<UserFavoriteSong, Long> {
    List<UserFavoriteSong> findByUserId(Long userId);
    boolean existsByUserIdAndSongId(Long userId, String songId);
    void deleteByUserIdAndSongId(Long userId, String songId);
}