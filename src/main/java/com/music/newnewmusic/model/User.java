package com.music.newnewmusic.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String username;

    private String email;

    private String password;

    private Set<Role> roles = new HashSet<>();

    private Set<String> favoriteSongIds = new HashSet<>(); // Added favoriteSongIds field

    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    // Getter and Setter for favoriteSongIds
    public Set<String> getFavoriteSongIds() {
        return favoriteSongIds;
    }

    public void setFavoriteSongIds(Set<String> favoriteSongIds) {
        this.favoriteSongIds = favoriteSongIds;
    }
}