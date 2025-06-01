package com.music.newnewmusic.repository;

import com.music.newnewmusic.model.Song;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SongRepository extends MongoRepository<Song, String> {
    List<Song> findByTitleContainingIgnoreCase(String title);
    // 查找艺术家列表包含给定艺术家姓名的歌曲
    List<Song> findByArtist(String artist);
    List<Song> findByAlbumContainingIgnoreCase(String album);
    List<Song> findByGenreContainingIgnoreCase(String genre);
}