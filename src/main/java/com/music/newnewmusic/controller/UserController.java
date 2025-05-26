package com.music.newnewmusic.controller;

import com.music.newnewmusic.model.User;
import com.music.newnewmusic.payload.request.PasswordUpdateRequest;
import com.music.newnewmusic.payload.request.ProfileUpdateRequest;
import com.music.newnewmusic.payload.response.MessageResponse;
import com.music.newnewmusic.repository.UserRepository;
import com.music.newnewmusic.security.UserDetailsImpl;
import com.music.newnewmusic.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody ProfileUpdateRequest profileUpdateRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            User updatedUser = userService.updateUserProfile(userDetails.getId(), profileUpdateRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> updateUserPassword(@Valid @RequestBody PasswordUpdateRequest passwordUpdateRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            userService.updateUserPassword(userDetails.getId(), passwordUpdateRequest);
            return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

}