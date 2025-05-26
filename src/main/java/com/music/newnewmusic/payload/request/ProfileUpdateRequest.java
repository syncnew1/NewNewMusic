package com.music.newnewmusic.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    // Add other fields that can be updated, e.g., profilePictureUrl, bio
    // private String profilePictureUrl;
    // private String bio;

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

    // public String getProfilePictureUrl() {
    //     return profilePictureUrl;
    // }

    // public void setProfilePictureUrl(String profilePictureUrl) {
    //     this.profilePictureUrl = profilePictureUrl;
    // }

    // public String getBio() {
    //     return bio;
    // }

    // public void setBio(String bio) {
    //     this.bio = bio;
    // }
}