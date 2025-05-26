package com.music.newnewmusic.repository;

import com.music.newnewmusic.model.UserFavoriteSong;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFavoriteSongRepository extends MongoRepository<UserFavoriteSong, String> {
    List<UserFavoriteSong> findByUserId(String userId);
    boolean existsByUserIdAndSongId(String userId, String songId);
    void deleteByUserIdAndSongId(String userId, String songId);
}