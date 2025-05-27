package com.music.newnewmusic.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_favorite_songs")
public class UserFavoriteSong {

    @Id
    private String id;

    private String userId;

    private String songId; 
    private String songTitle;
    private String songArtist;

    public UserFavoriteSong() {
    }

    public UserFavoriteSong(String userId, String songId, String songTitle, String songArtist) {
        this.userId = userId;
        this.songId = songId;
        this.songTitle = songTitle;
        this.songArtist = songArtist;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public String getSongTitle() {
        return songTitle;
    }

    public void setSongTitle(String songTitle) {
        this.songTitle = songTitle;
    }

    public String getSongArtist() {
        return songArtist;
    }

    public void setSongArtist(String songArtist) {
        this.songArtist = songArtist;
    }
}