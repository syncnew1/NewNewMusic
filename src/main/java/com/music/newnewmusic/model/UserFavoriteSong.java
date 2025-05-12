package com.music.newnewmusic.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_favorite_songs")
public class UserFavoriteSong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "song_id", nullable = false)
    private String songId; // Storing MongoDB ObjectId as String

    public UserFavoriteSong() {
    }

    public UserFavoriteSong(Long userId, String songId) {
        this.userId = userId;
        this.songId = songId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }
}