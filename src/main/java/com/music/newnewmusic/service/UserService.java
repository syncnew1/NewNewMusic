package com.music.newnewmusic.service;

import com.music.newnewmusic.model.User;
import com.music.newnewmusic.payload.request.PasswordUpdateRequest;
import com.music.newnewmusic.payload.request.ProfileUpdateRequest;
import com.music.newnewmusic.repository.SongRepository;
import com.music.newnewmusic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    SongRepository songRepository;

    @Transactional
    public User updateUserProfile(String userId, ProfileUpdateRequest profileUpdateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Check if username is changing and if new username is already taken
        if (!user.getUsername().equals(profileUpdateRequest.getUsername()) && userRepository.existsByUsername(profileUpdateRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        // Check if email is changing and if new email is already taken
        if (!user.getEmail().equals(profileUpdateRequest.getEmail()) && userRepository.existsByEmail(profileUpdateRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        user.setUsername(profileUpdateRequest.getUsername());
        user.setEmail(profileUpdateRequest.getEmail());
        // Add other updatable fields here if necessary
        return userRepository.save(user);
    }

    @Transactional
    public void updateUserPassword(String userId, PasswordUpdateRequest passwordUpdateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!passwordEncoder.matches(passwordUpdateRequest.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Incorrect current password.");
        }

        if (!passwordUpdateRequest.getNewPassword().equals(passwordUpdateRequest.getConfirmNewPassword())) {
            throw new RuntimeException("Error: New passwords do not match.");
        }

        user.setPassword(passwordEncoder.encode(passwordUpdateRequest.getNewPassword()));
        userRepository.save(user);
    }

}